/**
 * CONTEXT: starts a new component. `npm run new:component -- <name> --kind <kind> --plugin <plugin>`
 *
 *   name     kebab-case, the one name in every layer (docs/architecture.md, "Naming").
 *   --kind   `content` (works without JavaScript; saved as HTML) or `interactive` (built in the
 *            browser). See "Two kinds of component".
 *   --plugin the WordPress plugin whose plugin.json will list the block, e.g. `ucf-content`.
 *   --title  optional display name; defaults to the name in title case.
 *
 * Asks for whichever of kind and plugin is missing when run in a terminal.
 *
 * It writes components/{name}/, a working copy of the closer of `stat` and `degree-finder`
 * reduced to one prop, and adds the component to every list that names components by hand:
 * package.json `exports`, the plugin's plugin.json, and the component lists in
 * components/_config/{parity,blocks,puck}.test.tsx. The result passes `npm run check` and
 * `npm run test:stories` as written, so every later failure is the new code's.
 *
 * WHY all or nothing: every change is worked out before any file is written, so a bad name or
 * a list this script can't find leaves the repo as it was.
 */
import { execFileSync } from 'node:child_process';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const KINDS = [ 'content', 'interactive' ];

// WHY: `ucf-c-panel` is the component layer's panel class (docs/architecture.md).
// components/_config/ needs no entry: a name must start with a letter.
const RESERVED = new Set( [ 'panel' ] );

/**
 * Every spelling of one component name.
 *
 * @param {string}  name  kebab-case, e.g. `tuition-calculator`.
 * @param {string=} title The display name, if not the name in title case.
 * @return {{ name: string, Name: string, camel: string, title: string }} The spellings.
 */
export function componentNames( name, title ) {
	if ( ! /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test( name ) ) {
		throw new Error(
			`"${ name }" is not a kebab-case name: use lowercase letters, digits and single hyphens, starting with a letter (e.g. "tuition-calculator").`
		);
	}
	if ( RESERVED.has( name ) ) {
		throw new Error( `"${ name }" is reserved.` );
	}
	const words = name.split( '-' );
	const cap = ( word ) => word[ 0 ].toUpperCase() + word.slice( 1 );
	return {
		name,
		Name: words.map( cap ).join( '' ),
		camel: words[ 0 ] + words.slice( 1 ).map( cap ).join( '' ),
		title: title || words.map( cap ).join( ' ' ),
	};
}

/**
 * The plugins a block can go in: every folder under plugins/ with a plugin.json.
 *
 * @param {string} root The repo.
 * @return {string[]} Their names.
 */
export function pluginNames( root ) {
	const dir = path.join( root, 'plugins' );
	return existsSync( dir )
		? readdirSync( dir ).filter( ( name ) =>
				existsSync( path.join( dir, name, 'plugin.json' ) )
			)
		: [];
}

/**
 * Work out every file to write, without writing any.
 *
 * @param {Object}  options
 * @param {string}  options.root   The repo.
 * @param {string}  options.name   kebab-case.
 * @param {string}  options.kind   `content` or `interactive`.
 * @param {string}  options.plugin A plugin under plugins/.
 * @param {string=} options.title  The display name.
 * @return {Map<string, string>} Repo-relative path → contents, new files and edited ones.
 */
export function planComponent( { root, name, kind, plugin, title } ) {
	const names = componentNames( name, title );
	if ( ! KINDS.includes( kind ) ) {
		throw new Error(
			`--kind must be ${ KINDS.join( ' or ' ) }, not "${ kind }".`
		);
	}
	const plugins = pluginNames( root );
	if ( ! plugins.includes( plugin ) ) {
		throw new Error(
			`--plugin must be one of ${ plugins.join( ', ' ) }, not "${ plugin }".`
		);
	}
	if ( existsSync( path.join( root, 'components', name ) ) ) {
		throw new Error( `components/${ name } already exists.` );
	}

	const n = { ...names, plugin, block: `${ plugin }/${ name }` };
	const files = new Map();
	const templates =
		kind === 'content' ? contentFiles( n ) : interactiveFiles( n );
	for ( const [ file, contents ] of Object.entries( templates ) ) {
		files.set( `components/${ name }/${ file }`, contents );
	}

	const edit = ( file, change ) => {
		const full = path.join( root, file );
		if ( ! existsSync( full ) ) {
			throw new Error( `${ file } is missing.` );
		}
		files.set( file, change( readFileSync( full, 'utf8' ), file ) );
	};

	edit( 'package.json', ( source ) => addExports( source, n, kind ) );
	edit( `plugins/${ plugin }/plugin.json`, ( source ) => {
		const json = JSON.parse( source );
		json.blocks = [ ...json.blocks, name ];
		return JSON.stringify( json, null, '\t' ) + '\n';
	} );
	edit( 'components/_config/parity.test.tsx', ( source, file ) =>
		addToList( source, file, 'expect( components ).toEqual(', name )
	);
	edit( 'components/_config/blocks.test.tsx', ( source, file ) =>
		addToList( source, file, "test( 'finds every block'", name )
	);
	edit( 'components/_config/puck.test.tsx', ( source, file ) =>
		addPuckConfig( source, file, n )
	);

	return files;
}

/**
 * Write a plan from planComponent().
 *
 * @param {string}              root  The repo.
 * @param {Map<string, string>} files Repo-relative path → contents.
 */
export function writePlan( root, files ) {
	for ( const [ file, contents ] of files ) {
		const full = path.join( root, file );
		mkdirSync( path.dirname( full ), { recursive: true } );
		writeFileSync( full, contents );
	}
}

function addExports( source, n, kind ) {
	const json = JSON.parse( source );
	const dist = `./dist/${ n.name }`;
	json.exports[ `./${ n.name }` ] = {
		types: `${ dist }/index.d.ts`,
		default: `${ dist }/index.js`,
	};
	json.exports[ `./${ n.name }/puck` ] = {
		types: `${ dist }/adapters/puck/config.d.ts`,
		default: `${ dist }/adapters/puck/config.js`,
	};
	if ( kind === 'content' ) {
		json.exports[ `./${ n.name }/example.json` ] = `${ dist }/example.json`;
	}
	return JSON.stringify( json, null, '\t' ) + '\n';
}

/**
 * Add a name to the first `[ '…', '…' ]` list after `anchor`, kept sorted.
 *
 * @param {string} source The file.
 * @param {string} file   Its path, for the error.
 * @param {string} anchor Text just before the list.
 * @param {string} name   What to add.
 * @return {string} The file with the name added.
 */
function addToList( source, file, anchor, name ) {
	const at = source.indexOf( anchor );
	const open = at < 0 ? -1 : source.indexOf( '[', at );
	const close = open < 0 ? -1 : source.indexOf( ']', open );
	if ( close < 0 ) {
		throw new Error( `Can't find the component list in ${ file }.` );
	}
	const items = [ ...source.slice( open, close ).matchAll( /'([^']+)'/g ) ]
		.map( ( match ) => match[ 1 ] )
		.concat( name )
		.sort();
	return (
		source.slice( 0, open ) +
		`[ ${ items.map( ( item ) => `'${ item }'` ).join( ', ' ) } ]` +
		source.slice( close + 1 )
	);
}

// The three places puck.test.tsx names each config: its import, CONFIGS and the type check.
function addPuckConfig( source, file, n ) {
	const imports = [
		...source.matchAll(
			/^import \w+ from '\.\.\/[^']+\/adapters\/puck\/config\.tsx';\n/gm
		),
	];
	const configs = source.indexOf( 'const CONFIGS = {' );
	const configsEnd = configs < 0 ? -1 : source.indexOf( '\n};', configs );
	const checks = [
		...source.matchAll(
			/^\w+ satisfies ComponentConfig< PropsOf< typeof \w+ > >;\n/gm
		),
	];
	if ( ! imports.length || configsEnd < 0 || ! checks.length ) {
		throw new Error( `Can't find the config lists in ${ file }.` );
	}

	const first = imports[ 0 ].index;
	const last = imports.at( -1 ).index + imports.at( -1 )[ 0 ].length;
	const importLines = imports
		.map( ( match ) => match[ 0 ] )
		.concat(
			`import ${ n.camel } from '../${ n.name }/adapters/puck/config.tsx';\n`
		)
		.sort( ( a, b ) =>
			a.split( "'" )[ 1 ].localeCompare( b.split( "'" )[ 1 ] )
		);
	const lastCheck = checks.at( -1 ).index + checks.at( -1 )[ 0 ].length;
	const key = /^[A-Za-z_$][\w$]*$/.test( n.title )
		? n.title
		: `'${ n.title }'`;

	// Edit from the end back, so earlier offsets stay right.
	let out = source;
	out =
		out.slice( 0, lastCheck ) +
		`${ n.camel } satisfies ComponentConfig< PropsOf< typeof ${ n.camel } > >;\n` +
		out.slice( lastCheck );
	out =
		out.slice( 0, configsEnd ) +
		`\n\t${ key }: ${ n.camel },` +
		out.slice( configsEnd );
	out = out.slice( 0, first ) + importLines.join( '' ) + out.slice( last );
	return out;
}

// ── Templates ────────────────────────────────────────────────────────────────────────────
// SYNC: modeled on components/stat (content) and components/degree-finder (interactive). When
// a convention changes there, change it here too.

const blockJson = ( n, attributes, extra ) =>
	JSON.stringify(
		{
			$schema: 'https://schemas.wp.org/trunk/block.json',
			apiVersion: 3,
			name: n.block,
			title: n.title,
			category: 'ucf',
			description: `The ${ n.title }.`,
			keywords: [ n.title.toLowerCase() ],
			textdomain: n.plugin,
			attributes: Object.fromEntries(
				attributes.map( ( key ) => [
					key,
					{ type: 'string', default: '' },
				] )
			),
			supports: { html: false },
			editorScript: 'file:./index.tsx',
			...extra,
		},
		null,
		'\t'
	) + '\n';

function contentFiles( n ) {
	return {
		[ `${ n.Name }.tsx` ]: `/**
 * CONTEXT: the ${ n.title }, a content component. Every host renders this one file.
 *
 * A content core takes props and returns markup, nothing else: no runtime imports (\`import
 * type\` only), no state, effects or data fetching. WordPress's \`save()\` renders it once, to a
 * string, and stores the result in the post. Anything host-specific comes in through a slot
 * (docs/architecture.md, "Slots").
 *
 * SYNC: WordPress stores what this returns in every post that uses the block. Once a site uses
 * it, changing the markup needs a major version and a \`deprecated\` entry in
 * adapters/wp/index.tsx (docs/architecture.md, "Changing a content component's markup").
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ${ n.Name }Props = {
	/** The text. */
	text: ReactNode;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function ${ n.Name }( {
	text,
	className,
	...wrapperProps
}: ${ n.Name }Props ) {
	return (
		<div
			{ ...wrapperProps }
			className={ [ className, 'ucf-c', 'ucf-c-${ n.name }' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<p className="ucf-c-${ n.name }__text">{ text }</p>
		</div>
	);
}
`,
		'index.ts': `export { default as ${ n.Name }, type ${ n.Name }Props } from './${ n.Name }.tsx';
`,
		'example.json': `{
	"text": "Sample text for the ${ n.title }."
}
`,
		'style.css': `/*
 * CONTEXT: the ${ n.title }'s styles, for every host.
 *
 * Reads only \`--ucf-*\` names, and colors only as component-layer roles (\`--ucf-c-body\` and
 * so on). The root carries \`ucf-c\`, a component that sits on the section, so the roles are
 * the section's (docs/architecture.md, "The component layer").
 *
 * UPSTREAM: wp-scripts only emits a front-end stylesheet for a file named \`style.css\`.
 */
.ucf-c-${ n.name } {
	color: var(--ucf-c-body);
}

.ucf-c-${ n.name }__text {
	margin: 0;
}
`,
		[ `${ n.Name }.stories.tsx` ]: `import type { Meta, StoryObj } from '@storybook/react-vite';

import ${ n.Name } from './${ n.Name }.tsx';
import example from './example.json';
import './style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/${ n.title }',
	tags: [ 'server' ],
	component: ${ n.Name },
	// WHY example.json: the same props the WordPress inserter preview and the markup test use.
	args: example,
} satisfies Meta< typeof ${ n.Name } >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
`,
		[ `${ n.Name }.test.tsx` ]: `/**
 * The markup contract: WordPress's serializer and React DOM's produce the same HTML, and it
 * matches the committed snapshot. See components/stat/Stat.test.tsx for why.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import ${ n.Name }, { type ${ n.Name }Props } from './${ n.Name }.tsx';
import example from './example.json';

// What \`useBlockProps.save()\` adds for this block.
// SYNC: the block name in adapters/wp/block.json.
const WP_WRAPPER = { className: 'wp-block-${ n.block.replace( '/', '-' ) }' };

const cases: Record< string, ${ n.Name }Props > = {
	example,
};

describe( '${ n.Name }', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( \`renders the same in WordPress and React: \${ name }\`, () => {
			const element = <${ n.Name } { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}
} );
`,
		'adapters/puck/config.tsx': `/**
 * The ${ n.title } for Puck: a plain config object, so this library needs no Puck dependency.
 *
 * WHY only string props: the same plain strings are what the WordPress block stores, so
 * content can move between the two hosts as-is.
 */
import ${ n.Name } from '../../${ n.Name }.tsx';
// WHY the attribute: the npm package is plain ES modules, and Node will not import JSON
// without it.
import example from '../../example.json' with { type: 'json' };
import type { PuckComponentConfig } from '../../../_config/puck.ts';

type Props = {
	text: string;
};

const config: PuckComponentConfig< Props > = {
	label: '${ n.title }',
	fields: {
		text: { type: 'textarea', label: 'Text' },
	},
	defaultProps: example,
	// FIX: pass only the core's own props. It spreads the rest onto its <div>, so Puck's \`id\`,
	// \`puck\` and \`editMode\` would end up in the markup (see PuckRenderProps in _config/puck.ts).
	render: ( { text } ) => <${ n.Name } text={ text } />,
};

export default config;
`,
		'adapters/wp/block.json': blockJson( n, [ 'text' ], {
			style: 'file:./style-index.css',
		} ),
		'adapters/wp/index.tsx': `/**
 * Editor entry: registers the ${ n.title } block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import '../../style.css';
import example from '../../example.json';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same casts in components/stat/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	example: {
		attributes: example,
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
`,
		'adapters/wp/edit.tsx': `import { __ } from '@wordpress/i18n';
import {
	PlainText as UntypedPlainText,
	useBlockProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import type { ComponentType } from 'react';

import ${ n.Name } from '../../${ n.Name }.tsx';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

// SYNC: the attributes in block.json.
export type Attributes = {
	text: string;
};

/**
 * The editor view: the core component, with fields in its slots.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	return (
		<${ n.Name }
			{ ...useBlockProps() }
			text={
				<PlainText
					value={ attributes.text }
					onChange={ ( text ) => setAttributes( { text } ) }
					placeholder={ __( 'Text', '${ n.plugin }' ) }
					aria-label={ __( 'Text', '${ n.plugin }' ) }
				/>
			}
		/>
	);
}
`,
		'adapters/wp/save.tsx': `import { useBlockProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import ${ n.Name } from '../../${ n.Name }.tsx';
import type { Attributes } from './edit.tsx';

/**
 * The stored markup: the core component, with strings in its slots.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	return <${ n.Name } { ...useBlockProps.save() } text={ attributes.text } />;
}
`,
	};
}

function interactiveFiles( n ) {
	const prefix = n.plugin.replace( /-/g, '_' );
	return {
		[ `${ n.Name }.tsx` ]: `'use client';
/**
 * CONTEXT: the ${ n.title }, an interactive component.
 *
 * An interactive component may hold state, run effects and fetch data, because no host saves
 * its HTML. WordPress mounts it from adapters/wp/view.tsx into the container render.php writes;
 * Next, Puck and other React hosts render it directly. The \`'use client'\` above is what Next
 * needs.
 *
 * The counter is a placeholder that shows state working in every host. Replace it.
 */
import { useState } from 'react';

import { DEFAULTS } from './defaults.ts';

export interface ${ n.Name }Props {
	/** The label above the control. */
	label?: string;
}

export default function ${ n.Name }( {
	label = DEFAULTS.label,
}: ${ n.Name }Props ) {
	const [ count, setCount ] = useState( 0 );

	return (
		<div className="ucf-c-panel ucf-c-${ n.name }">
			<p className="ucf-c-${ n.name }__label">{ label }</p>
			<button
				type="button"
				className="ucf-c-${ n.name }__button"
				onClick={ () => setCount( ( value ) => value + 1 ) }
			>
				Clicked { count } { count === 1 ? 'time' : 'times' }
			</button>
		</div>
	);
}
`,
		'defaults.ts': `/**
 * CONTEXT: the ${ n.title }'s default props. The component, the WordPress block and the Puck
 * config all read them from here, so the three never disagree.
 */
export const DEFAULTS = Object.freeze( {
	label: '${ n.title }',
} );
`,
		'index.ts': `export {
	default,
	default as ${ n.Name },
	type ${ n.Name }Props,
} from './${ n.Name }.tsx';
export { DEFAULTS } from './defaults.ts';
`,
		'style.css': `/*
 * CONTEXT: the ${ n.title }'s styles, for every host.
 *
 * Reads only \`--ucf-*\` names, and colors only as component-layer roles (\`--ucf-c-body\` and
 * so on). The root carries \`ucf-c-panel\`, a component that paints its own ground, so the
 * roles are the section's panel roles (docs/architecture.md, "The component layer").
 *
 * UPSTREAM: wp-scripts only emits a front-end stylesheet for a file named \`style.css\`.
 */
.ucf-c-${ n.name } {
	background: var(--ucf-c-raised);
	color: var(--ucf-c-body);
	display: grid;
	gap: var(--ucf-spacing-30);
	justify-items: start;
	padding: var(--ucf-spacing-50);
}

.ucf-c-${ n.name }__label {
	margin: 0;
}

.ucf-c-${ n.name }__button {
	background: var(--ucf-c-accent);
	border: 0;
	color: var(--ucf-c-on-accent);
	cursor: pointer;
	font: inherit;
	padding: var(--ucf-spacing-30) var(--ucf-spacing-50);
}

.ucf-c-${ n.name }__button:focus-visible {
	outline: 2px solid var(--ucf-c-focus);
	outline-offset: 2px;
}
`,
		[ `${ n.Name }.stories.tsx` ]: `import type { Meta, StoryObj } from '@storybook/react-vite';

import ${ n.Name } from './${ n.Name }.tsx';
import './style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Interactive (Client)/${ n.title }',
	tags: [ 'client' ],
	component: ${ n.Name },
} satisfies Meta< typeof ${ n.Name } >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
`,
		'adapters/puck/config.tsx': `/**
 * The ${ n.title } for Puck: a plain config object, so this library needs no Puck dependency.
 */
import ${ n.Name } from '../../${ n.Name }.tsx';
import { DEFAULTS } from '../../defaults.ts';
import type { PuckComponentConfig } from '../../../_config/puck.ts';

type Props = {
	/** The label, or '' for the default. */
	label: string;
};

const config: PuckComponentConfig< Props > = {
	label: '${ n.title }',
	fields: {
		label: { type: 'text', label: 'Label' },
	},
	defaultProps: { label: DEFAULTS.label },
	render: ( { label } ) => <${ n.Name } label={ label || undefined } />,
};

export default config;
`,
		'adapters/wp/block.json': blockJson( n, [ 'label' ], {
			viewScript: 'file:./view.tsx',
			style: 'file:./style-view.css',
			render: 'file:./render.php',
		} ),
		'adapters/wp/index.tsx': `/**
 * Editor entry: registers the ${ n.title } block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';

// UPSTREAM: see the same cast in components/stat/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	edit: Edit,
	// WHY null: a dynamic block. render.php builds the front end on every request, so the
	// post stores only the attributes.
	save: () => null,
} );
`,
		'adapters/wp/edit.tsx': `import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import ${ n.Name } from '../../${ n.Name }.tsx';

// SYNC: the attributes in block.json.
export type Attributes = {
	/** The label, or '' for the default. */
	label: string;
};

/**
 * The editor shows the live component, so an editor can try it the way a visitor will.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', '${ n.plugin }' ) }>
					<TextControl
						__next40pxDefaultSize
						label={ __( 'Label', '${ n.plugin }' ) }
						value={ attributes.label }
						onChange={ ( label ) => setAttributes( { label } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				<${ n.Name } label={ attributes.label || undefined } />
			</div>
		</>
	);
}
`,
		'adapters/wp/settings.ts': `/**
 * The props WordPress hands the ${ n.title }: the block's attributes, which render.php writes
 * on the container as JSON.
 */
import type { ${ n.Name }Props } from '../../${ n.Name }.tsx';

/**
 * Read the settings render.php writes on the container. Bad or missing JSON falls back to the
 * component's own defaults rather than breaking the page.
 *
 * @param json The container's data attribute.
 * @return The props to pass.
 */
export function readSettings( json: string | null ): ${ n.Name }Props {
	if ( ! json ) {
		return {};
	}

	try {
		const value: unknown = JSON.parse( json );
		return value && typeof value === 'object'
			? ( value as ${ n.Name }Props )
			: {};
	} catch {
		return {};
	}
}
`,
		'adapters/wp/view.tsx': `/**
 * Front end: mounts the ${ n.title } in every block on the page.
 *
 * WHY createRoot from \`@wordpress/element\`: it is WordPress's copy of React, so the page loads
 * React once however many plugins use it.
 */
import { createRoot } from '@wordpress/element';

import ${ n.Name } from '../../${ n.Name }.tsx';
import '../../style.css';
import { readSettings } from './settings.ts';

// SYNC: the attribute render.php writes.
const ATTRIBUTE = 'data-ucf-${ n.name }';

function start() {
	document
		.querySelectorAll< HTMLElement >( \`[\${ ATTRIBUTE }]\` )
		.forEach( ( container ) => {
			const { label } = readSettings(
				container.getAttribute( ATTRIBUTE )
			);
			createRoot( container ).render(
				<${ n.Name } label={ label || undefined } />
			);
		} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}
`,
		'adapters/wp/render.php': `<?php
/**
 * Front-end markup for the ${ n.title } block.
 *
 * CONTEXT: an interactive block. This writes only a container carrying the block's attributes,
 * and view.tsx mounts the React component into it. Whatever is inside the container is what a
 * visitor without JavaScript, or a search engine, gets; React replaces it on load.
 *
 * @package ${ n.plugin }
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// SYNC: ATTRIBUTE in view.tsx.
$${ prefix }_${ n.name.replace( /-/g, '_' ) }_wrapper = get_block_wrapper_attributes(
	array(
		'data-ucf-${ n.name }' => wp_json_encode( $attributes ),
	)
);
?>
<div <?php echo $${ prefix }_${ n.name.replace( /-/g, '_' ) }_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- UPSTREAM: get_block_wrapper_attributes() escapes each attribute itself. ?>></div>
`,
	};
}

// ── Command line ─────────────────────────────────────────────────────────────────────────

function parseArgs( argv ) {
	const options = {};
	const rest = [];
	for ( let i = 0; i < argv.length; i++ ) {
		const match = argv[ i ].match( /^--(kind|plugin|title)(?:=(.*))?$/ );
		if ( match ) {
			options[ match[ 1 ] ] = match[ 2 ] ?? argv[ ++i ];
		} else if ( argv[ i ].startsWith( '-' ) ) {
			throw new Error( `Unknown option ${ argv[ i ] }.` );
		} else {
			rest.push( argv[ i ] );
		}
	}
	return { ...options, name: rest[ 0 ] };
}

async function ask( question, choices ) {
	const rl = createInterface( {
		input: process.stdin,
		output: process.stdout,
	} );
	try {
		for (;;) {
			const answer = (
				await rl.question(
					`${ question } (${ choices.join( ' / ' ) }): `
				)
			).trim();
			if ( choices.includes( answer ) ) {
				return answer;
			}
		}
	} finally {
		rl.close();
	}
}

async function main() {
	const root = path.dirname(
		path.dirname( fileURLToPath( import.meta.url ) )
	);
	const options = parseArgs( process.argv.slice( 2 ) );
	const usage =
		'Usage: npm run new:component -- <name> --kind content|interactive --plugin <plugin> [--title "Display Name"]';

	if ( ! options.name ) {
		throw new Error( usage );
	}
	componentNames( options.name, options.title );
	if ( process.stdin.isTTY ) {
		options.kind ??= await ask( 'Kind', KINDS );
		options.plugin ??= await ask( 'Plugin', pluginNames( root ) );
	}
	if ( ! options.kind || ! options.plugin ) {
		throw new Error( usage );
	}

	const files = planComponent( { root, ...options } );
	writePlan( root, files );

	// WHY: the templates and the edited lists are close to Prettier's format, not exactly it.
	const formattable = [ ...files.keys() ].filter(
		( file ) => ! file.endsWith( '.php' )
	);
	execFileSync(
		path.join( root, 'node_modules/.bin/prettier' ),
		[ '--write', '--log-level=warn', ...formattable ],
		{ cwd: root, stdio: 'inherit' }
	);

	const { Name } = componentNames( options.name );
	const created = [ ...files.keys() ].filter( ( file ) =>
		file.startsWith( `components/${ options.name }/` )
	);
	const edited = [ ...files.keys() ].filter(
		( file ) => ! created.includes( file )
	);
	console.log(
		`\nCreated components/${ options.name }/ (${ created.length } files).`
	);
	console.log(
		`Added it to:\n${ edited.map( ( file ) => `  ${ file }` ).join( '\n' ) }`
	);
	console.log( `
Next:
  1. Replace the placeholder prop and markup in ${ Name }.tsx, and keep the block attributes
     (adapters/wp/block.json), the Puck fields and ${ options.kind === 'content' ? 'example.json' : 'defaults.ts' } naming the same props.
  2. Write the block's description in adapters/wp/block.json.${
		options.kind === 'interactive'
			? `
  3. If it fetches data, add client.ts, client.test.ts and sample-client.ts like degree-finder's.
     If it has site settings, add a settings function to plugins/${ options.plugin }/${ options.plugin }.php.`
			: `
  3. Run \`npm test\` to write the new markup snapshots, then review them: they are what every
     saved post will store.`
  }
  Then: npm run check && npm run test:stories` );
}

if (
	process.argv[ 1 ] &&
	import.meta.url === pathToFileURL( process.argv[ 1 ] ).href
) {
	main().catch( ( error ) => {
		console.error( error.message );
		process.exitCode = 1;
	} );
}
