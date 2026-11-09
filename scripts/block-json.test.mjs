/**
 * The built block.json's style version follows the block's CSS on every rebuild, in a watching
 * build as in a single one (scripts/block-json.cjs says why).
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

const require = createRequire( import.meta.url );
// WHY through @wordpress/scripts: the webpack the plugins' builds run on, which it depends on.
const webpack = createRequire(
	require.resolve( '@wordpress/scripts/package.json' )
)( 'webpack' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const { BlockJsonPlugin, styleVersion } = require( './block-json.cjs' );

const dir = mkdtempSync( path.join( tmpdir(), 'ucf-block-json-' ) );
afterAll( () => rmSync( dir, { recursive: true, force: true } ) );

const write = ( file, contents ) =>
	writeFileSync( path.join( dir, file ), contents );
const builtBlockJson = () =>
	JSON.parse( readFileSync( path.join( dir, 'build/demo/block.json' ) ) );

write(
	'block.json',
	JSON.stringify( {
		name: 'ucf-test/demo',
		editorScript: 'file:./index.tsx',
	} )
);
write( 'index.js', "import './style.css';\n" );
write( 'style.css', '.demo { color: red; }\n' );

// WHY wp-scripts' own config: the CSS is split and named as the plugins' builds name it.
// WHY a compiler per test: a closed compiler can't run again.
const makeCompiler = () =>
	webpack( {
		...defaultConfig,
		mode: 'development',
		context: dir,
		entry: { 'demo/index': path.join( dir, 'index.js' ) },
		output: { ...defaultConfig.output, path: path.join( dir, 'build' ) },
		plugins: [
			...defaultConfig.plugins.filter(
				( p ) =>
					p &&
					! [ 'CopyPlugin', 'PhpFilePathsPlugin' ].includes(
						p.constructor.name
					)
			),
			new BlockJsonPlugin( {
				blocks: [ 'demo' ],
				blockJsonOf: () => path.join( dir, 'block.json' ),
				packageVersion: '1.0.0',
			} ),
		],
		stats: 'none',
		infrastructureLogging: { level: 'error' },
	} );

describe( 'the built block.json', () => {
	test( 'points at the built script', async () => {
		const compiler = makeCompiler();
		await new Promise( ( resolve, reject ) =>
			compiler.run( ( error, stats ) => {
				const failed = error ?? ( stats.hasErrors() && stats );
				compiler.close( () =>
					failed ? reject( new Error( String( failed ) ) ) : resolve()
				);
			} )
		);
		expect( builtBlockJson().editorScript ).toBe( 'file:./index.js' );
	}, 60_000 );

	// WHY the assertions after the build, not in webpack's callback: an expect() that throws
	// there never reaches the test, which then only times out.
	test( 'gets a new style version when only its CSS changes, while watching', async () => {
		const compiler = makeCompiler();
		const versions = await new Promise( ( resolve, reject ) => {
			const seen = [];
			const watching = compiler.watch(
				{ aggregateTimeout: 50 },
				( error, stats ) => {
					if ( error || stats.hasErrors() ) {
						watching.close( () =>
							reject( new Error( String( error ?? stats ) ) )
						);
						return;
					}
					seen.push( builtBlockJson().version );
					if ( seen.length === 1 ) {
						// Only the CSS changes; block.json and the script stay as they were.
						write( 'style.css', '.demo { color: blue; }\n' );
						return;
					}
					watching.close( () => resolve( seen ) );
				}
			);
		} );

		expect( versions[ 0 ] ).toMatch( /^1\.0\.0-[0-9a-f]{10}$/ );
		expect( versions[ 1 ] ).toMatch( /^1\.0\.0-[0-9a-f]{10}$/ );
		expect( versions[ 1 ] ).not.toBe( versions[ 0 ] );
	}, 60_000 );
} );

describe( 'styleVersion', () => {
	test( 'is the same for the same CSS, in any order, and differs for different CSS', () => {
		const a = [ 'a/style-index.css', Buffer.from( '.a{}' ) ];
		const b = [ 'a/index.css', Buffer.from( '.b{}' ) ];
		expect( styleVersion( '1.0.0', [ a, b ] ) ).toBe(
			styleVersion( '1.0.0', [ b, a ] )
		);
		expect( styleVersion( '1.0.0', [ a ] ) ).not.toBe(
			styleVersion( '1.0.0', [ b ] )
		);
	} );
} );
