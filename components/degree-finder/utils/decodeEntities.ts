const NAMED_ENTITIES: Record< string, string > = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
};

/**
 * Decodes the HTML entities WordPress puts in rendered titles, such as "&#8211;" and "&#038;".
 *
 * WHY not the DOM: works without one, so it is safe to run during server rendering.
 *
 * @param text Text from the API, possibly missing.
 * @return The decoded text, or '' when there was none.
 */
export function decodeEntities( text: string | null | undefined = '' ): string {
	return String( text ?? '' ).replace(
		/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
		( match, code: string ) => {
			if ( code.startsWith( '#' ) ) {
				const point =
					code[ 1 ]?.toLowerCase() === 'x'
						? parseInt( code.slice( 2 ), 16 )
						: parseInt( code.slice( 1 ), 10 );

				return point >= 0 && point <= 0x10ffff
					? String.fromCodePoint( point )
					: match;
			}

			return NAMED_ENTITIES[ code.toLowerCase() ] ?? match;
		}
	);
}
