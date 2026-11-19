/**
 * CONTEXT: link helpers shared by both editors. Each editor finds the page's Sections in its
 * own section-links.ts.
 */
import type { Link } from '@/core/hosts/prop-definitions';

const ENTITIES: Record< string, string > = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
};

/**
 * A heading's plain text: tags stripped, entities decoded, spaces collapsed.
 * UPSTREAM: core/heading's `content` is HTML (or RichTextData); Puck's is plain text.
 *
 * @param html A heading's content.
 */
export function textOf( html: unknown ): string {
	return String( html ?? '' )
		.replace( /<[^>]*>/g, '' )
		.replace( /&(#x?[0-9a-f]+|[a-z]+);/gi, ( entity, name: string ) => {
			if ( name[ 0 ] === '#' ) {
				const hex = name[ 1 ]?.toLowerCase() === 'x';
				const code = parseInt(
					name.slice( hex ? 2 : 1 ),
					hex ? 16 : 10
				);
				return Number.isNaN( code )
					? entity
					: String.fromCodePoint( code );
			}
			return ENTITIES[ name.toLowerCase() ] ?? entity;
		} )
		.replace( /\s+/g, ' ' )
		.trim();
}

/**
 * The page's Section links, keeping the editor's renamed labels.
 *
 * @param current  The Section Nav's links.
 * @param sections The page's Section links (sectionLinks()).
 */
export function updateLinks(
	current: readonly Link[],
	sections: readonly Link[]
): Link[] {
	const labels = new Map(
		current.map( ( link ) => [ link.href, link.label ] )
	);
	return sections.map( ( link ) => ( {
		href: link.href,
		label: labels.get( link.href ) || link.label,
	} ) );
}
