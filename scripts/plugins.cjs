/**
 * CONTEXT: which WordPress plugin each component's block ships in.
 *
 * Every folder under plugins/ that has a plugin.json is a plugin, and its `blocks` list names
 * the components it carries. The plugin owns the list rather than each block naming its plugin,
 * so a plugin's contents can be read in one place.
 *
 * Read by webpack.config.js (what to build where) and by scripts/release-temp.mjs.
 * CommonJS because webpack.config.js is.
 */
const { existsSync, readdirSync, readFileSync } = require( 'node:fs' );
const path = require( 'node:path' );

const root = path.dirname( __dirname );

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
	const componentsDir = path.join( root, 'components' );
	const withBlocks = readdirSync( componentsDir ).filter( ( name ) =>
		existsSync( path.join( componentsDir, name, 'adapters/wp/block.json' ) )
	);

	for ( const name of withBlocks ) {
		const owners = plugins.filter( ( p ) => p.blocks.includes( name ) );
		if ( owners.length !== 1 ) {
			throw new Error(
				`components/${ name } has a WordPress block but is listed in ${
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
					`plugins/${ plugin.name }/plugin.json lists "${ name }", which has no components/${ name }/adapters/wp/block.json.`
				);
			}
		}
	}
}

module.exports = { root, getPlugins, assertEveryBlockHasOnePlugin };
