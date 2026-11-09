/**
 * CONTEXT: checks scripts/new-component.mjs against a copy of the files it edits, in a
 * temporary folder: the names it derives, what it refuses, and the lists it adds to.
 *
 * Whether a scaffolded component passes every check is proved by running the script in the
 * repo and then `npm run check` and `npm run test:stories`; that is too slow to run here.
 */
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { componentNames, planComponent, writePlan } from './new-component.mjs';

const repo = path.dirname( path.dirname( fileURLToPath( import.meta.url ) ) );

// The files the script reads, and one existing component to collide with.
const COPIED = [
	'package.json',
	'plugins/ucf-content/plugin.json',
	'plugins/ucf-degrees/plugin.json',
	'integrations/tests/parity.test.tsx',
	'integrations/tests/blocks.test.tsx',
	'integrations/tests/puck.test.tsx',
	'components/content/highlight/index.ts',
];

let root;

beforeEach( () => {
	root = mkdtempSync( path.join( os.tmpdir(), 'ucf-new-component-' ) );
	for ( const file of COPIED ) {
		cpSync( path.join( repo, file ), path.join( root, file ) );
	}
} );

afterEach( () => {
	rmSync( root, { recursive: true, force: true } );
} );

const read = ( file ) => readFileSync( path.join( root, file ), 'utf8' );

describe( 'componentNames', () => {
	test( 'spells one name for every layer', () => {
		expect( componentNames( 'tuition-calculator' ) ).toEqual( {
			name: 'tuition-calculator',
			Name: 'TuitionCalculator',
			camel: 'tuitionCalculator',
			title: 'Tuition Calculator',
		} );
	} );

	// WHY "_config": a name must start with a letter, so no folder for shared code is taken.
	test.each( [
		'Quote',
		'pull_quote',
		'pull--quote',
		'2-up',
		'quote-',
		'_config',
	] )( 'refuses "%s", which is not kebab-case', ( name ) => {
		expect( () => componentNames( name ) ).toThrow( /kebab-case/ );
	} );

	// WHY: `ucf-c-panel` is the component layer's class.
	test( 'refuses "panel", reserved', () => {
		const name = 'panel';
		expect( () => componentNames( name ) ).toThrow( /reserved/ );
	} );
} );

describe( 'planComponent', () => {
	const plan = ( options ) =>
		planComponent( {
			root,
			name: 'pull-quote',
			kind: 'content',
			plugin: 'ucf-content',
			...options,
		} );

	test( 'refuses a component that already exists', () => {
		expect( () => plan( { name: 'highlight' } ) ).toThrow(
			/already exists/
		);
	} );

	test( 'refuses an unknown kind or plugin', () => {
		expect( () => plan( { kind: 'widget' } ) ).toThrow( /--kind/ );
		expect( () => plan( { plugin: 'ucf-nope' } ) ).toThrow( /--plugin/ );
	} );

	// WHY: all or nothing. A list it can't find must stop it before anything is written.
	test( 'stops when a list it edits is missing', () => {
		rmSync( path.join( root, 'integrations/tests/blocks.test.tsx' ) );
		expect( () => plan() ).toThrow( /blocks\.test\.tsx is missing/ );
	} );

	test( 'a content component gets the content files and a markup test', () => {
		const files = [ ...plan().keys() ];
		expect( files ).toEqual(
			expect.arrayContaining( [
				'components/content/pull-quote/PullQuote.tsx',
				'components/content/pull-quote/tests/PullQuote.test.tsx',
				'components/content/pull-quote/integrations/storybook/PullQuote.stories.tsx',
				'components/content/pull-quote/PullQuote.props.ts',
				'components/content/pull-quote/PullQuote.parts.ts',
				'components/content/pull-quote/PullQuote.presets.ts',
				'components/content/pull-quote/integrations/wp/save.tsx',
			] )
		);
		expect( files ).not.toContain(
			'components/content/pull-quote/integrations/wp/render.php'
		);
	} );

	test( 'an interactive component gets render.php and view.tsx, and no save', () => {
		const files = [
			...plan( {
				name: 'tuition-calculator',
				kind: 'interactive',
				plugin: 'ucf-degrees',
			} ).keys(),
		];
		expect( files ).toEqual(
			expect.arrayContaining( [
				'components/interactive/tuition-calculator/defaults.ts',
				'components/interactive/tuition-calculator/integrations/wp/render.php',
				'components/interactive/tuition-calculator/integrations/wp/view.tsx',
			] )
		);
		expect( files ).not.toContain(
			'components/interactive/tuition-calculator/integrations/wp/save.tsx'
		);
	} );

	test( 'a live component gets render.php with its PHP copies, and no save or view', () => {
		const files = plan( {
			name: 'news-list',
			kind: 'live',
			plugin: 'ucf-content',
		} );
		const names = [ ...files.keys() ];
		expect( names ).toEqual(
			expect.arrayContaining( [
				'components/live/news-list/client.ts',
				'components/live/news-list/integrations/wp/render.php',
				'components/live/news-list/integrations/wp/client.php',
				'components/live/news-list/tests/NewsList.php.test.tsx',
			] )
		);
		// WHY no markup.php: the markup is render.php, as a template (docs/architecture.md).
		for ( const absent of [ 'save.tsx', 'view.tsx', 'markup.php' ] ) {
			expect( names ).not.toContain(
				`components/live/news-list/integrations/wp/${ absent }`
			);
		}
		const block = JSON.parse(
			files.get( 'components/live/news-list/integrations/wp/block.json' )
		);
		expect( block.category ).toBe( 'ucf-live' );
		expect( block.viewScript ).toBeUndefined();
		// WHY: PHP functions are prefixed by their plugin (phpcs.xml.dist).
		expect(
			files.get( 'components/live/news-list/integrations/wp/client.php' )
		).toContain( 'function ucf_content_news_list_items( $feed )' );
	} );

	test( 'names the block after its plugin', () => {
		const block = JSON.parse(
			plan().get(
				'components/content/pull-quote/integrations/wp/block.json'
			)
		);
		expect( block.name ).toBe( 'ucf-content/pull-quote' );
		expect( block.textdomain ).toBe( 'ucf-content' );
	} );

	test( 'a primitive goes in primitives/, with no WordPress block and no plugin', () => {
		const files = planComponent( {
			root,
			name: 'badge',
			kind: 'primitive',
		} );
		writePlan( root, files );

		expect( [ ...files.keys() ] ).toEqual(
			expect.arrayContaining( [
				'components/primitives/badge/Badge.tsx',
				'components/primitives/badge/integrations/puck/config.tsx',
				'components/primitives/badge/integrations/wp/edit.tsx',
			] )
		);
		expect( [ ...files.keys() ] ).not.toContain(
			'components/primitives/badge/integrations/wp/block.json'
		);
		expect(
			JSON.parse( read( 'plugins/ucf-content/plugin.json' ) ).blocks
		).not.toContain( 'badge' );

		const exports = JSON.parse( read( 'package.json' ) ).exports;
		expect( exports[ './primitives/badge' ].default ).toBe(
			'./dist/components/primitives/badge/index.js'
		);
		expect( read( 'integrations/tests/parity.test.tsx' ) ).toMatch(
			/expect\( primitives \)\.toEqual\(\s*\[[^\]]*'badge'/
		);
		expect( read( 'integrations/tests/puck.test.tsx' ) ).toContain(
			"import badge from '../../components/primitives/badge/integrations/puck/config.tsx';"
		);
	} );

	// FIX: adding an import once rewrote the block from the one-line imports it recognized,
	// and dropped one that spans three lines (`import card, { withTemplate }`).
	test( 'keeps every import already in puck.test.tsx', () => {
		const file = 'integrations/tests/puck.test.tsx';
		const importsIn = ( source ) =>
			source.match( /^import [\s\S]*? from '[^']+';$/gm ) ?? [];
		const before = importsIn( read( file ) );
		expect( before.some( ( line ) => line.includes( '\n' ) ) ).toBe( true );

		writePlan(
			root,
			planComponent( { root, name: 'badge', kind: 'primitive' } )
		);

		expect( importsIn( read( file ) ) ).toEqual(
			expect.arrayContaining( before )
		);
	} );

	// FIX: the templates are template literals, so a backtick in them is written \`. Written
	// \\\` it came out as a backslash and a backtick in the new files' comments.
	test.each( [ 'content', 'live', 'interactive', 'primitive' ] )(
		'writes no stray backslash before a backtick: %s',
		( kind ) => {
			const files = planComponent( {
				root,
				name: 'badge',
				kind,
				plugin: 'ucf-content',
			} );
			for ( const [ file, contents ] of files ) {
				expect( [ file, contents.includes( '\\`' ) ] ).toEqual( [
					file,
					false,
				] );
			}
		}
	);

	test( 'refuses a name already used in the other folder', () => {
		writePlan(
			root,
			planComponent( { root, name: 'badge', kind: 'primitive' } )
		);
		expect( () => plan( { name: 'badge' } ) ).toThrow(
			/components\/primitives\/badge already exists/
		);
	} );

	test( 'adds the component to every list', () => {
		writePlan( root, plan() );

		const exports = JSON.parse( read( 'package.json' ) ).exports;
		expect( exports[ './pull-quote' ].default ).toBe(
			'./dist/components/content/pull-quote/index.js'
		);
		expect( exports[ './pull-quote/puck' ].default ).toBe(
			'./dist/components/content/pull-quote/integrations/puck/config.js'
		);
		// A content component's sample is its presets.
		expect( exports[ './pull-quote/example.json' ] ).toBeUndefined();

		expect(
			JSON.parse( read( 'plugins/ucf-content/plugin.json' ) ).blocks
		).toContain( 'pull-quote' );
		expect(
			JSON.parse( read( 'plugins/ucf-degrees/plugin.json' ) ).blocks
		).not.toContain( 'pull-quote' );

		// WHY only "listed, in order": the real lists grow with every component.
		// FIX: read only the components list. parity.test.tsx also lists the primitives, and
		// reading every quoted name in the file merged the two into one unsorted list.
		for ( const [ file, start ] of [
			[ 'parity', 'expect( components ).toEqual( [' ],
			[ 'blocks', '.sort() ).toEqual( [' ],
		] ) {
			const source = read( `integrations/tests/${ file }.test.tsx` );
			const list = source.slice( source.indexOf( start ) + start.length );
			const names = list
				.slice( 0, list.indexOf( ']' ) )
				.split( ',' )
				.map( ( item ) => item.trim().replace( /'/g, '' ) )
				.filter( Boolean );
			expect( names ).toContain( 'pull-quote' );
			expect( names ).toEqual( [ ...names ].sort() );
		}

		const puck = read( 'integrations/tests/puck.test.tsx' );
		expect( puck ).toContain(
			"import pullQuote from '../../components/content/pull-quote/integrations/puck/config.tsx';"
		);
		expect( puck ).toContain( "'Pull Quote': pullQuote," );
		expect( puck ).toContain(
			'pullQuote satisfies ComponentConfig< PropsOf< typeof pullQuote > >;'
		);
	} );
} );
