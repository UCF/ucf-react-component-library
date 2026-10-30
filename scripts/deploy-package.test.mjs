/**
 * CONTEXT: checks scripts/deploy-package.mjs against throwaway folders: that it refuses a folder
 * holding anything but this package, and copies package.json and dist/ only.
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
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { checkPackageTarget, deployPackage } from './deploy-package.mjs';

let tmp;
let source;
let site;

/**
 * A folder holding a package.json with this name.
 *
 * @param {string} dir  The folder.
 * @param {string} name The package name.
 */
function writePackage( dir, name ) {
	mkdirSync( dir, { recursive: true } );
	writeFileSync(
		path.join( dir, 'package.json' ),
		JSON.stringify( { name } )
	);
}

beforeEach( () => {
	tmp = mkdtempSync( path.join( os.tmpdir(), 'ucf-deploy-package-' ) );
	// This repo, after a build: package.json, dist/, and source that must not ship.
	source = path.join( tmp, 'repo' );
	writePackage( source, '@ucf/components' );
	mkdirSync( path.join( source, 'dist/stat' ), { recursive: true } );
	writeFileSync( path.join( source, 'dist/ucf.css' ), 'v1' );
	writeFileSync( path.join( source, 'dist/stat/index.js' ), 'v1' );
	mkdirSync( path.join( source, 'components' ) );
	// A React site with a vendor/ folder to install from.
	site = path.join( tmp, 'site' );
	mkdirSync( path.join( site, 'vendor' ), { recursive: true } );
} );

afterEach( () => {
	rmSync( tmp, { recursive: true, force: true } );
} );

describe( 'checkPackageTarget', () => {
	test( 'accepts a new folder in a folder that exists', () => {
		const dir = path.join( site, 'vendor/ucf-components' );
		expect( checkPackageTarget( dir, source ) ).toBe( dir );
	} );

	test( 'accepts a folder an earlier deploy made', () => {
		const dir = path.join( site, 'vendor/ucf-components' );
		writePackage( dir, '@ucf/components' );
		expect( checkPackageTarget( dir, source ) ).toBe( dir );
	} );

	test.each( [
		[ 'unset', () => undefined, /not set/ ],
		[ 'relative', () => 'vendor/ucf-components', /absolute/ ],
		[
			'in a folder that doesn’t exist',
			() => path.join( site, 'nowhere/ucf-components' ),
			/doesn’t exist/,
		],
		[ 'the site itself', () => site, /something other than/ ],
	] )( 'refuses a folder that is %s', ( _, dir, message ) => {
		expect( () => checkPackageTarget( dir(), source ) ).toThrow( message );
	} );

	test( 'refuses a folder holding another package', () => {
		const dir = path.join( site, 'vendor/other' );
		writePackage( dir, 'left-pad' );
		expect( () => checkPackageTarget( dir, source ) ).toThrow(
			/something other than @ucf\/components/
		);
	} );
} );

describe( 'deployPackage', () => {
	test( 'drops devDependencies and scripts from the copied package.json', () => {
		writeFileSync(
			path.join( source, 'package.json' ),
			JSON.stringify( {
				name: '@ucf/components',
				exports: { './stat': './dist/stat/index.js' },
				peerDependencies: { react: '>=18.3' },
				devDependencies: { react: '^18.3.1' },
				scripts: { build: 'node build.mjs' },
			} )
		);
		const dir = path.join( site, 'vendor/ucf-components' );
		deployPackage( dir, source );

		expect(
			JSON.parse(
				readFileSync( path.join( dir, 'package.json' ), 'utf8' )
			)
		).toEqual( {
			name: '@ucf/components',
			exports: { './stat': './dist/stat/index.js' },
			peerDependencies: { react: '>=18.3' },
		} );
	} );

	test( 'copies package.json and dist/, and nothing else', () => {
		const dir = path.join( site, 'vendor/ucf-components' );
		deployPackage( dir, source );

		expect( readdirSync( dir ).sort() ).toEqual( [
			'dist',
			'package.json',
		] );
		expect(
			readFileSync( path.join( dir, 'dist/stat/index.js' ), 'utf8' )
		).toBe( 'v1' );
	} );

	test( 'replaces an earlier copy, dropping files the new build no longer has', () => {
		const dir = path.join( site, 'vendor/ucf-components' );
		writePackage( dir, '@ucf/components' );
		mkdirSync( path.join( dir, 'dist' ) );
		writeFileSync( path.join( dir, 'dist/removed.js' ), 'old' );

		deployPackage( dir, source );

		expect( existsSync( path.join( dir, 'dist/removed.js' ) ) ).toBe(
			false
		);
	} );

	test( 'refuses before copying when the package isn’t built', () => {
		rmSync( path.join( source, 'dist/ucf.css' ) );
		const dir = path.join( site, 'vendor/ucf-components' );

		expect( () => deployPackage( dir, source ) ).toThrow( /npm run build/ );
		expect( existsSync( dir ) ).toBe( false );
	} );
} );
