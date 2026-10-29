/**
 * CONTEXT: copies each built plugin into the local WordPress, for `npm run deploy:local`.
 *
 * The target defaults to ../wp-multisite/www/wp-content/plugins; set WP_PLUGINS_DIR to change it.
 * The plugins arrive installed but not activated.
 *
 * WHY copy rather than symlink: the local WordPress runs in Docker with only www/ mounted, so a
 * symlink pointing outside it does not resolve inside the container.
 *
 * WHY nothing stops a clash with the older UCF Blocks plugin (from ucf-components): it is being
 * retired. Its block is `ucf/stat` and this one is `ucf-content/stat`, so both can be active,
 * but the inserter will list two Stat blocks.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire( import.meta.url );
const { root, getPlugins } = require( './plugins.cjs' );

const target =
	process.env.WP_PLUGINS_DIR ||
	path.resolve( root, '../wp-multisite/www/wp-content/plugins' );

for ( const plugin of getPlugins() ) {
	execFileSync(
		'rsync',
		[
			'-a',
			'--delete',
			'--exclude',
			'.DS_Store',
			'--exclude',
			'plugin.json',
			`${ plugin.dir }/`,
			path.join( target, plugin.name ) + '/',
		],
		{ stdio: 'inherit' }
	);
	console.log(
		`Copied ${ plugin.name } to ${ path.join( target, plugin.name ) }`
	);
}
