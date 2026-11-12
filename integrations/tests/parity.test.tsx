// @vitest-environment happy-dom
/**
 * CONTEXT: checks that a component's WordPress block and its Puck config stay in step, so a
 * component works the same in both.
 *
 *   - Both hosts exist: every component has a Puck config and a block. And it has stories,
 *     which is where its accessibility is checked.
 *   - Same props: the block's attributes, the Puck fields and the Puck defaults name the same
 *     props (less a Puck slot, which WordPress keeps as inner blocks, and WORDPRESS_ONLY).
 *     Content stored by one host then loads in the other unchanged.
 *   - Same markup: for a static (content) block, what WordPress saves and what Puck renders
 *     from the same props are the same HTML, for every choice of every select and radio
 *     field, apart from the classes WordPress adds for the block.
 *
 * Live and interactive blocks are left out of the markup check: WordPress renders them with
 * render.php, so there is no saved markup to compare. A live block's PHP markup is compared with
 * its React markup in its own tests/{Name}.php.test.tsx instead.
 */
import { getSaveContent } from '@wordpress/blocks';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import type { PuckComponentConfig, PuckField } from '../puck/types.ts';
import { defaultsIn, inHost, type PropDefinitions } from '../schema/props.ts';
import { PRESET_FIELDS } from '../puck/presets.ts';
import { blockAttributes } from '../wp/attributes.ts';
import { kindOf } from '../wp/kind.ts';

import.meta.glob(
	'../../components/{content,live,interactive}/*/integrations/wp/index.tsx',
	{
		eager: true,
	}
);

type BlockJson = {
	name: string;
	title: string;
	render?: string;
	viewScript?: string | string[];
	attributes: Record< string, unknown >;
};

const blockJsons = import.meta.glob< BlockJson >(
	'../../components/{content,live,interactive}/*/integrations/wp/block.json',
	{
		eager: true,
		import: 'default',
	}
);
// Any component's Puck config: its fields of every kind (a slot, a part's content).
type AnyPuckConfig = Omit<
	PuckComponentConfig< Record< string, string > >,
	'fields'
> & { fields: Record< string, PuckField > };

const puckConfigs = import.meta.glob< AnyPuckConfig >(
	'../../components/{content,live,interactive}/*/integrations/puck/config.tsx',
	{
		eager: true,
		import: 'default',
	}
);
// `../../components/content/highlight/integrations/wp/block.json` → `highlight`.
const componentOf = ( file: string ) => file.split( '/' )[ 4 ] ?? file;

/**
 * A component's file from a glob, by the component's name: the glob's keys carry its bucket.
 *
 * @param glob      A glob's modules, by file.
 * @param component A component's folder name.
 */
const fileOf = < T, >( glob: Record< string, T >, component: string ) =>
	Object.entries( glob ).find(
		( [ file ] ) => componentOf( file ) === component
	)?.[ 1 ];

// Each component's sample props, by component: its `example.json`, in a component not yet
// moved to the layout in docs/architecture.md, "A component's folder". One that has moved is
// compared from its defaults (propsByComponent, below).
const examples: Record< string, Record< string, string > > = Object.fromEntries(
	Object.entries(
		import.meta.glob< Record< string, string > >(
			'../../components/{content,live,interactive}/*/example.json',
			{
				eager: true,
				import: 'default',
			}
		)
	).map( ( [ file, data ] ) => [ componentOf( file ), data ] )
);

// Each component's prop definitions (`PROPS` in `{Name}.props.ts`), by component.
// SYNC: as components move to the layout in docs/architecture.md, "A component's folder",
// they are checked here with no other change.
const propsByComponent: Record< string, PropDefinitions > = Object.fromEntries(
	Object.entries(
		import.meta.glob< PropDefinitions >(
			'../../components/{content,live,interactive}/*/*.props.ts',
			{
				eager: true,
				import: 'PROPS',
			}
		)
	).map( ( [ file, definitions ] ) => [ componentOf( file ), definitions ] )
);

// Each component's default preset, by component: what WordPress inserts a new block as.
const defaultPresets: Record< string, { props: Record< string, unknown > } > =
	Object.fromEntries(
		Object.entries(
			import.meta.glob< { props: Record< string, unknown > } >(
				'../../components/{content,live,interactive}/*/*.presets.ts',
				{ eager: true, import: 'DEFAULT_PRESET' }
			)
		).map( ( [ file, preset ] ) => [ componentOf( file ), preset ] )
	);

// The file every component must have, or a clear failure naming it.
function need< T >( value: T | undefined, file: string ): T {
	if ( value === undefined ) {
		throw new Error( `missing ${ file }` );
	}
	return value;
}
/**
 * Attributes only WordPress has, which Puck has no counterpart for:
 *   - `align`: WordPress's own layout attribute. The Section sets `align: full` so it spans
 *     the page in a theme's constrained layout.
 *   - `imageId`: the media library's attachment ID, which WordPress reads to add responsive
 * sizes (components/primitives/image). Puck sites choose images by URL. Listed for the Hero, which
 *     has no prop definitions yet; a component that has them says so with `hosts: [ 'wp' ]`.
 */
const WORDPRESS_ONLY = new Set( [ 'align', 'imageId' ] );

/**
 * The props a component's definitions give to WordPress only.
 *
 * @param component A component's folder name.
 */
const wordPressOnly = ( component: string ) =>
	new Set(
		Object.entries( propsByComponent[ component ] ?? {} )
			.filter( ( [ , definition ] ) => ! inHost( definition, 'puck' ) )
			.map( ( [ key ] ) => key )
	);

// Every component: each folder with a core the package exports.
const components = Object.keys(
	import.meta.glob( '../../components/{content,live,interactive}/*/index.ts' )
)
	.map( componentOf )
	.sort();
const withBlock = Object.keys( blockJsons ).map( componentOf ).sort();
const withPuck = Object.keys( puckConfigs ).map( componentOf ).sort();
// WHY a Set: a component may split its stories into several files (the Card's props,
// presets and checks).
const withStories = [
	...new Set(
		Object.keys(
			import.meta.glob(
				'../../components/{content,live,interactive}/*/integrations/storybook/*.stories.tsx'
			)
		).map( componentOf )
	),
].sort();

test( 'finds every component', () => {
	expect( components ).toEqual( [
		'card',
		'degree-finder',
		'degree-list',
		'event-list',
		'hero',
		'highlight',
		'section',
	] );
} );

// Primitives (primitives/): the pieces our components are built from. Each has stories and a
// Puck config, where editors place them, and no WordPress block of its own: WordPress editors
// use core's blocks, and our blocks use the primitive inside their own markup
// (docs/architecture.md, "Primitives").
const primitiveOf = ( file: string ) => file.split( '/' )[ 4 ] ?? file;
const primitives = Object.keys(
	import.meta.glob( '../../components/primitives/*/index.ts' )
)
	.map( primitiveOf )
	.sort();

test( 'finds every primitive', () => {
	expect( primitives ).toEqual( [
		'button',
		'heading',
		'image',
		'paragraph',
	] );
} );

test( 'every primitive has stories and a Puck config, and no WordPress block', () => {
	const found = ( glob: Record< string, unknown > ) =>
		Object.keys( glob ).map( primitiveOf ).sort();

	expect(
		found(
			import.meta.glob(
				'../../components/primitives/*/integrations/storybook/*.stories.tsx'
			)
		)
	).toEqual( primitives );
	expect(
		found(
			import.meta.glob(
				'../../components/primitives/*/integrations/puck/config.tsx'
			)
		)
	).toEqual( primitives );
	expect(
		found(
			import.meta.glob(
				'../../components/primitives/*/integrations/wp/block.json'
			)
		)
	).toEqual( [] );
} );

// WHY: the accessibility checks run against stories (`npm run test:stories`), so a component
// with none is never checked on any composition or width.
test( 'every component has stories', () => {
	expect( withStories ).toEqual( components );
} );

test( 'every component has a Puck config', () => {
	expect( withPuck ).toEqual( components );
} );

test( 'every component has a WordPress block', () => {
	expect( withBlock ).toEqual( components );
} );

// WHY: the bucket is the kind (docs/architecture.md, "A component's folder"). A content block
// saves its markup; a live one is written whole by render.php; an interactive one is a
// render.php container the browser builds (integrations/wp/kind.ts). A component in the wrong
// bucket would be built, documented and scaffolded as another kind.
// Each component's core and block entry, as text, to read their imports.
const coreSources = import.meta.glob< string >(
	'../../components/{content,live,interactive}/*/*.tsx',
	{ eager: true, query: '?raw', import: 'default' }
);
const blockEntrySources = import.meta.glob< string >(
	'../../components/{content,live,interactive}/*/integrations/wp/index.tsx',
	{ eager: true, query: '?raw', import: 'default' }
);

// FIX: a primitive has no block of its own, so its rules reach WordPress only through the
// block entry of each component that uses it (webpack builds a block's stylesheet from what
// its script imports). Without the import, the primitive is unstyled on any theme that
// doesn't style the same elements.
test( 'every block imports the styles of the primitives its core uses', () => {
	const missing = new Set< string >();
	for ( const [ file, source ] of Object.entries( coreSources ) ) {
		const component = componentOf( file );
		const entry = fileOf( blockEntrySources, component );
		if ( entry === undefined ) {
			continue;
		}
		for ( const [ , primitive ] of source.matchAll(
			// Relative (`../../primitives/`) or by the `@/` alias (`@/components/primitives/`).
			/from '(?:\.\.\/\.\.\/|@\/components\/)primitives\/([a-z-]+)\//g
		) ) {
			if ( ! entry.includes( `primitives/${ primitive }/style.css'` ) ) {
				missing.add( `${ component } uses ${ primitive }` );
			}
		}
	}
	expect( [ ...missing ] ).toEqual( [] );
} );

test( 'every component sits in the bucket for its kind', () => {
	const misplaced = Object.entries( blockJsons )
		.map( ( [ file, json ] ) => ( {
			component: componentOf( file ),
			bucket: file.split( '/' )[ 3 ],
			kind: kindOf( json ),
		} ) )
		.filter( ( { bucket, kind } ) => bucket !== kind );
	expect( misplaced ).toEqual( [] );
} );

describe.each( withBlock )( '%s', ( component ) => {
	const json = need(
		fileOf( blockJsons, component ),
		`${ component }/integrations/wp/block.json`
	);
	const puck = fileOf( puckConfigs, component );
	const sorted = ( object: object = {} ) => Object.keys( object ).sort();
	// WHY slots left out: a Puck slot holds the components placed inside, which WordPress keeps
	// as inner blocks rather than as an attribute. blocks.test.tsx checks those round-trip.
	const slots = new Set(
		Object.entries( puck?.fields ?? {} )
			.filter( ( [ , field ] ) => field.type === 'slot' )
			.map( ( [ key ] ) => key )
	);
	// WHY the preset layer left out too: `preset`, `content` and `blocks` are what Puck and a
	// React site store for a component with presets (integrations/puck/presets.ts), not
	// attributes; WordPress keeps the content as inner blocks.
	const notAttributes = new Set< string >( [ ...slots, ...PRESET_FIELDS ] );
	const puckProps = ( object: object = {} ) =>
		sorted( object ).filter( ( key ) => ! notAttributes.has( key ) );
	const blockProps = sorted( json.attributes ).filter(
		( key ) =>
			! WORDPRESS_ONLY.has( key ) &&
			! wordPressOnly( component ).has( key )
	);

	// WHY: the name an editor sees in WordPress's inserter and in Puck is one name
	// (docs/architecture.md, "Naming"), written in two files.
	test( 'Puck labels it with block.json’s title', () => {
		expect( puck?.label ).toBe( json.title );
	} );

	test( 'the block attributes and the Puck fields name the same props', () => {
		expect( puckProps( puck?.fields ) ).toEqual( blockProps );
	} );

	test( 'the Puck defaults cover every prop', () => {
		expect( puckProps( puck?.defaultProps ) ).toEqual( blockProps );
	} );

	const definitions = propsByComponent[ component ];
	const example =
		examples[ component ] ??
		( definitions
			? ( defaultsIn( definitions, 'puck' ) as Record< string, string > )
			: undefined );

	// The example, then the example with each choice of each select or radio field in turn.
	// WHY every choice: a host that ignores one value (a width it never passes on) still
	// matches on the example's own value.
	const propSets = (): [ string, Record< string, string > ][] => {
		const base = need(
			example,
			`${ component }'s example or prop definitions`
		);
		const choices = Object.entries( puck?.fields ?? {} ).flatMap(
			( [ key, field ] ) =>
				'options' in field && ! notAttributes.has( key )
					? field.options.map(
							(
								option
							): [ string, Record< string, string > ] => [
								`${ key }: ${ option.value || '(empty)' }`,
								{ ...base, [ key ]: option.value },
							]
						)
					: []
		);
		return [ [ 'example', base ], ...choices ];
	};

	test.runIf( ! json.render && example !== undefined )(
		'WordPress saves the same markup Puck renders, for every choice',
		() => {
			const config = need(
				puck,
				`${ component }/integrations/puck/config.tsx`
			);
			// What useBlockProps.save() adds: the block's own class, wp-block-{namespace}-{name},
			// and `alignfull` for a block that spans the page.
			const blockClass = `wp-block-${ json.name.replace( '/', '-' ) }`;
			// UPSTREAM: Puck hands `render` a component for each slot; with nothing placed in
			// it, the WordPress side has no inner blocks either.
			const Slot = ( slotProps: object ) => <div { ...slotProps } />;

			for ( const [ name, props ] of propSets() ) {
				const saved = getSaveContent( json.name, props )
					.replace( / ?alignfull/, '' )
					.replace( `${ blockClass } `, '' )
					.replace( ` class="${ blockClass }"`, '' );
				const rendered = renderToStaticMarkup(
					config.render( {
						...props,
						...Object.fromEntries(
							[ ...slots ].map( ( key ) => [ key, Slot ] )
						),
					} as never )
				);

				// FIX: guards against an empty save, which would match an empty render.
				expect( saved ).toMatch(
					new RegExp( `ucf-(c-)?${ component }\\b` )
				);
				// The choice's name in the compared value, so a failure says which one broke.
				expect( { choice: name, markup: saved } ).toEqual( {
					choice: name,
					markup: rendered,
				} );
			}
		}
	);
} );

describe.each( Object.keys( propsByComponent ).sort() )(
	'%s’s prop definitions',
	( component ) => {
		const definitions = need(
			propsByComponent[ component ],
			`${ component }'s prop definitions`
		);

		// WHY: PHP reads block.json before any script runs, so its attributes are written from the
		// props by `npm run sync:blocks`. One that differs would save one thing and edit another.
		test( 'block.json declares exactly its props, with their types and defaults', () => {
			const json = need(
				fileOf( blockJsons, component ),
				`${ component }/integrations/wp/block.json`
			);
			expect(
				Object.fromEntries(
					Object.entries( json.attributes ).filter(
						( [ key ] ) => key !== 'align'
					)
				)
			).toEqual( blockAttributes( definitions ) );
		} );

		// WHY: a new component starts the same in both hosts. FIX: Puck started the Card from
		// its sample props (boxed) and WordPress from block.json (plain).
		// WHY the default preset's props: WordPress inserts a new block as its default
		// variation, which sets them.
		test( 'Puck starts from its defaults, as WordPress does', () => {
			const puck = fileOf( puckConfigs, component );
			const puckDefaults = Object.fromEntries(
				Object.entries( puck?.defaultProps ?? {} ).filter(
					( [ key ] ) =>
						! [ 'content', ...PRESET_FIELDS ].includes( key )
				)
			);
			expect( puckDefaults ).toEqual( {
				...defaultsIn( definitions, 'puck' ),
				...defaultPresets[ component ]?.props,
			} );
		} );

		// WHY: a default that isn't an option renders, but no rule matches it and the sidebar
		// shows nothing selected.
		test( 'every choice’s default is one of its options', () => {
			const strays = Object.entries( definitions )
				.filter(
					( [ , definition ] ) =>
						definition.type === 'choice' &&
						! definition.options.some(
							( option ) => option.value === definition.default
						)
				)
				.map( ( [ key ] ) => key );
			expect( strays ).toEqual( [] );
		} );

		test( 'every prop a host shows has a label', () => {
			const unlabelled = Object.entries( definitions )
				.filter(
					( [ , definition ] ) =>
						! definition.label &&
						( ! definition.hosts ||
							definition.hosts.includes( 'puck' ) )
				)
				.map( ( [ key ] ) => key );
			expect( unlabelled ).toEqual( [] );
		} );
	}
);
