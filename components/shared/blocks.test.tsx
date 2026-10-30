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

// Registers every block, as each plugin's editor script does.
import.meta.glob( '../*/hosts/wp/index.tsx', { eager: true } );

type BlockJson = {
	name: string;
	render?: string;
	attributes: Record< string, { default?: unknown } >;
};

const blockJsons = import.meta.glob< BlockJson >( '../*/hosts/wp/block.json', {
	eager: true,
	import: 'default',
} );
const examples = import.meta.glob< Record< string, unknown > >(
	'../*/example.json',
	{ eager: true, import: 'default' }
);

const componentOf = ( file: string ) => file.split( '/' )[ 1 ];

const blocks = Object.entries( blockJsons ).map( ( [ file, json ] ) => {
	const component = componentOf( file );
	const example = examples[ `../${ component }/example.json` ];
	return {
		component,
		json,
		// A dynamic block has render.php and saves no markup, only its attributes.
		dynamic: Boolean( json.render ),
		cases: {
			defaults: {},
			...( example ? { example } : {} ),
		} as Record< string, Record< string, unknown > >,
	};
} );

test( 'finds every block', () => {
	expect( blocks.map( ( block ) => block.component ).sort() ).toEqual( [
		'degree-finder',
		'section',
		'stat',
	] );
} );

describe.each( blocks )(
	'$json.name',
	( { component, json, dynamic, cases } ) => {
		test( 'registers', () => {
			expect( getBlockType( json.name ) ).toBeDefined();
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

// WHY its own test: a Section is only useful with blocks inside it, and a block that holds
// others can save and parse its own markup correctly while losing what it holds.
describe( 'a Section holding other blocks', () => {
	const build = () =>
		createBlock( 'ucf-content/section', { composition: 'dark' }, [
			createBlock( 'ucf-content/stat', {
				statement: 'Inside a section',
			} ),
			createBlock( 'ucf-content/stat', { statement: 'And another' } ),
		] );

	test( 'reads back with the same blocks inside, in order', () => {
		const [ parsed ] = parse( serialize( [ build() ] ) );
		expect(
			parsed?.innerBlocks.map( ( inner ) => [
				inner.name,
				inner.attributes.statement,
			] )
		).toEqual( [
			[ 'ucf-content/stat', 'Inside a section' ],
			[ 'ucf-content/stat', 'And another' ],
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
