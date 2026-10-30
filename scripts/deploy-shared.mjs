/**
 * CONTEXT: what the plugin and package deploys share: replacing a folder in one step, and
 * waiting for a burst of file changes to settle. Used by deploy-plugins.mjs, deploy-package.mjs
 * and deploy.mjs.
 */
import { existsSync, renameSync, rmSync, watch } from 'node:fs';
import path from 'node:path';

// How long watched files must stay unchanged before a watch deploys them, in milliseconds.
export const WATCH_DELAY = 500;

/**
 * Replace `dest` with a folder that `fill` writes, in one step.
 *
 * WHY a temporary folder and then a rename: a rename is one step, so whatever reads `dest`
 * (WordPress, a Next dev server) never sees it half copied, and a failed copy leaves the old
 * version in place. The temporary folders sit beside `dest`, so the rename never crosses disks.
 *
 * @param {string}                    dest The folder to replace (or create).
 * @param {(staging: string) => void} fill Writes the new contents into `staging`.
 */
export function replaceFolder( dest, fill ) {
	const parent = path.dirname( dest );
	const name = path.basename( dest );
	const staging = path.join( parent, `.${ name }.deploying` );
	const old = path.join( parent, `.${ name }.old` );
	rmSync( staging, { recursive: true, force: true } );
	rmSync( old, { recursive: true, force: true } );

	fill( staging );

	if ( existsSync( dest ) ) {
		renameSync( dest, old );
	}
	renameSync( staging, dest );
	rmSync( old, { recursive: true, force: true } );
}

/**
 * Call `onChange` once each time the files in these folders stop changing.
 *
 * WHY wait for quiet rather than act on every change: a build writes many files, and copying
 * midway would ship half of it.
 *
 * @param {string[]}   dirs     Folders to watch, with everything inside them.
 * @param {() => void} onChange Runs after a burst of changes settles.
 * @param {number}     delay    How long to wait for quiet, in milliseconds.
 * @return {() => void} Stops watching.
 */
export function watchFolders( dirs, onChange, delay = WATCH_DELAY ) {
	let timer;
	const watchers = dirs.map( ( dir ) =>
		watch( dir, { recursive: true }, () => {
			clearTimeout( timer );
			timer = setTimeout( onChange, delay );
		} )
	);

	return () => {
		clearTimeout( timer );
		watchers.forEach( ( watcher ) => watcher.close() );
	};
}
