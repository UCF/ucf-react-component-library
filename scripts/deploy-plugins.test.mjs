/**
 * CONTEXT: checks scripts/deploy-plugins.mjs against throwaway folders: that it refuses a folder
 * that isn't a WordPress plugins folder, and that it replaces only this repo's plugins.
 */
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { checkPluginsTarget, deployPlugins } from './deploy-plugins.mjs';

let tmp;
let wpContent;
let target;

/**
 * A built plugin, as plugins/{name}/ looks after `npm run build:plugins`.
 *
 * @param {string} name    The plugin's folder name.
 * @param {string} version Written into its PHP file, to tell copies apart.
 * @return {{ name: string, dir: string }} As getPlugins() returns it.
 */
function makePlugin( name, version ) {
	const dir = path.join( tmp, 'repo/plugins', name );
	mkdirSync( path.join( dir, 'build' ), { recursive: true } );
	writeFileSync( path.join( dir, `${ name }.php` ), version );
	writeFileSync( path.join( dir, 'plugin.json' ), '{}' );
	writeFileSync( path.join( dir, 'build/index.js' ), version );
	return { name, dir };
}

beforeEach( () => {
	tmp = mkdtempSync( path.join( os.tmpdir(), 'ucf-deploy-' ) );
	wpContent = path.join( tmp, 'wp-content' );
	target = path.join( wpContent, 'plugins' );
	mkdirSync( target, { recursive: true } );
	mkdirSync( path.join( wpContent, 'themes' ) );
} );

afterEach( () => {
	rmSync( tmp, { recursive: true, force: true } );
} );

describe( 'checkPluginsTarget', () => {
	test( 'accepts a wp-content/plugins folder', () => {
		expect( checkPluginsTarget( target ) ).toBe( target );
	} );

	test.each( [
		[ 'unset', () => undefined, /not set/ ],
		[ 'relative', () => 'wp-content/plugins', /absolute/ ],
		[ 'missing', () => path.join( tmp, 'nowhere' ), /not a folder/ ],
		[ 'not named plugins', () => wpContent, /doesn’t look like/ ],
	] )( 'refuses a folder that is %s', ( _, dir, message ) => {
		expect( () => checkPluginsTarget( dir() ) ).toThrow( message );
	} );

	test( 'refuses a plugins folder with no themes folder beside it', () => {
		rmSync( path.join( wpContent, 'themes' ), { recursive: true } );
		expect( () => checkPluginsTarget( target ) ).toThrow(
			/doesn’t look like/
		);
	} );
} );

describe( 'deployPlugins', () => {
	test( 'copies each plugin, without plugin.json', () => {
		const plugin = makePlugin( 'ucf-content', 'v1' );

		expect( deployPlugins( target, [ plugin ] ) ).toEqual( [
			{ name: 'ucf-content', result: 'copied' },
		] );
		const installed = path.join( target, 'ucf-content' );
		expect(
			readFileSync( path.join( installed, 'build/index.js' ), 'utf8' )
		).toBe( 'v1' );
		expect( existsSync( path.join( installed, 'plugin.json' ) ) ).toBe(
			false
		);
	} );

	test( 'replaces an installed copy, dropping files the new build no longer has', () => {
		const plugin = makePlugin( 'ucf-content', 'v2' );
		const installed = path.join( target, 'ucf-content' );
		mkdirSync( path.join( installed, 'build' ), { recursive: true } );
		writeFileSync( path.join( installed, 'build/stale.js' ), 'old' );

		deployPlugins( target, [ plugin ] );

		expect(
			readFileSync( path.join( installed, 'ucf-content.php' ), 'utf8' )
		).toBe( 'v2' );
		expect( existsSync( path.join( installed, 'build/stale.js' ) ) ).toBe(
			false
		);
	} );

	test( 'leaves other plugins and no temporary folders behind', () => {
		const plugin = makePlugin( 'ucf-content', 'v1' );
		mkdirSync( path.join( target, 'akismet' ) );

		deployPlugins( target, [ plugin ] );

		expect( existsSync( path.join( target, 'akismet' ) ) ).toBe( true );
		expect(
			[ '.ucf-content.deploying', '.ucf-content.old' ].filter( ( name ) =>
				existsSync( path.join( target, name ) )
			)
		).toEqual( [] );
	} );

	test( 'skips a plugin that is symlinked into WordPress', () => {
		const plugin = makePlugin( 'ucf-content', 'v1' );
		symlinkSync( plugin.dir, path.join( target, 'ucf-content' ) );

		expect( deployPlugins( target, [ plugin ] ) ).toEqual( [
			{ name: 'ucf-content', result: 'skipped' },
		] );
		expect( existsSync( path.join( plugin.dir, 'plugin.json' ) ) ).toBe(
			true
		);
	} );

	test( 'refuses before copying anything when a plugin isn’t built', () => {
		const built = makePlugin( 'ucf-content', 'v1' );
		const unbuilt = makePlugin( 'ucf-degrees', 'v1' );
		rmSync( path.join( unbuilt.dir, 'build' ), { recursive: true } );

		expect( () => deployPlugins( target, [ built, unbuilt ] ) ).toThrow(
			/ucf-degrees\/build\/ is missing/
		);
		expect( existsSync( path.join( target, 'ucf-content' ) ) ).toBe(
			false
		);
	} );
} );
