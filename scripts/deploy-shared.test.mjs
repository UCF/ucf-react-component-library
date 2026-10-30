/**
 * CONTEXT: checks scripts/deploy-shared.mjs: replacing a folder in one step, and waiting for a
 * burst of changes to settle before deploying.
 */
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { replaceFolder, watchFolders } from './deploy-shared.mjs';

let tmp;

beforeEach( () => {
	tmp = mkdtempSync( path.join( os.tmpdir(), 'ucf-deploy-shared-' ) );
} );

afterEach( () => {
	rmSync( tmp, { recursive: true, force: true } );
} );

describe( 'replaceFolder', () => {
	test( 'replaces the folder and leaves no temporary folders', () => {
		const dest = path.join( tmp, 'pkg' );
		mkdirSync( dest );
		writeFileSync( path.join( dest, 'stale.js' ), 'old' );

		replaceFolder( dest, ( staging ) => {
			mkdirSync( staging );
			writeFileSync( path.join( staging, 'index.js' ), 'new' );
		} );

		expect( readdirSync( tmp ) ).toEqual( [ 'pkg' ] );
		expect( readdirSync( dest ) ).toEqual( [ 'index.js' ] );
	} );

	test( 'leaves the old folder in place when the copy fails', () => {
		const dest = path.join( tmp, 'pkg' );
		mkdirSync( dest );
		writeFileSync( path.join( dest, 'index.js' ), 'old' );

		expect( () =>
			replaceFolder( dest, () => {
				throw new Error( 'copy failed' );
			} )
		).toThrow( 'copy failed' );
		expect( readFileSync( path.join( dest, 'index.js' ), 'utf8' ) ).toBe(
			'old'
		);
	} );
} );

describe( 'watchFolders', () => {
	const settle = ( ms ) => new Promise( ( done ) => setTimeout( done, ms ) );

	// UPSTREAM: on macOS, fs.watch reports writes made just before it started a moment late.
	// Each test lets those arrive, then counts only its own changes.
	async function watching( dir ) {
		const onChange = vi.fn();
		const stop = watchFolders( [ dir ], onChange, 100 );
		await settle( 300 );
		onChange.mockClear();
		return { onChange, stop };
	}

	test( 'calls once after a burst of changes, not once per file', async () => {
		const dir = path.join( tmp, 'build' );
		mkdirSync( dir );
		const { onChange, stop } = await watching( dir );

		for ( const file of [ 'index.js', 'index.asset.php', 'style.css' ] ) {
			writeFileSync( path.join( dir, file ), 'v2' );
			await settle( 20 );
		}
		await settle( 400 );
		stop();

		expect( onChange ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'sees changes in nested folders', async () => {
		const dir = path.join( tmp, 'plugin' );
		mkdirSync( path.join( dir, 'build/stat' ), { recursive: true } );
		const { onChange, stop } = await watching( dir );

		writeFileSync( path.join( dir, 'build/stat/index.js' ), 'v2' );
		await settle( 400 );
		stop();

		expect( onChange ).toHaveBeenCalledTimes( 1 );
		expect( existsSync( path.join( dir, 'build/stat/index.js' ) ) ).toBe(
			true
		);
	} );
} );
