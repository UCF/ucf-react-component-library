// @vitest-environment happy-dom
/**
 * CONTEXT: every WordPress block, through the same checks the block editor makes on a saved
 * post. Modeled on the UCF Brand Block Theme's tests/js/blocks.test.js.
 *
 * Per block, per case: create it, serialize it as a post would store it, parse it back, then
 *
 *   - the attributes survive the trip unchanged;
 *   - `isValidBlockContent()` accepts the stored markup against today's `save()`;
 *   - the stored markup matches the committed snapshot.
 *
 * WHY `isValidBlockContent()` and not the parsed block's `isValid`: when markup doesn't match,
 * `parse()` tries the block's `deprecated` saves and, on a match, migrates it and reports
 * `isValid: true`. That would hide the exact failure this file exists to catch.
 * WHY a snapshot as well: a `save()` change that is consistent with itself (a renamed class)
 * passes the round-trip while invalidating every post saved before it. Only the snapshot sees
 * it. Update it only with a major version and a deprecation (docs/architecture.md, "Changing
 * a content component's markup").
 * FIX: a block that fails to register serializes to nothing and passes every round-trip, so
 * the guards below check that each block registered and that a static block saved markup.
 */
import {
	createBlock,
	getBlockType,
	isValidBlockContent,
	parse,
	serialize,
} from '@wordpress/blocks';
import { describe, expect, test } from 'vitest';

import { CATEGORY_OF, kindOf } from '../wp/kind.ts';

// Registers every block, as each plugin's editor script does.
import.meta.glob(
	'../../components/{content,live,interactive}/*/integrations/wp/index.tsx',
	{
		eager: true,
	}
);

type BlockJson = {
	name: string;
	category: string;
	render?: string;
	viewScript?: string | string[];
	attributes: Record< string, { default?: unknown } >;
};

const blockJsons = import.meta.glob< BlockJson >(
	'../../components/{content,live,interactive}/*/integrations/wp/block.json',
	{
		eager: true,
		import: 'default',
	}
);
const componentOf = ( file: string ) => file.split( '/' )[ 4 ];

// Each component's sample props, by component: its `example.json`, in a component not yet
// moved to the layout in docs/architecture.md, "A component's folder".
const examples: Record<
	string,
	Record< string, unknown >
> = Object.fromEntries(
	Object.entries(
		import.meta.glob< Record< string, unknown > >(
			'../../components/{content,live,interactive}/*/example.json',
			{
				eager: true,
				import: 'default',
			}
		)
	).map( ( [ file, data ] ) => [ componentOf( file ), data ] )
);

// Each component's presets (`{Name}.presets.ts`), by component: the props each one saves.
type Preset = { name: string; props: Record< string, unknown > };
const presets: Record< string, Preset[] > = Object.fromEntries(
	Object.entries(
		import.meta.glob< Preset[] >(
			'../../components/{content,live,interactive}/*/*.presets.ts',
			{
				eager: true,
				import: 'PRESETS',
			}
		)
	).map( ( [ file, list ] ) => [ componentOf( file ), list ] )
);

const blocks = Object.entries( blockJsons ).map( ( [ file, json ] ) => {
	const component = componentOf( file );
	const example = component ? examples[ component ] : undefined;
	return {
		component,
		json,
		// A dynamic block (live or interactive) has render.php and saves no markup, only its
		// attributes.
		dynamic: Boolean( json.render ),
		// The defaults, then its example or each of its presets' props.
		cases: {
			defaults: {},
			...( example ? { example } : {} ),
			...Object.fromEntries(
				( component ? ( presets[ component ] ?? [] ) : [] ).map(
					( preset ) => [
						`the ${ preset.name } preset`,
						preset.props,
					]
				)
			),
		} as Record< string, Record< string, unknown > >,
	};
} );

test( 'finds every block', () => {
	expect( blocks.map( ( block ) => block.component ).sort() ).toEqual( [
		'card',
		'degree-finder',
		'event-list',
		'hero',
		'highlight',
		'section',
	] );
} );

describe.each( blocks )(
	'$json.name',
	( { component, json, dynamic, cases } ) => {
		test( 'registers', () => {
			expect( getBlockType( json.name ) ).toBeDefined();
		} );

		// WHY: the inserter groups blocks by kind, as Storybook does: UCF Content, UCF Live and
		// UCF Interactive (integrations/wp/kind.ts, plugins/shared).
		// WHY block.json, not the registered block: the categories are registered in PHP, so
		// here WordPress drops a category it doesn't know.
		test( 'sits in its kind’s inserter category', () => {
			expect( json.category ).toBe( CATEGORY_OF[ kindOf( json ) ] );
		} );

		describe.each( Object.entries( cases ) )( '%s', ( _, attributes ) => {
			// WHY inside each test, not here: an unregistered block makes createBlock() throw,
			// and thrown here it would crash the whole file instead of failing 'registers'.
			const roundTrip = () => {
				const block = createBlock( json.name, attributes );
				const stored = serialize( [ block ] );
				const [ parsed ] = parse( stored );
				if ( ! parsed ) {
					throw new Error( `${ json.name } parsed back as nothing` );
				}
				return { block, stored, parsed };
			};

			// The markup between the comment delimiters: whatever save() produced.
			const savedMarkup = () =>
				roundTrip()
					.stored.replace( /<!--[\s\S]*?-->/g, '' )
					.trim();

			test.runIf( ! dynamic )( 'stores its markup', () => {
				expect( savedMarkup() ).toMatch(
					new RegExp( `ucf-(c-)?${ component }\\b` )
				);
			} );

			test.runIf( dynamic )( 'stores only its attributes', () => {
				expect( savedMarkup() ).toBe( '' );
			} );

			test( 'reads back as the same block, with the same attributes', () => {
				const { block, stored, parsed } = roundTrip();
				expect( parse( stored ) ).toHaveLength( 1 );
				expect( parsed.name ).toBe( json.name );
				expect( parsed.attributes ).toEqual( block.attributes );
			} );

			test( 'is valid against today’s save(), with no deprecation', () => {
				const { parsed } = roundTrip();
				expect(
					isValidBlockContent(
						json.name,
						parsed.attributes,
						parsed.originalContent ?? ''
					)
				).toBe( true );
			} );

			test( 'matches the stored markup snapshot', () => {
				expect( roundTrip().stored ).toMatchSnapshot();
			} );
		} );
	}
);

// FIX: edit and save spread the attributes after useBlockProps(), so an editor's "Additional
// CSS class(es)" replaced WordPress's merged className: the saved block lost its
// `wp-block-*` class, and in the editor the block lost the classes it is selected by.
describe.each( blocks.filter( ( block ) => ! block.dynamic ) )(
	'$json.name with WordPress’s own attributes set',
	( { json } ) => {
		const anchor = Boolean(
			( getBlockType( json.name )?.supports as { anchor?: boolean } )
				?.anchor
		);
		const saved = () => {
			const block = createBlock( json.name, {
				className: 'editor-class',
				...( anchor ? { anchor: 'editor-anchor' } : {} ),
			} );
			const root = new DOMParser()
				.parseFromString( serialize( [ block ] ), 'text/html' )
				.body.querySelector( '*' );
			return { block, root };
		};

		test( 'keeps the block’s class and the editor’s class', () => {
			const classes = [ ...( saved().root?.classList ?? [] ) ];
			expect( classes ).toEqual(
				expect.arrayContaining( [
					`wp-block-${ json.name.replace( '/', '-' ) }`,
					'editor-class',
				] )
			);
		} );

		test.runIf( anchor )(
			'saves the anchor as its id, and no stray attribute',
			() => {
				const { root } = saved();
				expect( root?.id ).toBe( 'editor-anchor' );
				expect( root?.hasAttribute( 'anchor' ) ).toBe( false );
			}
		);

		test( 'is valid against today’s save()', () => {
			const [ parsed ] = parse( serialize( [ saved().block ] ) );
			expect(
				isValidBlockContent(
					json.name,
					parsed?.attributes ?? {},
					parsed?.originalContent ?? ''
				)
			).toBe( true );
		} );
	}
);

// WHY its own test: a frame is only useful with blocks inside it, and a block that holds
// others can save and parse its own markup correctly while losing what it holds.
// WHY a Section and a Card inside: core's blocks aren't registered here, only ours; any
// block with an attribute to tell it by will do.
describe.each( [
	[ 'ucf-content/section', { composition: 'dark' } ],
	[ 'ucf-content/hero', {} ],
	[ 'ucf-content/highlight', {} ],
	[ 'ucf-content/card', { variant: 'boxed' } ],
] )( '%s holding other blocks', ( name, attributes ) => {
	const build = () =>
		createBlock( name, attributes, [
			createBlock( 'ucf-content/section', { composition: 'gold' } ),
			createBlock( 'ucf-content/card', { variant: 'ruled' } ),
		] );

	test( 'reads back with the same blocks inside, in order', () => {
		const [ parsed ] = parse( serialize( [ build() ] ) );
		expect(
			parsed?.innerBlocks.map( ( inner ) => [
				inner.name,
				// WHY `||`: a Card's composition is '' by default.
				inner.attributes.composition || inner.attributes.variant,
			] )
		).toEqual( [
			[ 'ucf-content/section', 'gold' ],
			[ 'ucf-content/card', 'ruled' ],
		] );
	} );

	test( 'saves them inside its inner element', () => {
		expect( serialize( [ build() ] ) ).toMatchSnapshot();
	} );

	test( 'every block in it is valid against today’s save()', () => {
		const [ parsed ] = parse( serialize( [ build() ] ) );
		for ( const block of [ parsed, ...( parsed?.innerBlocks ?? [] ) ] ) {
			expect(
				isValidBlockContent(
					block?.name ?? '',
					block?.attributes ?? {},
					block?.originalContent ?? ''
				)
			).toBe( true );
		}
	} );
} );
