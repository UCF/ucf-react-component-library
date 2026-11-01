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
	'components/_config/parity.test.tsx',
	'components/_config/blocks.test.tsx',
	'components/_config/puck.test.tsx',
	'components/stat/index.ts',
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

	// WHY "_config": components/_config/ is not a component, and no name may take it.
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
		expect( () => plan( { name: 'stat' } ) ).toThrow( /already exists/ );
	} );

	test( 'refuses an unknown kind or plugin', () => {
		expect( () => plan( { kind: 'widget' } ) ).toThrow( /--kind/ );
		expect( () => plan( { plugin: 'ucf-nope' } ) ).toThrow( /--plugin/ );
	} );

	// WHY: all or nothing. A list it can't find must stop it before anything is written.
	test( 'stops when a list it edits is missing', () => {
		rmSync( path.join( root, 'components/_config/blocks.test.tsx' ) );
		expect( () => plan() ).toThrow( /blocks\.test\.tsx is missing/ );
	} );

	test( 'a content component gets the content files and a markup test', () => {
		const files = [ ...plan().keys() ];
		expect( files ).toEqual(
			expect.arrayContaining( [
				'components/pull-quote/PullQuote.tsx',
				'components/pull-quote/PullQuote.test.tsx',
				'components/pull-quote/example.json',
				'components/pull-quote/adapters/wp/save.tsx',
			] )
		);
		expect( files ).not.toContain(
			'components/pull-quote/adapters/wp/render.php'
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
				'components/tuition-calculator/defaults.ts',
				'components/tuition-calculator/adapters/wp/render.php',
				'components/tuition-calculator/adapters/wp/view.tsx',
			] )
		);
		expect( files ).not.toContain(
			'components/tuition-calculator/adapters/wp/save.tsx'
		);
	} );

	test( 'names the block after its plugin', () => {
		const block = JSON.parse(
			plan().get( 'components/pull-quote/adapters/wp/block.json' )
		);
		expect( block.name ).toBe( 'ucf-content/pull-quote' );
		expect( block.textdomain ).toBe( 'ucf-content' );
	} );

	test( 'adds the component to every list', () => {
		writePlan( root, plan() );

		const exports = JSON.parse( read( 'package.json' ) ).exports;
		expect( exports[ './pull-quote' ].default ).toBe(
			'./dist/pull-quote/index.js'
		);
		expect( exports[ './pull-quote/puck' ].default ).toBe(
			'./dist/pull-quote/adapters/puck/config.js'
		);
		expect( exports[ './pull-quote/example.json' ] ).toBe(
			'./dist/pull-quote/example.json'
		);

		expect(
			JSON.parse( read( 'plugins/ucf-content/plugin.json' ) ).blocks
		).toContain( 'pull-quote' );
		expect(
			JSON.parse( read( 'plugins/ucf-degrees/plugin.json' ) ).blocks
		).not.toContain( 'pull-quote' );

		expect( read( 'components/_config/parity.test.tsx' ) ).toMatch(
			/'degree-finder', 'pull-quote', 'section'/
		);
		expect( read( 'components/_config/blocks.test.tsx' ) ).toMatch(
			/'degree-finder', 'pull-quote', 'section'/
		);

		const puck = read( 'components/_config/puck.test.tsx' );
		expect( puck ).toContain(
			"import pullQuote from '../pull-quote/adapters/puck/config.tsx';"
		);
		expect( puck ).toContain( "'Pull Quote': pullQuote," );
		expect( puck ).toContain(
			'pullQuote satisfies ComponentConfig< PropsOf< typeof pullQuote > >;'
		);
	} );
} );
