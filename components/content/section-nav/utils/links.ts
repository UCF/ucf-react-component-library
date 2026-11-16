/**
 * The Section Nav's links, the same in every host: a heading's text as a link's, and an update
 * from the page that keeps an editor's changes. WordPress (integrations/wp/section-links.ts) and
 * Puck (integrations/puck/section-links.ts) each find the page's Sections their own way.
 */
import type { Link } from '@/integrations/schema/props';

const ENTITIES: Record< string, string > = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
};

/**
 * A heading's text: its saved HTML without tags, entities decoded, spaces collapsed.
 * UPSTREAM: core/heading's `content` is HTML, as a string or a RichTextData that prints as one;
 * Puck's Heading holds plain text, which passes through unchanged.
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
 * The page's Section links, with an editor's changes kept: a link they renamed keeps its text,
 * and a link to anywhere but a section of this page stays, after the Sections'. A link to a
 * Section that lost its anchor goes.
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
	return [
		...sections.map( ( link ) => ( {
			href: link.href,
			label: labels.get( link.href ) || link.label,
		} ) ),
		...current.filter( ( link ) => ! link.href.startsWith( '#' ) ),
	];
}
