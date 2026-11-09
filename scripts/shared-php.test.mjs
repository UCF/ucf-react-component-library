/**
 * CONTEXT: checks plugins/shared/shared.php, which the build copies into every plugin. With two
 * plugins active, WordPress loads two copies, and the second must not redeclare anything.
 *
 * FIX: the file once guarded itself with an early `return` when its function already existed.
 * PHP declares a file's top-level functions as it compiles the file, before that line runs, so
 * activating a second plugin was a fatal error ("Cannot redeclare
 * ucf_components_register_plugin()").
 *
 * Runs the real file with the PHP command line, with the few WordPress functions it calls
 * stubbed. Skipped where PHP isn't installed; CI has it.
 */
import { execFileSync } from 'node:child_process';
import {
	copyFileSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, test } from 'vitest';

const repo = path.dirname( path.dirname( fileURLToPath( import.meta.url ) ) );

const hasPhp = ( () => {
	try {
		execFileSync( 'php', [ '-v' ], { stdio: 'ignore' } );
		return true;
	} catch {
		return false;
	}
} )();

let tmp;

beforeEach( () => {
	tmp = mkdtempSync( path.join( os.tmpdir(), 'ucf-shared-php-' ) );
} );

afterEach( () => {
	rmSync( tmp, { recursive: true, force: true } );
} );

test.skipIf( ! hasPhp )(
	'two plugins can each load their copy of shared.php',
	() => {
		// Two plugins' build folders, each with its own copy, as the build makes them.
		const copies = [ 'ucf-content', 'ucf-degrees' ].map( ( plugin ) => {
			const file = path.join( tmp, plugin, 'build', 'shared.php' );
			mkdirSync( path.dirname( file ), { recursive: true } );
			copyFileSync(
				path.join( repo, 'plugins/shared/shared.php' ),
				file
			);
			return file;
		} );

		const script = path.join( tmp, 'run.php' );
		writeFileSync(
			script,
			`<?php
define( 'ABSPATH', __DIR__ );
$GLOBALS['actions'] = 0;
function add_action() { $GLOBALS['actions']++; }
function add_filter() {}
function has_filter() { return false; }
function __( $text ) { return $text; }

foreach ( ${ JSON.stringify( copies ) } as $copy ) {
	require_once $copy;
	ucf_components_register_plugin( dirname( $copy ), 'https://example.test' );
}

echo json_encode( array( 'actions' => $GLOBALS['actions'] ) );
`
		);

		const output = execFileSync( 'php', [ script ], {
			encoding: 'utf8',
		} );

		// Each plugin registered its own blocks and stylesheet: two actions apiece.
		expect( JSON.parse( output ) ).toEqual( { actions: 4 } );
	}
);

// WHY: two plugins each add the categories through their copy of shared.php. Each must appear
// once, first, and in the order Storybook groups them.
test.skipIf( ! hasPhp )(
	'adds the UCF categories once each, first, whatever already holds them',
	() => {
		const script = path.join( tmp, 'categories.php' );
		writeFileSync(
			script,
			`<?php
define( 'ABSPATH', __DIR__ );
function __( $text ) { return $text; }
require_once ${ JSON.stringify( path.join( repo, 'plugins/shared/shared.php' ) ) };

$once  = ucf_components_block_category( array( array( 'slug' => 'text' ) ) );
$twice = ucf_components_block_category( $once );
echo json_encode( array_column( $twice, 'slug' ) );
`
		);

		expect(
			JSON.parse(
				execFileSync( 'php', [ script ], { encoding: 'utf8' } )
			)
		).toEqual( [ 'ucf-content', 'ucf-interactive', 'text' ] );
	}
);
