/**
 * CONTEXT: copies each built plugin into a WordPress install's plugins folder. Run through
 * deploy.mjs (`npm run deploy`, `npm run deploy:watch`). The plugins arrive installed but not
 * activated.
 *
 * The folder is WP_PLUGINS_DIR, set in .env (copy .env.example) or in the shell. There is no
 * default: every machine and site keeps WordPress somewhere different.
 *
 * WHY the checks before copying: this deletes and replaces folders, so it refuses anything that
 * isn't plainly a WordPress plugins folder (named `plugins`, beside a `themes` folder) and
 * touches only the folders named for this repo's plugins.
 * WHY a symlinked plugin is skipped: it already points at this repo's live build, and replacing
 * it would break that link.
 */
import { cpSync, existsSync, lstatSync, statSync } from 'node:fs';
import path from 'node:path';

import { replaceFolder } from './deploy-shared.mjs';

// Left out of the installed plugin: plugin.json only tells the build what goes in.
const SKIP = new Set( [ 'plugin.json', '.DS_Store' ] );

/**
 * Check that a folder is safe to deploy plugins into. Throws with a message saying what to fix.
 *
 * @param {string|undefined} dir The configured WP_PLUGINS_DIR.
 * @return {string} The folder, resolved.
 */
export function checkPluginsTarget( dir ) {
	if ( ! dir ) {
		throw new Error(
			'WP_PLUGINS_DIR is not set. Copy .env.example to .env and set it to a WordPress install’s wp-content/plugins folder.'
		);
	}
	if ( ! path.isAbsolute( dir ) ) {
		throw new Error(
			`WP_PLUGINS_DIR must be an absolute path, not "${ dir }".`
		);
	}
	if ( ! existsSync( dir ) || ! statSync( dir ).isDirectory() ) {
		throw new Error( `WP_PLUGINS_DIR "${ dir }" is not a folder.` );
	}
	if (
		path.basename( dir ) !== 'plugins' ||
		! existsSync( path.join( dir, '..', 'themes' ) )
	) {
		throw new Error(
			`WP_PLUGINS_DIR "${ dir }" doesn’t look like a WordPress plugins folder: expected a folder named "plugins" beside a "themes" folder, as in wp-content/.`
		);
	}
	return path.resolve( dir );
}

/**
 * Copy each plugin into the target, replacing what is there.
 *
 * @param {string}                          target  A folder checkPluginsTarget() accepted.
 * @param {{ name: string, dir: string }[]} plugins From getPlugins().
 * @return {{ name: string, result: 'copied' | 'skipped' }[]} What happened to each.
 */
export function deployPlugins( target, plugins ) {
	for ( const plugin of plugins ) {
		if ( ! existsSync( path.join( plugin.dir, 'build' ) ) ) {
			throw new Error(
				`plugins/${ plugin.name }/build/ is missing. Run \`npm run build:plugins\` first.`
			);
		}
	}

	return plugins.map( ( plugin ) => {
		const dest = path.join( target, plugin.name );

		if ( existsSync( dest ) && lstatSync( dest ).isSymbolicLink() ) {
			return { name: plugin.name, result: 'skipped' };
		}

		replaceFolder( dest, ( staging ) =>
			cpSync( plugin.dir, staging, {
				recursive: true,
				filter: ( src ) => ! SKIP.has( path.basename( src ) ),
			} )
		);

		return { name: plugin.name, result: 'copied' };
	} );
}
