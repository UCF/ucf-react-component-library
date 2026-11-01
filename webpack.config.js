/**
 * CONTEXT: builds every WordPress plugin under plugins/, one webpack config per plugin.
 *
 * The wp-scripts default finds blocks by searching one source folder for block.json files and
 * writes them all to one build folder. Here the blocks live in components/{name}/adapters/wp/ and
 * are split across several plugins, so this keeps the default's loaders and plugins and
 * replaces only three things per plugin: the entries, the output folder, and what gets copied.
 *
 * Output, per plugin:
 *
 *   plugins/{plugin}/build/{component}/   block.json, its scripts and styles, render.php
 *   plugins/{plugin}/build/shared.php     from plugins/shared/
 *   plugins/{plugin}/build/base.css       from dist/tokens/base-wp.css (run build:tokens first):
 *                                         tokens pointing at the theme, and the component layer
 */
const path = require( 'node:path' );
const { readFileSync } = require( 'node:fs' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

const {
	root,
	getPlugins,
	assertEveryBlockHasOnePlugin,
} = require( './scripts/plugins.cjs' );

// UPSTREAM: block.json fields that point at a script wp-scripts should compile.
const SCRIPT_FIELDS = [ 'editorScript', 'script', 'viewScript' ];

const blockDir = ( name ) =>
	path.join( root, 'components', name, 'adapters/wp' );

const readBlockJson = ( name ) =>
	JSON.parse( readFileSync( path.join( blockDir( name ), 'block.json' ) ) );

/**
 * `file:./index.tsx` in block.json becomes the entry `{name}/index`, built to
 * `build/{name}/index.js`.
 *
 * @param {string} name A component name.
 * @return {Object<string, string>} Webpack entries.
 */
function entriesFor( name ) {
	const blockJson = readBlockJson( name );

	return Object.fromEntries(
		SCRIPT_FIELDS.flatMap( ( field ) =>
			[].concat( blockJson[ field ] ?? [] )
		)
			.filter( ( value ) => value.startsWith( 'file:' ) )
			.map( ( value ) => {
				const file = value.slice( 'file:'.length );
				const base = path.basename( file ).replace( /\.[jt]sx?$/, '' );
				return [
					`${ name }/${ base }`,
					path.join( blockDir( name ), file ),
				];
			} )
	);
}

/**
 * The copied block.json points at the built `.js`, not the `.tsx` source.
 *
 * @param {Buffer} content block.json as written.
 * @return {string} block.json as shipped.
 */
function toBuiltBlockJson( content ) {
	const blockJson = JSON.parse( content.toString() );

	for ( const field of SCRIPT_FIELDS ) {
		if ( blockJson[ field ] ) {
			blockJson[ field ] = []
				.concat( blockJson[ field ] )
				.map( ( value ) => value.replace( /\.[jt]sx?$/, '.js' ) );
			if ( blockJson[ field ].length === 1 ) {
				blockJson[ field ] = blockJson[ field ][ 0 ];
			}
		}
	}

	return JSON.stringify( blockJson, null, '\t' ) + '\n';
}

// WHY by name: wp-scripts requires its own copy of these classes, so `instanceof` against
// ours would not match. These two are what assume a single source folder.
const REPLACED = [ 'CopyPlugin', 'PhpFilePathsPlugin' ];

const plugins = getPlugins();
assertEveryBlockHasOnePlugin( plugins );

module.exports = plugins.map( ( plugin ) => ( {
	...defaultConfig,
	name: plugin.name,
	entry: Object.assign( {}, ...plugin.blocks.map( entriesFor ) ),
	output: {
		...defaultConfig.output,
		path: path.join( plugin.dir, 'build' ),
	},
	plugins: [
		...defaultConfig.plugins.filter(
			( p ) => p && ! REPLACED.includes( p.constructor.name )
		),
		new CopyWebpackPlugin( {
			patterns: [
				...plugin.blocks.flatMap( ( name ) => [
					{
						from: path.join( blockDir( name ), 'block.json' ),
						to: `${ name }/block.json`,
						transform: toBuiltBlockJson,
					},
					{
						from: path.join( blockDir( name ), '*.php' ),
						to: `${ name }/[name][ext]`,
						noErrorOnMissing: true,
					},
				] ),
				{
					from: path.join( root, 'plugins/shared/shared.php' ),
					to: 'shared.php',
				},
				{
					from: path.join( root, 'dist/tokens/base-wp.css' ),
					to: 'base.css',
				},
			],
		} ),
	],
} ) );
