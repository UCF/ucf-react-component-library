/**
 * CONTEXT: `npm run deploy` and `npm run deploy:watch`. Copies this repo's outputs to wherever
 * .env says they go, so a local WordPress and a local React site run the current code:
 *
 *   WP_PLUGINS_DIR   the plugins, into a WordPress install (deploy-plugins.mjs)
 *   PACKAGE_DIR      the npm package, into a folder a React site installs from (deploy-package.mjs)
 *
 * Set either or both. `npm run deploy` builds everything first, then copies once.
 *
 * With `--watch`, it builds the tokens, then keeps both up to date: the plugins through
 * `wp-scripts start`, redeployed each time their files settle, and the package rebuilt and
 * redeployed each time components/ settles. Ctrl-C stops everything it started.
 * UPSTREAM: a change to tokens/tokens.json needs a restart; nothing here watches it.
 */
import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';

import { checkPackageTarget, deployPackage } from './deploy-package.mjs';
import { checkPluginsTarget, deployPlugins } from './deploy-plugins.mjs';
import { watchFolders } from './deploy-shared.mjs';

const require = createRequire( import.meta.url );
const { root, getPlugins } = require( './plugins.cjs' );

const { WP_PLUGINS_DIR, PACKAGE_DIR } = process.env;

if ( ! WP_PLUGINS_DIR && ! PACKAGE_DIR ) {
	console.error(
		'Nothing to deploy to. Copy .env.example to .env and set WP_PLUGINS_DIR, PACKAGE_DIR, or both.'
	);
	process.exit( 1 );
}

let pluginsTarget;
let packageTarget;
try {
	pluginsTarget = WP_PLUGINS_DIR && checkPluginsTarget( WP_PLUGINS_DIR );
	packageTarget = PACKAGE_DIR && checkPackageTarget( PACKAGE_DIR, root );
} catch ( error ) {
	console.error( error.message );
	process.exit( 1 );
}

const time = () => new Date().toLocaleTimeString();

function plugins() {
	for ( const { name, result } of deployPlugins(
		pluginsTarget,
		getPlugins()
	) ) {
		const dest = path.join( pluginsTarget, name );
		console.log(
			result === 'copied'
				? `${ time() } Copied ${ name } to ${ dest }`
				: `${ time() } Skipped ${ name }: ${ dest } is a symlink, already live`
		);
	}
}

function npmPackage() {
	deployPackage( packageTarget, root );
	console.log( `${ time() } Copied the npm package to ${ packageTarget }` );
}

/**
 * Run `fn`, and in a watch report a failure instead of stopping.
 *
 * WHY keep going: a build caught midway, or a type error being fixed, fails once; the next
 * change deploys it.
 *
 * @param {() => void} fn A deploy.
 */
function attempt( fn ) {
	try {
		fn();
	} catch ( error ) {
		console.error( `${ time() } Not deployed: ${ error.message }` );
	}
}

const node = ( script ) =>
	execFileSync( process.execPath, [ path.join( root, 'scripts', script ) ], {
		cwd: root,
		stdio: [ 'ignore', 'ignore', 'inherit' ],
	} );

if ( ! process.argv.includes( '--watch' ) ) {
	try {
		if ( pluginsTarget ) {
			plugins();
		}
		if ( packageTarget ) {
			npmPackage();
		}
	} catch ( error ) {
		console.error( error.message );
		process.exit( 1 );
	}
} else {
	node( 'build-tokens.mjs' );
	const stops = [];

	if ( packageTarget ) {
		const rebuild = () =>
			attempt( () => {
				node( 'build-package.mjs' );
				npmPackage();
			} );
		rebuild();
		stops.push(
			watchFolders( [ path.join( root, 'components' ) ], rebuild )
		);
	}

	if ( pluginsTarget ) {
		// WHY detached, then stopped as a group: wp-scripts starts webpack as a child of its
		// own; stopping only the first left the rest running in the background.
		const build = spawn(
			path.join( root, 'node_modules/.bin/wp-scripts' ),
			[ 'start' ],
			{ cwd: root, stdio: 'inherit', detached: true }
		);
		const stopBuild = () => {
			try {
				process.kill( -build.pid, 'SIGTERM' );
			} catch {
				// Already stopped.
			}
		};
		build.on( 'exit', ( code ) => {
			stops.forEach( ( stop ) => stop() );
			process.exit( code ?? 0 );
		} );
		process.on( 'exit', stopBuild );
		stops.push( stopBuild );
		stops.push(
			watchFolders(
				getPlugins().map( ( plugin ) => plugin.dir ),
				() => attempt( plugins )
			)
		);
	}

	const stopAll = () => {
		stops.forEach( ( stop ) => stop() );
		process.exit( 0 );
	};
	process.on( 'SIGINT', stopAll );
	process.on( 'SIGTERM', stopAll );
}
