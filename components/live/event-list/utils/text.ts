/**
 * Plain text from the feed's HTML.
 *
 * SYNC: integrations/wp/client.php does the same in PHP, step for step, and
 * tests/EventList.php.test.tsx fails when the two disagree. WHY written out, not left to each
 * language's own helpers: PHP's and JavaScript's differ (which entities they know, what counts
 * as a space), and the two must turn the same feed into the same text.
 */

// WHY this set: the named entities the feed's descriptions use. Others stay as written.
const NAMED_ENTITIES: Record< string, string > = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ndash: '–',
	mdash: '—',
	hellip: '…',
	lsquo: '‘',
	rsquo: '’',
	ldquo: '“',
	rdquo: '”',
};

// WHY spelled out: `\s` means different characters in JavaScript and PHP.
const SPACES = /[\t\n\v\f\r \u00a0]+/g;

/** How many words of a description the list shows. SYNC: client.php. */
export const SUMMARY_WORDS = 40;

/**
 * Decode HTML entities: numeric ones, and the named ones above.
 *
 * @param text Text with entities.
 * @return The text, decoded.
 */
export function decodeEntities( text: string ): string {
	return text.replace(
		/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g,
		( match, code: string ) => {
			if ( code.startsWith( '#' ) ) {
				const point =
					code[ 1 ] === 'x' || code[ 1 ] === 'X'
						? parseInt( code.slice( 2 ), 16 )
						: parseInt( code.slice( 1 ), 10 );
				// WHY not a surrogate: half a character, which PHP won't encode either.
				const valid =
					point > 0 &&
					point <= 0x10ffff &&
					( point < 0xd800 || point > 0xdfff );
				return valid ? String.fromCodePoint( point ) : match;
			}
			return NAMED_ENTITIES[ code ] ?? match;
		}
	);
}

/**
 * One line of plain text: tags removed, entities decoded, runs of space made one.
 *
 * @param html The feed's text, which may hold HTML.
 * @return Plain text.
 */
export function plainText( html: string ): string {
	// WHY not trim(): it removes more kinds of space than PHP's trim() does.
	return decodeEntities( html.replace( /<[^>]*>/g, ' ' ) )
		.replace( SPACES, ' ' )
		.replace( /^ | $/g, '' );
}

/**
 * The first words of a description, with an ellipsis when there were more.
 *
 * @param html  The description, as the feed's HTML.
 * @param words How many words to keep.
 * @return Plain text.
 */
export function summarize( html: string, words = SUMMARY_WORDS ): string {
	const all = plainText( html ).split( ' ' ).filter( Boolean );
	return all.length > words
		? `${ all.slice( 0, words ).join( ' ' ) }…`
		: all.join( ' ' );
}
