/**
 * CONTEXT: copies each built plugin into a WordPress install's plugins folder, for
 * `npm run deploy:plugins` (which builds first). The plugins arrive installed but not activated.
 *
 * The folder is WP_PLUGINS_DIR, set in .env (copy .env.example) or in the shell. There is no
 * default: every machine and site keeps WordPress somewhere different.
 *
 * WHY the checks before copying: this deletes and replaces folders, so it refuses anything that
 * isn't plainly a WordPress plugins folder (named `plugins`, beside a `themes` folder) and
 * touches only the folders named for this repo's plugins.
 * WHY copy to a temporary folder and then rename: a rename is one step, so WordPress never loads
 * a plugin that is half copied, and a failed copy leaves the installed version in place.
 * WHY a symlinked plugin is skipped: it already points at this repo's live build, and replacing
 * it would break that link.
 */
import {
	cpSync,
	existsSync,
	lstatSync,
	renameSync,
	rmSync,
	statSync,
} from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire( import.meta.url );
const { getPlugins } = require( './plugins.cjs' );

// Left out of the installed plugin: plugin.json only tells the build what goes in.
const SKIP = new Set( [ 'plugin.json', '.DS_Store' ] );

/**
 * Check that a folder is safe to deploy into. Throws with a message saying what to fix.
 *
 * @param {string|undefined} dir The configured WP_PLUGINS_DIR.
 * @return {string} The folder, resolved.
 */
export function checkTarget( dir ) {
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
 * @param {string}                          target  A folder checkTarget() accepted.
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

		const staging = path.join( target, `.${ plugin.name }.deploying` );
		const old = path.join( target, `.${ plugin.name }.old` );
		rmSync( staging, { recursive: true, force: true } );
		rmSync( old, { recursive: true, force: true } );

		cpSync( plugin.dir, staging, {
			recursive: true,
			filter: ( src ) => ! SKIP.has( path.basename( src ) ),
		} );

		if ( existsSync( dest ) ) {
			renameSync( dest, old );
		}
		renameSync( staging, dest );
		rmSync( old, { recursive: true, force: true } );

		return { name: plugin.name, result: 'copied' };
	} );
}

if ( process.argv[ 1 ] === fileURLToPath( import.meta.url ) ) {
	try {
		const target = checkTarget( process.env.WP_PLUGINS_DIR );
		for ( const { name, result } of deployPlugins(
			target,
			getPlugins()
		) ) {
			console.log(
				result === 'copied'
					? `Copied ${ name } to ${ path.join( target, name ) }`
					: `Skipped ${ name }: ${ path.join(
							target,
							name
						) } is a symlink, already live`
			);
		}
	} catch ( error ) {
		console.error( error.message );
		process.exit( 1 );
	}
}
