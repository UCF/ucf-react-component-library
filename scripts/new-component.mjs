/**
 * CONTEXT: starts a new component. `npm run new:component -- <name> --kind <kind> --plugin
 * <plugin>`
 *
 *   name     kebab-case, the one name in every layer (docs/architecture.md, "Naming").
 *   --kind   `content` (works without JavaScript; saved as HTML), `live` (fetched, and written
 *            by the server on each request), `interactive` (built in the browser), or
 *            `primitive` (a piece components are built from: a button, an image). See "Three
 *            kinds of component" and "Primitives".
 *   --plugin the WordPress plugin whose plugin.json will list the block, e.g. `ucf-content`.
 *            Not for a primitive, which has no block of its own.
 *   --title  optional display name; defaults to the name in title case.
 *
 * Asks for whichever of kind and plugin is missing when run in a terminal.
 *
 * It writes components/{bucket}/{name}/ (content, live, interactive or primitives, by kind), a
 * working copy of the closest of `card`, `event-list`, `degree-finder` and `button` reduced to one prop (a content
 * component: one prop, two parts, one preset, built with frame()), and adds it to every list that names
 * components by hand: package.json `exports`, the plugin's plugin.json, and the lists in
 * integrations/tests/{parity,blocks,puck}.test.tsx. The result passes `npm run check` and
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

export const KINDS = [ 'content', 'live', 'interactive', 'primitive' ];

// Each kind's bucket under components/. SYNC: BUCKETS in scripts/plugins.cjs.
const BUCKET_OF = {
	content: 'content',
	live: 'live',
	interactive: 'interactive',
	primitive: 'primitives',
};
const BUCKETS = Object.values( BUCKET_OF );

// WHY: `ucf-c-panel` is the component layer's panel class (docs/architecture.md).
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
 * @param {string}  options.kind   `content`, `live`, `interactive` or `primitive`.
 * @param {string=} options.plugin A plugin under plugins/. Not for a primitive.
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
	const primitive = kind === 'primitive';
	const plugins = pluginNames( root );
	if ( ! primitive && ! plugins.includes( plugin ) ) {
		throw new Error(
			`--plugin must be one of ${ plugins.join( ', ' ) }, not "${ plugin }".`
		);
	}
	// WHY every bucket: one name may mean one thing only, in Puck's list, in imports and in
	// the package's paths, which leave the bucket out.
	for ( const bucket of BUCKETS ) {
		if ( existsSync( path.join( root, 'components', bucket, name ) ) ) {
			throw new Error(
				`components/${ bucket }/${ name } already exists.`
			);
		}
	}

	// The component's folder: its kind's bucket (docs/architecture.md, "A component's folder").
	const tier = `components/${ BUCKET_OF[ kind ] }`;
	const n = { ...names, tier, plugin, block: `${ plugin }/${ name }` };
	const files = new Map();
	const templates = {
		content: contentFiles,
		live: liveFiles,
		interactive: interactiveFiles,
		primitive: primitiveFiles,
	}[ kind ]( n );
	for ( const [ file, contents ] of Object.entries( templates ) ) {
		files.set( `${ tier }/${ name }/${ file }`, contents );
	}

	const edit = ( file, change ) => {
		const full = path.join( root, file );
		if ( ! existsSync( full ) ) {
			throw new Error( `${ file } is missing.` );
		}
		files.set( file, change( readFileSync( full, 'utf8' ), file ) );
	};

	edit( 'package.json', ( source ) => addExports( source, n, kind ) );
	edit( 'integrations/tests/parity.test.tsx', ( source, file ) =>
		addToList(
			source,
			file,
			primitive
				? 'expect( primitives ).toEqual('
				: 'expect( components ).toEqual(',
			name
		)
	);
	if ( ! primitive ) {
		edit( `plugins/${ plugin }/plugin.json`, ( source ) => {
			const json = JSON.parse( source );
			json.blocks = [ ...json.blocks, name ];
			return JSON.stringify( json, null, '\t' ) + '\n';
		} );
		edit( 'integrations/tests/blocks.test.tsx', ( source, file ) =>
			addToList( source, file, "test( 'finds every block'", name )
		);
	}
	edit( 'integrations/tests/puck.test.tsx', ( source, file ) =>
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

// WHY primitives under their own path (`@ucf/components/primitives/button`): a primitive and a
// component may one day share a word (an Image primitive, a Gallery's image), and the path
// says which tier a site is importing.
function addExports( source, n, kind ) {
	const json = JSON.parse( source );
	const dist = `./dist/${ n.tier }/${ n.name }`;
	const entry =
		kind === 'primitive' ? `./primitives/${ n.name }` : `./${ n.name }`;
	json.exports[ entry ] = {
		types: `${ dist }/index.d.ts`,
		default: `${ dist }/index.js`,
	};
	json.exports[ `${ entry }/puck` ] = {
		types: `${ dist }/integrations/puck/config.d.ts`,
		default: `${ dist }/integrations/puck/config.js`,
	};
	// WHY a primitive only: a content component's sample is its presets, not example.json.
	if ( kind === 'primitive' ) {
		json.exports[ `${ entry }/example.json` ] = `${ dist }/example.json`;
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
			/^import \w+ from '\.\.\/[^']+\/puck\/config\.tsx';\n/gm
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

	// FIX: insert the one new line in its sorted place. Rewriting the block from the lines the
	// pattern matched dropped any import between them that it didn't match (one split over
	// several lines, as `import card, { withTemplate }` is).
	const configPath = `${ `../../${ n.tier }` }/${ n.name }/integrations/puck/config.tsx`;
	const before = imports.find(
		( match ) =>
			match[ 0 ].split( "'" )[ 1 ].localeCompare( configPath ) > 0
	);
	const at = before
		? before.index
		: imports.at( -1 ).index + imports.at( -1 )[ 0 ].length;
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
	out =
		out.slice( 0, at ) +
		`import ${ n.camel } from '${ configPath }';\n` +
		out.slice( at );
	return out;
}

// ── Templates ────────────────────────────────────────────────────────────────────────────
// SYNC: modeled on components/content/card (content), components/live/event-list (live),
// components/interactive/degree-finder (interactive) and components/primitives/button
// (primitive). When a convention changes there,
// change it here too.

/**
 * A block's inserter category, from how it is built: its kind's.
 * SYNC: kindOf() and CATEGORY_OF in integrations/wp/kind.ts, and ucf_components_block_category()
 * in plugins/shared/shared.php.
 *
 * @param {Object} extra The block.json fields that set its kind: `render`, `viewScript`.
 * @return {string} The category.
 */
function categoryOf( extra ) {
	if ( ! extra.render ) {
		return 'ucf-content';
	}
	return extra.viewScript ? 'ucf-interactive' : 'ucf-live';
}

const blockJson = ( n, attributes, extra ) =>
	JSON.stringify(
		{
			$schema: 'https://schemas.wp.org/trunk/block.json',
			apiVersion: 3,
			name: n.block,
			title: n.title,
			category: categoryOf( extra ),
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
	// `pull-quote` → `PULL_QUOTE`, for the package entry's PARTS and PRESETS names.
	const NAME = n.name.toUpperCase().replace( /-/g, '_' );
	const root = '../../../../..';
	return {
		[ `${ n.Name }.tsx` ]: `/**
 * The ${ n.title }. Why it's built this way: docs/architecture.md, "Built with frame()".
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '../../../integrations/react/frame.tsx';
import { PARTS } from './${ n.Name }.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './${ n.Name }.presets.ts';
import { PROPS } from './${ n.Name }.props.ts';

/** Everything the ${ n.title } takes: its props, \`preset\`, \`content\`, and a site's HTML attributes. */
export type ${ n.Name }Props = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function ${ n.Name }Markup( {
	contentAlign = PROPS.contentAlign.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-${ n.name }' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-align={ contentAlign === 'start' ? undefined : contentAlign }
		>
			{ area(
				'content',
				{ className: 'ucf-c-${ n.name }__content' },
				children
			) }
		</div>
	);
}

/**
 * The ${ n.title }. Start from a preset and fill its parts, or pass any children:
 *
 *   <${ n.Name } preset="standard" content={ { title: 'A title' } } />
 *
 * Its props, presets and parts: ${ n.Name }.props.ts, ${ n.Name }.presets.ts, ${ n.Name }.parts.ts.
 */
const ${ n.Name } = frame( ${ n.Name }Markup, {
	// Who it is
	slug: '${ n.name }',
	title: '${ n.title }', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'postFeaturedImage',
} );

export default ${ n.Name };
`,
		[ `${ n.Name }.props.ts` ]: `/**
 * The ${ n.title }'s props, in the order editors see them. Each key is a saved block attribute.
 * SYNC: block.json's attributes; integrations/tests/parity.test.tsx checks. Renaming one needs a
 * block deprecation.
 */
import type {
	PropDefinitions,
	PropsOf,
} from '../../../integrations/schema/props.ts';

export const PROPS = {
	/** The content's alignment, across. */
	contentAlign: {
		type: 'choice',
		label: 'Align',
		panel: '${ n.title }',
		control: 'radio',
		options: [
			{ value: 'start', label: 'Start' },
			{ value: 'center', label: 'Center' },
		],
		default: 'start',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type ${ n.Name }EditableProps = PropsOf< typeof PROPS >;
`,
		[ `${ n.Name }.parts.ts` ]: `/**
 * The ${ n.title }'s parts: what goes inside it, each with its kind and the class that styles it.
 * SYNC: style.css styles every class here; tests/${ n.Name }.test.tsx checks.
 */
import type {
	PartDefinitions,
	PartOf,
} from '../../../integrations/schema/parts.ts';

export const PARTS = {
	/** The title. */
	title: { kind: 'heading', className: 'ucf-c-${ n.name }__title' },
	/** One or two sentences. */
	text: { kind: 'text', className: 'ucf-c-${ n.name }__text' },
} as const satisfies PartDefinitions;

/** A part in a preset: \`{ part: 'title', level: 2, text: 'A title' }\`. */
export type Part = PartOf< typeof PARTS >;
`,
		[ `${ n.Name }.presets.ts` ]: `/**
 * The ${ n.title }'s presets: its designs, each a mix of props and parts. WordPress shows each as
 * a variation, Puck in its Design picker.
 */
import type { Part } from './${ n.Name }.parts.ts';
import type { ${ n.Name }EditableProps } from './${ n.Name }.props.ts';
import {
	findPreset,
	type Preset as PresetOf,
} from '../../../integrations/schema/presets.ts';

export type Preset = PresetOf< ${ n.Name }EditableProps, Part >;

// WHY \`as const\`: the names and parts stay exact, so \`preset\` and \`content\` are typed.
export const PRESETS = [
	{
		name: 'standard',
		title: '${ n.title }: Standard',
		description: 'A title and a sentence.',
		wpIcon: 'postFeaturedImage',
		props: { contentAlign: 'start' },
		parts: [
			{ part: 'title', level: 2, text: 'A title for the ${ n.title }' },
			{ part: 'text', text: 'One or two sentences.' },
		],
	},
] as const satisfies readonly Preset[];

// A preset by its name.
export const presetNamed = ( name: string ): Preset =>
	findPreset( PRESETS, name );

/** What a new ${ n.title } starts with: a start, not a lock. */
export const DEFAULT_PRESET: Preset = presetNamed( 'standard' );
`,
		'index.ts': `/**
 * \`@ucf/components/${ n.name }\`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as ${ n.Name }, type ${ n.Name }Props } from './${ n.Name }.tsx';

// Its pieces, for a site that builds its own

export { PARTS as ${ NAME }_PARTS } from './${ n.Name }.parts.ts';
export { PRESETS as ${ NAME }_PRESETS } from './${ n.Name }.presets.ts';
`,
		'style.css': `/*
 * The ${ n.title }'s styles, for every host.
 *
 * Reads only \`--ucf-*\` names, and colors only as component-layer roles (\`--ucf-c-body\` and
 * so on). The root carries \`ucf-c\`, so the roles are the section's (docs/architecture.md).
 * SYNC: every class in ${ n.Name }.parts.ts.
 * UPSTREAM: wp-scripts only emits a front-end stylesheet for a file named \`style.css\`.
 */
.ucf-c-${ n.name } {
	color: var(--ucf-c-body);
}

.ucf-c-${ n.name }[data-align="center"] {
	text-align: center;
}

.ucf-c-${ n.name } .ucf-c-${ n.name }__title {
	margin: 0 0 0.5em;
}

.ucf-c-${ n.name } .ucf-c-${ n.name }__text {
	margin: 0;
}
`,
		[ `integrations/storybook/${ n.Name }.stories.tsx` ]: `/**
 * The ${ n.title }: its default preset, and its props as controls.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '${ root }/integrations/schema/props.ts';
import { argTypesOf } from '${ root }/integrations/storybook/arg-types.ts';
import '${ root }/components/primitives/heading/style.css';
import '${ root }/components/primitives/paragraph/style.css';
import ${ n.Name } from '../../${ n.Name }.tsx';
import { PROPS } from '../../${ n.Name }.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/${ n.title }',
	tags: [ 'server' ],
	component: ${ n.Name },
	// WHY the defaults: what a new ${ n.title } starts with in WordPress and Puck.
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof ${ n.Name } >;

export default meta;

type Story = StoryObj< typeof meta >;

/** The standard preset, with its sample text. */
export const Standard: Story = { args: { preset: 'standard', sample: true } };
`,
		[ `tests/${ n.Name }.test.tsx` ]: `/**
 * The markup contract: WordPress's serializer and React DOM's produce the same HTML, and it
 * matches the committed snapshot. See components/content/highlight/tests/Highlight.test.tsx for
 * why.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import ${ n.Name }, { type ${ n.Name }Props } from '../${ n.Name }.tsx';
import { PARTS } from '../${ n.Name }.parts.ts';
import { PRESETS } from '../${ n.Name }.presets.ts';

// What \`useBlockProps.save()\` adds for this block.
// SYNC: the block name in wp/block.json.
const WP_WRAPPER = { className: 'wp-block-${ n.block.replace( '/', '-' ) }' };

const cases: Record< string, ${ n.Name }Props > = {
	defaults: {},
	// Each preset's props.
	...Object.fromEntries(
		PRESETS.map( ( preset ) => [ \`the \${ preset.name } preset\`, preset.props ] )
	),
};

describe( '${ n.Name }', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( \`renders the same in WordPress and React: \${ name }\`, () => {
			const element = (
				<${ n.Name } { ...WP_WRAPPER } { ...props }>
					<p>Content</p>
				</${ n.Name }>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: WordPress and Puck each edit the content through their own element. If the markup
	// rendered its children anywhere else, blocks dropped in would land outside it.
	it( 'renders its content area as the element a host passes for it', () => {
		const Zone = ( props: object ) => <div data-zone="" { ...props } />;
		expect(
			renderToStaticMarkup(
				<${ n.Name }.port.Frame areas={ { content: Zone } } />
			)
		).toContain( '<div data-zone="" class="ucf-c-${ n.name }__content">' );
	} );
} );

// WHY: a part class with no rule does nothing; an editor who picks it sees no change.
it( 'styles every part class', () => {
	const css = readFileSync( new URL( '../style.css', import.meta.url ), 'utf8' );
	const classes: ( string | undefined )[] = Object.values( PARTS ).map(
		( definition: { className?: string } ) => definition.className
	);
	expect(
		classes.filter(
			( className ) => className && ! css.includes( \`.\${ className }\` )
		)
	).toEqual( [] );
} );
`,
		'integrations/puck/config.tsx': `/** The ${ n.title } in Puck, from its port (integrations/puck/config.tsx). */
import { puckConfig } from '${ root }/integrations/puck/config.tsx';
import ${ n.Name } from '../../${ n.Name }.tsx';

const { config, TEMPLATE, withTemplate, withPreset } = puckConfig( ${ n.Name } );

export default config;
export { TEMPLATE, withTemplate, withPreset };
`,
		'integrations/wp/block.json': blockJson( n, [], {
			attributes: { contentAlign: { type: 'string', default: 'start' } },
			style: 'file:./style-index.css',
		} ),
		'integrations/wp/index.tsx': `/** Registers the ${ n.title }'s block: its settings from its port, and its edit and save. */
// WHY imported here: webpack builds the block's stylesheet from what its script imports.
import '../../style.css';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import { blockSettings } from '${ root }/integrations/wp/block.tsx';
import ${ n.Name } from '../../${ n.Name }.tsx';
import metadata from './block.json';
import edit from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript reads block.json's values as plain strings, not WordPress's types.
registerBlockType( metadata as unknown as BlockConfiguration, {
	...blockSettings( ${ n.Name } ),
	edit,
	save,
} );
`,
		'integrations/wp/edit.tsx': `/** The ${ n.title }'s editor view: its sidebar and its content, from its port. */
import { blockEdit } from '${ root }/integrations/wp/block.tsx';
import ${ n.Name } from '../../${ n.Name }.tsx';

export default blockEdit( ${ n.Name } );
`,
		'integrations/wp/save.tsx': `/**
 * What the ${ n.title }'s block stores in a post.
 * SYNC: stored in every post with the block; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '${ root }/integrations/wp/block.tsx';
import ${ n.Name } from '../../${ n.Name }.tsx';

export default blockSave( ${ n.Name } );
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
 * its HTML. WordPress mounts it from wp/view.tsx into the container render.php writes;
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
		[ `integrations/storybook/${ n.Name }.stories.tsx` ]: `import type { Meta, StoryObj } from '@storybook/react-vite';

import ${ n.Name } from '../../${ n.Name }.tsx';
import '../../style.css';

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
		'integrations/puck/config.tsx': `/**
 * The ${ n.title } for Puck: a plain config object, so this library needs no Puck dependency.
 */
import ${ n.Name } from '../../${ n.Name }.tsx';
import { DEFAULTS } from '../../defaults.ts';
import type { PuckComponentConfig } from '../../../../../integrations/puck/types.ts';

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
		'integrations/wp/block.json': blockJson( n, [ 'label' ], {
			viewScript: 'file:./view.tsx',
			style: 'file:./style-view.css',
			render: 'file:./render.php',
		} ),
		'integrations/wp/index.tsx': `/**
 * Editor entry: registers the ${ n.title } block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';

// UPSTREAM: see the same cast in components/content/highlight/integrations/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	edit: Edit,
	// WHY null: a dynamic block. render.php builds the front end on every request, so the
	// post stores only the attributes.
	save: () => null,
} );
`,
		'integrations/wp/edit.tsx': `import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
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
		'integrations/wp/settings.ts': `/**
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
		'integrations/wp/view.tsx': `/**
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
		'integrations/wp/render.php': `<?php
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

function liveFiles( n ) {
	// PHP names: `ucf-content` + `pull-quote` → `ucf_content_pull_quote_*`, prefixed by plugin.
	const fn = `${ n.plugin.replace( /-/g, '_' ) }_${ n.name.replace( /-/g, '_' ) }`;
	const NAME = n.name.toUpperCase().replace( /-/g, '_' );
	const root = '../../../../..';
	return {
		[ `${ n.Name }.tsx` ]: `/**
 * CONTEXT: the ${ n.title }, a live component: a list fetched from a feed, written into the page
 * on the server (docs/architecture.md, "Three kinds of component").
 *
 * Content rules apply to this core: props in, markup out, no state, no effects, no fetching.
 * Whoever renders it fetches first (client.ts, or client.php in WordPress) and passes \`items\`.
 *
 * SYNC: integrations/wp/markup.php writes this same markup in PHP. tests/${ n.Name }.php.test.tsx
 * fails when the two differ; change both together. Nothing stores it, so a change needs no
 * block deprecation.
 *
 * The linked list is a placeholder that shows data reaching every host. Replace it.
 */
import type { ${ n.Name }EditableProps } from './${ n.Name }.props.ts';
import type { ${ n.Name }Item } from './types.ts';

export type ${ n.Name }Props = Partial< Pick< ${ n.Name }EditableProps, 'title' > > & {
	/** The items to show, already fetched (client.ts). */
	items?: readonly ${ n.Name }Item[];
	/** Extra classes for the root, as a host adds its own. */
	className?: string;
};

export default function ${ n.Name }( {
	items = [],
	title = '',
	className,
}: ${ n.Name }Props ) {
	return (
		<div
			className={ [ className, 'ucf-c', 'ucf-c-${ n.name }' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ title ? (
				<p className="ucf-c-${ n.name }__title">{ title }</p>
			) : null }
			<ul className="ucf-c-${ n.name }__items">
				{ items.map( ( item ) => (
					<li className="ucf-c-${ n.name }__item" key={ item.id }>
						<a href={ item.url }>{ item.title }</a>
					</li>
				) ) }
			</ul>
		</div>
	);
}
`,
		[ `${ n.Name }.props.ts` ]: `/**
 * The ${ n.title }'s props: every prop an editor sets. WordPress's sidebar and block.json
 * attributes, Puck's fields and the stories' controls are built from it
 * (integrations/schema/props.ts).
 *
 * SYNC: each prop's key is a block attribute, saved in every post that uses the block, so it is
 * permanent (docs/architecture.md, "Naming"). \`npm run sync:blocks\` writes them into block.json.
 */
import type {
	PropDefinitions,
	PropsOf,
} from '../../../integrations/schema/props.ts';

export const PROPS = {
	/** Where the items come from: a JSON list of { id, title, url }. '' shows none. */
	feedUrl: {
		type: 'text',
		label: 'Feed URL',
		panel: 'Settings',
		default: '',
	},
	/** A line above the list, or '' for none. */
	title: {
		type: 'text',
		label: 'Title',
		panel: 'Settings',
		default: '',
	},
} as const satisfies PropDefinitions;

export type ${ n.Name }EditableProps = PropsOf< typeof PROPS >;
`,
		'types.ts': `/** One item as the ${ n.title } shows it, from client.ts (or client.php). */
export interface ${ n.Name }Item {
	id: string;
	title: string;
	url: string;
}
`,
		'client.ts': `/**
 * CONTEXT: the only code that knows the feed's response shape. Everything it returns is a
 * ${ n.Name }Item (types.ts).
 *
 * SYNC: integrations/wp/client.php does the same in PHP, step for step.
 * tests/${ n.Name }.php.test.tsx runs both on the same feed and fails when their markup differs.
 */
import type { ${ n.Name }Item } from './types.ts';

/**
 * The feed's items as ${ n.Name }Items: those without a title or URL dropped.
 *
 * @param feed The feed's JSON, parsed.
 * @return The items to show.
 */
export function normalizeItems( feed: unknown ): ${ n.Name }Item[] {
	if ( ! Array.isArray( feed ) ) {
		return [];
	}
	return ( feed as Record< string, unknown >[] ).flatMap( ( item ) => {
		const title = String( item?.title ?? '' ).trim();
		const url = String( item?.url ?? '' );
		return title && url ? [ { id: String( item.id ?? url ), title, url } ] : [];
	} );
}

export interface ${ n.Name }Client {
	getItems: ( options?: { signal?: AbortSignal } ) => Promise< ${ n.Name }Item[] >;
}

/**
 * A client for one feed.
 *
 * @param options         Which feed, and how to fetch it.
 * @param options.feedUrl The feed; with none, there are no items.
 * @param options.fetch   Replaces the global fetch, for tests.
 * @return A ${ n.Name }Client.
 */
export function createClient( {
	feedUrl = '',
	fetch: fetchFn = globalThis.fetch,
}: { feedUrl?: string; fetch?: typeof globalThis.fetch } = {} ): ${ n.Name }Client {
	return {
		async getItems( { signal } = {} ) {
			if ( ! feedUrl ) {
				return [];
			}
			const response = await fetchFn( feedUrl, {
				signal,
				headers: { Accept: 'application/json' },
			} );
			if ( ! response.ok ) {
				throw new Error(
					\`Request failed with status \${ response.status }: \${ feedUrl }\`
				);
			}
			return normalizeItems( await response.json() );
		},
	};
}
`,
		'sample-data.ts': `/** Sample items for the stories and tests. */
import type { ${ n.Name }Item } from './types.ts';

export const SAMPLE_ITEMS: readonly ${ n.Name }Item[] = [
	{ id: '1', title: 'First item', url: 'https://www.ucf.edu/' },
	{ id: '2', title: 'Second & “quoted” item', url: 'https://www.ucf.edu/about-ucf/' },
];
`,
		'utils/useItems.ts': `/**
 * The items for an editor's preview, fetched in the browser. WHY only for editors: a page a
 * visitor sees gets its items on the server, and the component itself never fetches.
 */
import { useEffect, useState } from 'react';

import { createClient } from '../client.ts';
import type { ${ n.Name }Item } from '../types.ts';

/**
 * Fetch a feed's items, again whenever the feed changes.
 *
 * @param feedUrl The feed.
 * @return The items, and whether the last request failed.
 */
export function useItems( feedUrl: string ) {
	const [ state, setState ] = useState< {
		items: readonly ${ n.Name }Item[];
		failed: boolean;
	} >( { items: [], failed: false } );

	useEffect( () => {
		const controller = new AbortController();
		createClient( { feedUrl } )
			.getItems( { signal: controller.signal } )
			.then(
				( items ) =>
					! controller.signal.aborted &&
					setState( { items, failed: false } ),
				() =>
					! controller.signal.aborted &&
					setState( { items: [], failed: true } )
			);
		return () => controller.abort();
	}, [ feedUrl ] );

	return state;
}
`,
		'index.ts': `/**
 * \`@ucf/components/${ n.name }\`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as ${ n.Name }, type ${ n.Name }Props } from './${ n.Name }.tsx';
export { PROPS as ${ NAME }_PROPS } from './${ n.Name }.props.ts';
export { createClient, normalizeItems } from './client.ts';
export type { ${ n.Name }Item } from './types.ts';
`,
		'style.css': `/*
 * CONTEXT: the ${ n.title }'s styles, for every host.
 *
 * Reads only \`--ucf-*\` names, and colors only as component-layer roles. The root carries
 * \`ucf-c\`, so its colors are the section's roles.
 *
 * UPSTREAM: wp-scripts only emits a front-end stylesheet for a file named \`style.css\`.
 */
.ucf-c-${ n.name } {
	color: var(--ucf-c-body);
}

.ucf-c-${ n.name }__title {
	font-weight: 700;
	margin: 0 0 var(--ucf-spacing-30);
}

.ucf-c-${ n.name }__items {
	margin: 0;
}

.ucf-c-${ n.name }__item a {
	color: var(--ucf-c-body);
}

.ucf-c-${ n.name }__item a:focus-visible {
	outline: 2px solid var(--ucf-c-focus);
	outline-offset: 2px;
}
`,
		[ `integrations/storybook/${ n.Name }.stories.tsx` ]: `import type { Meta, StoryObj } from '@storybook/react-vite';

import ${ n.Name } from '../../${ n.Name }.tsx';
import { SAMPLE_ITEMS } from '../../sample-data.ts';
import '../../style.css';

// WHY sample items, not the feed: a story must look the same on every run.
const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Live (Server)/${ n.title }',
	tags: [ 'server' ],
	component: ${ n.Name },
	args: { items: SAMPLE_ITEMS, title: '${ n.title }' },
} satisfies Meta< typeof ${ n.Name } >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
`,
		'integrations/puck/config.tsx': `/**
 * The ${ n.title } for Puck: a plain config object, so this library needs no Puck dependency.
 * WHY fetched in the browser here: Puck's editor renders on the client, and \`render\` can't
 * wait for data (components/live/event-list/integrations/puck/config.tsx).
 */
import { defaultsIn } from '${ root }/integrations/schema/props.ts';
import { puckFields } from '${ root }/integrations/puck/config.tsx';
import type { PuckComponentConfig } from '${ root }/integrations/puck/types.ts';
import ${ n.Name } from '../../${ n.Name }.tsx';
import { PROPS, type ${ n.Name }EditableProps } from '../../${ n.Name }.props.ts';
import { useItems } from '../../utils/useItems.ts';

/**
 * The list, fetched for the preview.
 *
 * @param props The stored props.
 */
function Preview( props: ${ n.Name }EditableProps ) {
	const { items } = useItems( props.feedUrl );
	return <${ n.Name } items={ items } title={ props.title } />;
}

const config: PuckComponentConfig< ${ n.Name }EditableProps > = {
	label: '${ n.title }',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	render: ( { feedUrl, title } ) => (
		<Preview feedUrl={ feedUrl } title={ title } />
	),
};

export default config;
`,
		'integrations/wp/block.json': blockJson( n, [ 'feedUrl', 'title' ], {
			style: 'file:./style-index.css',
			render: 'file:./render.php',
		} ),
		'integrations/wp/index.tsx': `/** Registers the ${ n.title }'s block. */
// WHY imported here: webpack builds the block's stylesheet from what its script imports.
import '../../style.css';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';

// UPSTREAM: TypeScript reads block.json's values as plain strings, not WordPress's types.
registerBlockType< Attributes >(
	metadata as unknown as BlockConfiguration< Attributes >,
	{
		edit: Edit,
		// WHY null: a live block. render.php writes it on every request, so the post stores
		// only the attributes.
		save: () => null,
	}
);
`,
		'integrations/wp/edit.tsx': `import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { Notice, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { panelsOf } from '${ root }/integrations/schema/props.ts';
import { FieldControl } from '${ root }/integrations/wp/inspector.tsx';
import ${ n.Name } from '../../${ n.Name }.tsx';
import { PROPS, type ${ n.Name }EditableProps } from '../../${ n.Name }.props.ts';
import { useItems } from '../../utils/useItems.ts';

export type Attributes = ${ n.Name }EditableProps;

/**
 * The editor shows the list from the feed, fetched in the browser. render.php writes the same
 * markup on the page.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { items, failed } = useItems( attributes.feedUrl );
	return (
		<>
			<InspectorControls>
				{ panelsOf( PROPS ).map( ( panel ) => (
					<PanelBody key={ panel.title } title={ panel.title }>
						{ panel.keys.map( ( key ) => (
							<FieldControl
								key={ key }
								definition={ PROPS[ key ] }
								value={ attributes[ key ] }
								onChange={ ( value ) =>
									setAttributes( { [ key ]: value } )
								}
							/>
						) ) }
					</PanelBody>
				) ) }
			</InspectorControls>
			<div { ...useBlockProps() }>
				{ failed ? (
					<Notice status="warning" isDismissible={ false }>
						{ __( 'The feed could not be loaded.', '${ n.plugin }' ) }
					</Notice>
				) : null }
				<${ n.Name } items={ items } title={ attributes.title } />
			</div>
		</>
	);
}
`,
		'integrations/wp/client.php': `<?php
/**
 * The ${ n.title }'s items, fetched and cached in WordPress.
 *
 * SYNC: normalizeItems() in client.ts, step for step. tests/${ n.Name }.php.test.tsx runs both on
 * the same feed and fails when their markup differs.
 *
 * @package ${ n.plugin }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( '${ fn }_feed' ) ) {
	/**
	 * A feed's JSON, parsed: from the cache, or fetched and cached for an hour.
	 * WHY wp_safe_remote_get(): the feed URL is an editor's setting, so the request refuses
	 * private addresses.
	 *
	 * @param string $feed_url The feed.
	 * @return array<int, mixed> The feed's items, or an empty array.
	 */
	function ${ fn }_feed( $feed_url ) {
		if ( '' === $feed_url ) {
			return array();
		}
		$key    = '${ fn }_' . md5( $feed_url );
		$cached = get_transient( $key );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$response = wp_safe_remote_get( $feed_url, array( 'timeout' => 5 ) );
		$feed     = is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response )
			? null
			: json_decode( wp_remote_retrieve_body( $response ), true );
		$feed     = is_array( $feed ) ? $feed : array();

		set_transient( $key, $feed, $feed ? HOUR_IN_SECONDS : 5 * MINUTE_IN_SECONDS );
		return $feed;
	}
}

if ( ! function_exists( '${ fn }_items' ) ) {
	/**
	 * The feed's items as the list shows them. SYNC: normalizeItems() in client.ts.
	 *
	 * @param mixed $feed The feed's JSON, parsed to arrays.
	 * @return array<int, array<string, string>> Items: id, title, url.
	 */
	function ${ fn }_items( $feed ) {
		if ( ! is_array( $feed ) || ! array_is_list( $feed ) ) {
			return array();
		}
		$items = array();
		foreach ( $feed as $item ) {
			$title = is_array( $item ) ? trim( (string) ( $item['title'] ?? '' ) ) : '';
			$url   = is_array( $item ) ? (string) ( $item['url'] ?? '' ) : '';
			if ( '' !== $title && '' !== $url ) {
				$items[] = array(
					'id'    => (string) ( $item['id'] ?? $url ),
					'title' => $title,
					'url'   => $url,
				);
			}
		}
		return $items;
	}
}
`,
		'integrations/wp/markup.php': `<?php
/**
 * The ${ n.title }'s markup, in PHP.
 *
 * SYNC: ${ n.Name }.tsx, element for element. tests/${ n.Name }.php.test.tsx fails when they
 * differ. WHY no whitespace between tags: React writes none.
 *
 * @package ${ n.plugin }
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( '${ fn }_markup' ) ) {
	/**
	 * The list.
	 *
	 * @param array<int, array<string, string>> $items   From ${ fn }_items().
	 * @param array<string, string>             $props   title.
	 * @param string                            $wrapper The root's attributes, escaped.
	 * @return string Markup.
	 */
	function ${ fn }_markup( $items, $props, $wrapper ) {
		$title = (string) ( $props['title'] ?? '' );
		$html  = '<div ' . $wrapper . '>';
		if ( '' !== $title ) {
			$html .= '<p class="ucf-c-${ n.name }__title">' . esc_html( $title ) . '</p>';
		}
		$html .= '<ul class="ucf-c-${ n.name }__items">';
		foreach ( $items as $item ) {
			$html .= '<li class="ucf-c-${ n.name }__item"><a href="' . esc_url( $item['url'] ) . '">' . esc_html( $item['title'] ) . '</a></li>';
		}
		return $html . '</ul></div>';
	}
}
`,
		'integrations/wp/render.php': `<?php
/**
 * Front-end markup for the ${ n.title } block.
 *
 * CONTEXT: a live block. On each request this fetches the feed (cached; client.php) and writes
 * the whole list (markup.php), so it is in the page with no JavaScript.
 *
 * @package ${ n.plugin }
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/client.php';
require_once __DIR__ . '/markup.php';

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- markup.php escapes every value it writes, and get_block_wrapper_attributes() escapes each attribute itself.
echo ${ fn }_markup(
	${ fn }_items( ${ fn }_feed( (string) ( $attributes['feedUrl'] ?? '' ) ) ),
	$attributes,
	get_block_wrapper_attributes( array( 'class' => 'ucf-c ucf-c-${ n.name }' ) )
);
`,
		[ `tests/${ n.Name }.test.tsx` ]: `/**
 * The ${ n.title }'s markup, the record of it. A change here changes what every site shows, and
 * integrations/wp/markup.php must change with it (tests/${ n.Name }.php.test.tsx).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';

import ${ n.Name } from '../${ n.Name }.tsx';
import { SAMPLE_ITEMS } from '../sample-data.ts';

it( 'renders its items', () => {
	expect(
		renderToStaticMarkup( <${ n.Name } items={ SAMPLE_ITEMS } title="Title" /> )
	).toMatchSnapshot();
} );
`,
		[ `tests/${ n.Name }.php.test.tsx` ]: `// @vitest-environment happy-dom
/**
 * The live markup contract: WordPress's PHP and React write the same markup from the same feed
 * (integrations/tests/live.ts says how).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import {
	hasPhp,
	php,
	phpString,
	sameHtml,
	tempFile,
} from '../../../../integrations/tests/live.ts';
import ${ n.Name } from '../${ n.Name }.tsx';
import { normalizeItems } from '../client.ts';
import { SAMPLE_ITEMS } from '../sample-data.ts';

const wp = path.join(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'../integrations/wp'
);

const cases: Record< string, { feed: unknown; title: string } > = {
	'sample items, with a title': {
		feed: [ ...SAMPLE_ITEMS, { title: 'No URL' }, 'not an item' ],
		title: 'A “title” & more',
	},
	'no items': { feed: [], title: '' },
	'a feed that is not a list': { feed: { error: 'Not found' }, title: '' },
};

describe.runIf( hasPhp )( 'the ${ n.title } in PHP', () => {
	test.each( Object.entries( cases ) )(
		'writes the markup React does: %s',
		( _, { feed, title } ) => {
			const html = php( \`
require \${ phpString( path.join( wp, 'client.php' ) ) };
require \${ phpString( path.join( wp, 'markup.php' ) ) };
$feed = json_decode( file_get_contents( \${ phpString( tempFile( JSON.stringify( feed ) ) ) } ), true );
echo ${ fn }_markup( ${ fn }_items( $feed ), array( 'title' => \${ phpString( title ) } ), 'class="ucf-c ucf-c-${ n.name }"' );
\` );
			const expected = renderToStaticMarkup(
				<${ n.Name } items={ normalizeItems( feed ) } title={ title } />
			);

			// FIX: guards against two empty outputs matching.
			expect( expected ).toContain( 'ucf-c-${ n.name }' );
			expect( sameHtml( html ) ).toBe( sameHtml( expected ) );
		}
	);
} );
`,
		'tests/client.test.ts': `import { describe, expect, it, vi } from 'vitest';

import { createClient, normalizeItems } from '../client.ts';

describe( 'normalizeItems', () => {
	it( 'keeps items with a title and a URL', () => {
		expect(
			normalizeItems( [
				{ id: 1, title: ' One ', url: '/one' },
				{ title: 'No URL' },
				null,
			] )
		).toEqual( [ { id: '1', title: 'One', url: '/one' } ] );
		expect( normalizeItems( { error: 'nope' } ) ).toEqual( [] );
	} );
} );

describe( 'createClient', () => {
	it( 'fetches nothing without a feed', async () => {
		const fetch = vi.fn();
		await expect( createClient( { fetch } ).getItems() ).resolves.toEqual( [] );
		expect( fetch ).not.toHaveBeenCalled();
	} );

	it( 'fails loudly on an error response', async () => {
		const fetch = vi.fn( async () => new Response( '', { status: 500 } ) );
		await expect(
			createClient( { feedUrl: '/feed.json', fetch } ).getItems()
		).rejects.toThrow( /500/ );
	} );
} );
`,
	};
}

function primitiveFiles( n ) {
	return {
		[ `${ n.Name }.tsx` ]: `/**
 * CONTEXT: the ${ n.title }, a primitive: one of the small pieces our components are built
 * from (docs/architecture.md, "Primitives").
 *
 * Content rules apply: plain React, no runtime imports, nothing host-specific except through a
 * slot. Puck editors place it on its own; our blocks render it inside their own markup; in
 * WordPress, editors use core's equivalent block instead, so it has no block of its own.
 *
 * SYNC: our blocks save this markup inside theirs. Once a site uses them, changing what this
 * returns needs a new version of it and a deprecation in every block that uses it
 * (docs/architecture.md, "Primitives").
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ${ n.Name }Props = {
	/** The text. */
	text: ReactNode;
} & Omit< ComponentPropsWithoutRef< 'span' >, 'children' >;

export default function ${ n.Name }( {
	text,
	className,
	...props
}: ${ n.Name }Props ) {
	return (
		<span
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-${ n.name }' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ text }
		</span>
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
 * CONTEXT: the ${ n.title }'s styles, for every host and every component that uses it.
 *
 * Reads only \`--ucf-*\` names, and colors only as component-layer roles (\`--ucf-c-body\` and
 * so on), so it takes the colors of whatever it sits on.
 */
.ucf-c-${ n.name } {
	color: var(--ucf-c-body);
}
`,
		[ `integrations/storybook/${ n.Name }.stories.tsx` ]: `import type { Meta, StoryObj } from '@storybook/react-vite';

import ${ n.Name } from '../../${ n.Name }.tsx';
import example from '../../example.json';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/${ n.title }',
	tags: [ 'server' ],
	component: ${ n.Name },
	args: example,
} satisfies Meta< typeof ${ n.Name } >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
`,
		[ `tests/${ n.Name }.test.tsx` ]: `/**
 * The markup contract: WordPress's serializer and React DOM's give the same HTML, and it
 * matches the snapshot. Our blocks save this markup inside theirs, so a change here is a change
 * to every saved block that uses it.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import ${ n.Name }, { type ${ n.Name }Props } from '../${ n.Name }.tsx';
import example from '../example.json';

const cases: Record< string, ${ n.Name }Props > = {
	example,
};

describe( '${ n.Name }', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( \`renders the same in WordPress and React: \${ name }\`, () => {
			const element = <${ n.Name } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}
} );
`,
		'integrations/puck/config.tsx': `/**
 * The ${ n.title } for Puck, where editors place it on its own: Puck has no core blocks.
 */
import ${ n.Name } from '../../${ n.Name }.tsx';
import example from '../../example.json' with { type: 'json' };
// WHY a type from components/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '../../../../../integrations/puck/types.ts';

type Props = {
	text: string;
};

const config: PuckComponentConfig< Props > = {
	label: '${ n.title }',
	fields: {
		text: { type: 'text', label: 'Text' },
	},
	defaultProps: example,
	// FIX: only the primitive's own props; Puck's \`id\`, \`puck\` and \`editMode\` would
	// reach the markup.
	render: ( { text } ) => <${ n.Name } text={ text } />,
};

export default config;
`,
		'integrations/wp/edit.tsx': `/**
 * The ${ n.title } as our blocks edit it: the primitive itself, with WordPress's editing tools
 * in its slots. A block's edit() renders this where its save() renders the plain primitive.
 *
 * WHY no block of its own: WordPress editors use core's equivalent block.
 */
import { PlainText as UntypedPlainText } from '@wordpress/block-editor';
import type { ComponentType } from 'react';

import ${ n.Name } from '../../${ n.Name }.tsx';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

export type ${ n.Name }EditProps = {
	text: string;
	onChangeText: ( text: string ) => void;
	/** Names the field for screen readers and shows when it's empty. */
	label: string;
};

/**
 * @param props              The text and its setter.
 * @param props.text         The text.
 * @param props.onChangeText Updates it.
 * @param props.label        What the field is for.
 */
export default function ${ n.Name }Edit( {
	text,
	onChangeText,
	label,
}: ${ n.Name }EditProps ) {
	return (
		<${ n.Name }
			text={
				<PlainText
					value={ text }
					onChange={ onChangeText }
					placeholder={ label }
					aria-label={ label }
				/>
			}
		/>
	);
}
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
		'Usage: npm run new:component -- <name> --kind content|live|interactive|primitive [--plugin <plugin>] [--title "Display Name"]';

	if ( ! options.name ) {
		throw new Error( usage );
	}
	componentNames( options.name, options.title );
	if ( process.stdin.isTTY ) {
		options.kind ??= await ask( 'Kind', KINDS );
		if ( options.kind !== 'primitive' ) {
			options.plugin ??= await ask( 'Plugin', pluginNames( root ) );
		}
	}
	if (
		! options.kind ||
		( options.kind !== 'primitive' && ! options.plugin )
	) {
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
	const folder = `components/${ BUCKET_OF[ options.kind ] }/${ options.name }/`;
	const created = [ ...files.keys() ].filter( ( file ) =>
		file.startsWith( folder )
	);
	const edited = [ ...files.keys() ].filter(
		( file ) => ! created.includes( file )
	);
	console.log( `\nCreated ${ folder } (${ created.length } files).` );
	console.log(
		`Added it to:\n${ edited.map( ( file ) => `  ${ file }` ).join( '\n' ) }`
	);
	if ( options.kind === 'primitive' ) {
		console.log( `
Next:
  1. Replace the placeholder prop and markup in ${ Name }.tsx, with props named after core's
     equivalent block's attributes, and keep the Puck fields and example.json naming the same.
  2. Give wp/edit.tsx the same editing tools core's block has.
  3. Run \`npm test\` to write the new markup snapshot, then review it: every block that uses
     this primitive will save it.
  Then: npm run check && npm run test:stories` );
		return;
	}
	if ( options.kind === 'content' ) {
		console.log( `
Next (docs/architecture.md, "Built with frame()"):
  1. Write the markup in ${ Name }Markup (${ Name }.tsx); mark where content goes with area().
  2. Add props to ${ Name }.props.ts, then run \`npm run sync:blocks\` to write them into
     wp/block.json. Add parts to ${ Name }.parts.ts, each with its class in style.css.
  3. Replace the standard preset in ${ Name }.presets.ts with the designs it has.
  4. Write the block's description in wp/block.json.
  5. Run \`npm test\` to write the new markup snapshots, then review them: they are what every
     saved post will store.
  Then: npm run check && npm run test:stories` );
		return;
	}
	if ( options.kind === 'live' ) {
		console.log( `
Next (docs/architecture.md, "Three kinds of component"; components/live/event-list is the model):
  1. Replace the placeholder feed in client.ts and types.ts, and the same steps in
     wp/client.php. Write tests/fixtures/ from the real feed.
  2. Replace the markup in ${ Name }.tsx, and the same markup in wp/markup.php.
  3. Add props to ${ Name }.props.ts, then run \`npm run sync:blocks\`.
  4. Add the plugin's PHP prefix and text domain to phpcs.xml.dist if they're new.
  5. Run \`npm test\`: tests/${ Name }.php.test.tsx fails while the PHP and React markup differ.
  Then: npm run check && npm run test:stories` );
		return;
	}
	console.log( `
Next:
  1. Replace the placeholder prop and markup in ${ Name }.tsx, and keep the block attributes
     (wp/block.json), the Puck fields and defaults.ts naming the same props.
  2. Write the block's description in wp/block.json.${
		options.kind === 'interactive'
			? `
  3. If it fetches data, add client.ts, tests/client.test.ts and sample-client.ts like degree-finder's.
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
