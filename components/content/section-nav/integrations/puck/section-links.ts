/**
 * Puck: the page's Sections as Section Nav links, from Puck's page data. A Section is linked
 * when it has an HTML anchor; its link's text is its first heading's, as in WordPress
 * (integrations/wp/section-links.ts).
 *
 * WHY by the keys a site passes: a Puck page names each component by the key the site
 * registered it under (the demo's `Section` and `Heading`), which the library can't know.
 */
import type { Link } from '@/integrations/schema/props';
import type { PuckSlot } from '@/integrations/puck/types';
import { textOf } from '../../utils/links.ts';

/** A Puck page as its data holds it: only what is read here. */
export type PuckPage = {
	content: PuckSlot;
	/** Puck's older drop zones, by name: more components, outside the slots. */
	zones?: Record< string, PuckSlot >;
};

/** The keys a site registered the Section and the Heading under. */
export type SectionKeys = { section: string; heading: string };

type Item = PuckSlot[ number ];

const isItem = ( value: unknown ): value is Item =>
	typeof value === 'object' &&
	value !== null &&
	typeof ( value as Item ).type === 'string' &&
	typeof ( value as Item ).props === 'object';

/**
 * The components inside one: every slot it has (a Section's contents, a Column's).
 *
 * @param item A component on the page.
 */
const inside = ( item: Item ): Item[] =>
	Object.values( item.props ).flatMap( ( value ) =>
		Array.isArray( value ) ? value.filter( isItem ) : []
	);

/**
 * The first heading among some components, depth first: a Section's title.
 *
 * @param items A Section's contents.
 * @param keys  The keys the site registered the Section and the Heading under.
 */
function firstHeading( items: readonly Item[], keys: SectionKeys ): string {
	for ( const item of items ) {
		if ( item.type === keys.heading ) {
			return textOf( item.props.content );
		}
		// WHY not into another Section: its heading is that Section's title.
		if ( item.type !== keys.section ) {
			const found = firstHeading( inside( item ), keys );
			if ( found ) {
				return found;
			}
		}
	}
	return '';
}

/**
 * A link to each Section with an HTML anchor, in page order, Sections inside others (and
 * inside Columns) included. One with no heading is labeled with its anchor, for an editor to
 * rename.
 *
 * @param page Puck's page data.
 * @param keys The keys the site registered the Section and the Heading under.
 */
export function puckSectionLinks( page: PuckPage, keys: SectionKeys ): Link[] {
	const links: Link[] = [];
	const visit = ( items: readonly Item[] ) => {
		for ( const item of items ) {
			const anchor = item.props.anchor;
			if (
				item.type === keys.section &&
				typeof anchor === 'string' &&
				anchor
			) {
				links.push( {
					label: firstHeading( inside( item ), keys ) || anchor,
					href: `#${ anchor }`,
				} );
			}
			visit( inside( item ) );
		}
	};
	visit( page.content );
	for ( const zone of Object.values( page.zones ?? {} ) ) {
		visit( zone );
	}
	return links;
}
