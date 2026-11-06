/**
 * CONTEXT: which WordPress plugin each component's block ships in.
 *
 * Every folder under plugins/ that has a plugin.json is a plugin, and its `blocks` list names
 * the components it carries. The plugin owns the list rather than each block naming its plugin,
 * so a plugin's contents can be read in one place.
 *
 * Also where every component's folder is found (componentDirs()), since they sit in buckets.
 *
 * Read by webpack.config.js (what to build where), scripts/build-package.mjs and
 * scripts/release-temp.mjs.
 * CommonJS because webpack.config.js is.
 */
const { existsSync, readdirSync, readFileSync } = require( 'node:fs' );
const path = require( 'node:path' );

const root = path.dirname( __dirname );

/**
 * The buckets under components/, by role, in build order: the pieces first, since components
 * are built from them and a component's CSS may adjust a primitive's.
 * SYNC: docs/architecture.md, "A component's folder". integrations/tests/parity.test.tsx checks
 * each bucket holds only its kind.
 */
const BUCKETS = [ 'primitives', 'content', 'interactive' ];

/**
 * Every component and primitive, by name: its bucket and its folder.
 *
 * WHY by name: block names, plugin.json and the package's public paths name a component without
 * its bucket, so a component can change bucket without changing any of them.
 *
 * @return {Map<string, { bucket: string, dir: string }>} Name → bucket and absolute folder.
 */
function componentDirs() {
	const found = new Map();
	for ( const bucket of BUCKETS ) {
		const bucketDir = path.join( root, 'components', bucket );
		if ( ! existsSync( bucketDir ) ) {
			continue;
		}
		for ( const entry of readdirSync( bucketDir, {
			withFileTypes: true,
		} ) ) {
			if ( ! entry.isDirectory() ) {
				continue;
			}
			// WHY: the name alone identifies a component everywhere outside this folder.
			if ( found.has( entry.name ) ) {
				throw new Error(
					`components/${ bucket }/${ entry.name } has the same name as components/${
						found.get( entry.name ).bucket
					}/${ entry.name }. Names must be unique across buckets.`
				);
			}
			found.set( entry.name, {
				bucket,
				dir: path.join( bucketDir, entry.name ),
			} );
		}
	}
	return found;
}

/**
 * A component's folder, by name.
 *
 * @param {string} name A component's folder name.
 * @return {string} Its absolute folder.
 */
function componentDir( name ) {
	const found = componentDirs().get( name );
	if ( ! found ) {
		throw new Error( `There is no component "${ name }" in components/.` );
	}
	return found.dir;
}

/**
 * @return {{ name: string, dir: string, blocks: string[] }[]} Every plugin, with its blocks.
 */
function getPlugins() {
	const pluginsDir = path.join( root, 'plugins' );

	return readdirSync( pluginsDir, { withFileTypes: true } )
		.filter( ( entry ) => entry.isDirectory() )
		.map( ( entry ) => path.join( pluginsDir, entry.name, 'plugin.json' ) )
		.filter( ( manifest ) => existsSync( manifest ) )
		.map( ( manifest ) => ( {
			name: path.basename( path.dirname( manifest ) ),
			dir: path.dirname( manifest ),
			blocks: JSON.parse( readFileSync( manifest, 'utf8' ) ).blocks,
		} ) );
}

/**
 * Fail the build when a component with a WordPress host is in no plugin, or in two.
 *
 * WHY: a block left out of every plugin.json builds nowhere, silently. A block in two plugins
 * registers twice when both are active, which WordPress reports only as a notice.
 *
 * @param {{ name: string, blocks: string[] }[]} plugins From getPlugins().
 */
function assertEveryBlockHasOnePlugin( plugins ) {
	const dirs = componentDirs();
	const withBlocks = [ ...dirs ]
		.filter( ( [ , { dir } ] ) =>
			existsSync( path.join( dir, 'integrations/wp/block.json' ) )
		)
		.map( ( [ name ] ) => name );

	for ( const name of withBlocks ) {
		const owners = plugins.filter( ( p ) => p.blocks.includes( name ) );
		if ( owners.length !== 1 ) {
			throw new Error(
				`${ name } has a WordPress block but is listed in ${
					owners.length
				} plugins (${
					owners.map( ( p ) => p.name ).join( ', ' ) || 'none'
				}). List it in exactly one plugins/*/plugin.json.`
			);
		}
	}

	for ( const plugin of plugins ) {
		for ( const name of plugin.blocks ) {
			if ( ! withBlocks.includes( name ) ) {
				throw new Error(
					`plugins/${ plugin.name }/plugin.json lists "${ name }", which has no integrations/wp/block.json in components/.`
				);
			}
		}
	}
}

module.exports = {
	root,
	BUCKETS,
	componentDirs,
	componentDir,
	getPlugins,
	assertEveryBlockHasOnePlugin,
};
