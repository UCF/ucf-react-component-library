/**
 * CONTEXT: copies the built npm package (package.json and dist/) into a folder a React site
 * installs from, such as the Puck demo's vendor/ucf-components. Run through deploy.mjs
 * (`npm run deploy`, `npm run deploy:watch`).
 *
 * The folder is PACKAGE_DIR, set in .env (copy .env.example) or in the shell. The site lists it
 * as a dependency, `"@ucf/components": "file:./vendor/ucf-components"`, and npm links it in.
 *
 * WHY a copy inside the site, not a link to this repo: a link resolves `react` from this repo's
 * node_modules, so the site would run two copies of React and every hook would break. And a
 * dev server watches its own folder, so a copy there shows up as soon as it lands.
 * WHY the check before copying: this replaces the folder, so it refuses one that holds
 * anything other than an earlier copy of this package.
 * FIX: npm installs a local folder's devDependencies, which a published package never gets. The
 * copied package.json listed this repo's whole toolchain, so the site got a second React (18,
 * beside its 19) and wp-scripts. The copy leaves out DEV_ONLY.
 */
import {
	cpSync,
	existsSync,
	readFileSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';

import { replaceFolder } from './deploy-shared.mjs';

// What a published install ignores, so a site installing this folder must not see.
const DEV_ONLY = [ 'devDependencies', 'scripts' ];

const packageName = ( dir ) =>
	JSON.parse( readFileSync( path.join( dir, 'package.json' ), 'utf8' ) ).name;

/**
 * Check that a folder is safe to deploy the package into. Throws with a message saying what to
 * fix.
 *
 * @param {string|undefined} dir    The configured PACKAGE_DIR.
 * @param {string}           source This repo's root, whose package name the folder must hold.
 * @return {string} The folder, resolved.
 */
export function checkPackageTarget( dir, source ) {
	if ( ! dir ) {
		throw new Error(
			'PACKAGE_DIR is not set. Copy .env.example to .env and set it to the folder a site installs @ucf/components from.'
		);
	}
	if ( ! path.isAbsolute( dir ) ) {
		throw new Error(
			`PACKAGE_DIR must be an absolute path, not "${ dir }".`
		);
	}
	if ( ! existsSync( path.dirname( dir ) ) ) {
		throw new Error(
			`PACKAGE_DIR "${ dir }" is in a folder that doesn’t exist.`
		);
	}
	if ( existsSync( dir ) ) {
		const name = packageName( source );
		const held = existsSync( path.join( dir, 'package.json' ) )
			? packageName( dir )
			: null;
		if ( ! statSync( dir ).isDirectory() || held !== name ) {
			throw new Error(
				`PACKAGE_DIR "${ dir }" already holds something other than ${ name }. Point it at a new folder, or one an earlier deploy made.`
			);
		}
	}
	return path.resolve( dir );
}

/**
 * Copy package.json and dist/ into the target, replacing what is there.
 *
 * @param {string} target A folder checkPackageTarget() accepted.
 * @param {string} source This repo's root.
 */
export function deployPackage( target, source ) {
	// WHY ucf.css: build:package writes it last, so it marks a finished package build.
	if ( ! existsSync( path.join( source, 'dist/ucf.css' ) ) ) {
		throw new Error(
			'dist/ has no package in it. Run `npm run build` first.'
		);
	}

	replaceFolder( target, ( staging ) => {
		cpSync( path.join( source, 'dist' ), path.join( staging, 'dist' ), {
			recursive: true,
		} );
		const manifest = JSON.parse(
			readFileSync( path.join( source, 'package.json' ), 'utf8' )
		);
		for ( const key of DEV_ONLY ) {
			delete manifest[ key ];
		}
		writeFileSync(
			path.join( staging, 'package.json' ),
			JSON.stringify( manifest, null, '\t' ) + '\n'
		);
	} );
}
