/**
 * CONTEXT: what every live component's PHP test needs (docs/architecture.md, "Three kinds of
 * component"): its markup exists in React and in PHP, and the test runs the real PHP under
 * plain `php`, with WordPress's few functions stubbed, and compares the two.
 *
 * Used by each live component's tests/{Name}.php.test.tsx, which runs in happy-dom (for
 * sameHtml()).
 * UPSTREAM: where `php` isn't installed, those tests skip, as scripts/shared-php.test.mjs does.
 * CI has it.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Whether `php` runs here. */
export const hasPhp = ( () => {
	try {
		execFileSync( 'php', [ '-v' ], { stdio: 'ignore' } );
		return true;
	} catch {
		return false;
	}
} )();

/**
 * WordPress's functions a live block's PHP calls, as plain PHP.
 * WHY esc_url() as plain escaping: what's compared is the markup around a URL, not WordPress's
 * URL cleaning.
 * WHY get_block_wrapper_attributes() writes every attribute it's given: WordPress does, with the
 * block's own classes added, which a test has no block for.
 * WHY the cache records what it's given: a test checks what render.php caches, and for how long.
 */
export const WP_STUBS = `
define( 'ABSPATH', __DIR__ );
define( 'MINUTE_IN_SECONDS', 60 );
define( 'HOUR_IN_SECONDS', 3600 );
function esc_html( $s ) { return htmlspecialchars( (string) $s, ENT_QUOTES, 'UTF-8' ); }
function esc_attr( $s ) { return esc_html( $s ); }
function esc_url( $s ) { return esc_html( $s ); }
function get_block_wrapper_attributes( $extra ) { $out = array(); foreach ( $extra as $name => $value ) { $out[] = $name . '="' . esc_attr( $value ) . '"'; } return implode( ' ', $out ); }
class WP_Error {}
function is_wp_error( $thing ) { return $thing instanceof WP_Error; }
function wp_remote_retrieve_response_code( $response ) { return $response['response']['code']; }
function wp_remote_retrieve_body( $response ) { return $response['body']; }
$GLOBALS['ucf_test'] = array( 'requests' => array(), 'cached' => array() );
function get_transient( $key ) { return false; }
function set_transient( $key, $value, $seconds ) { $GLOBALS['ucf_test']['cached'][] = array( $key, is_array( $value ) ? count( $value ) : 0, $seconds ); return true; }
`;

/**
 * A PHP single-quoted string. WHY not JSON.stringify(): PHP reads `$` inside double quotes.
 *
 * @param text Any text.
 */
export function phpString( text: string ): string {
	return `'${ text.replace( /\\/g, '\\\\' ).replace( /'/g, "\\'" ) }'`;
}

// One folder per test file, removed when it ends. FIX: a folder and an exit listener per file
// written added up past Node's listener limit.
let dir = '';
let count = 0;

/**
 * Write a file the PHP can read, in a folder removed when the process ends.
 *
 * @param contents The file's contents.
 * @return Its path.
 */
export function tempFile( contents: string ): string {
	if ( ! dir ) {
		const made = mkdtempSync( path.join( os.tmpdir(), 'ucf-live-' ) );
		process.once( 'exit', () =>
			rmSync( made, { recursive: true, force: true } )
		);
		dir = made;
	}
	count += 1;
	const file = path.join( dir, `${ count }.tmp` );
	writeFileSync( file, contents );
	return file;
}

/**
 * Run PHP after the stubs, and return what it printed.
 *
 * @param body            PHP, without `<?php`.
 * @param options         How to run it.
 * @param options.disable Functions to remove, as on a host without their extension.
 *                        WHY disable_functions: extensions such as mbstring are often built
 *                        into PHP, so they can't be left out with `-n`.
 */
export function php(
	body: string,
	{ disable = [] }: { disable?: readonly string[] } = {}
): string {
	return execFileSync(
		'php',
		[
			...( disable.length
				? [ '-d', `disable_functions=${ disable.join( ',' ) }` ]
				: [] ),
			tempFile( `<?php\n${ WP_STUBS }\n${ body }` ),
		],
		{ encoding: 'utf8' }
	);
}

/**
 * HTML as a browser reads it, so equal markup compares equal however it was written.
 * WHY: React and esc_html() escape differently and both are right (React writes `'` as
 * `&#x27;`, esc_html() as `&#039;`; React writes `dateTime`, PHP `datetime`).
 * WHY whitespace-only text between tags is dropped: a render.php written as a template indents
 * its tags, and React writes none. Each live component's render.php says why its whitespace
 * isn't shown. Text with anything but whitespace in it is compared as it is.
 *
 * @param html Markup.
 */
export function sameHtml( html: string ): string {
	const template = document.createElement( 'template' );
	template.innerHTML = html;
	const walker = document.createTreeWalker(
		template.content,
		NodeFilter.SHOW_TEXT
	);
	const blank: Node[] = [];
	while ( walker.nextNode() ) {
		if ( ! /\S/.test( walker.currentNode.textContent ?? '' ) ) {
			blank.push( walker.currentNode );
		}
	}
	blank.forEach( ( node ) => node.parentNode?.removeChild( node ) );
	return template.innerHTML;
}
