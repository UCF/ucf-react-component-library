/**
 * CONTEXT: Section Nav links from Puck's page data: one per Section with an HTML anchor,
 * labeled with its first heading. SYNC: hosts/wp/section-links.ts.
 *
 * WHY keys: Puck names components by the site's registered keys, which the library can't know.
 */
import type { Link } from '@/core/hosts/prop-definitions';
import type { PuckSlot } from '@/core/hosts/puck/types';
import { textOf } from '../../utils/links.ts';

/** The parts of Puck's page data read here. */
export type PuckPage = {
	content: PuckSlot;
	/** Puck's legacy drop zones. */
	zones?: Record< string, PuckSlot >;
};

/** The site's component keys for Section and Heading. */
export type SectionKeys = { section: string; heading: string };

type Item = PuckSlot[ number ];

const isItem = ( value: unknown ): value is Item =>
	typeof value === 'object' &&
	value !== null &&
	typeof ( value as Item ).type === 'string' &&
	typeof ( value as Item ).props === 'object';

/**
 * The components in every slot of a component.
 *
 * @param item A component on the page.
 */
const inside = ( item: Item ): Item[] =>
	Object.values( item.props ).flatMap( ( value ) =>
		Array.isArray( value ) ? value.filter( isItem ) : []
	);

/**
 * A Section's title: its first heading, depth first.
 *
 * @param items A Section's contents.
 * @param keys  The site's component keys.
 */
function firstHeading( items: readonly Item[], keys: SectionKeys ): string {
	for ( const item of items ) {
		if ( item.type === keys.heading ) {
			return textOf( item.props.content );
		}
		// WHY skip nested Sections: their headings are their own titles.
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
 * A link to each anchored Section, in page order, nested ones included. A Section with no
 * heading is labeled with its anchor.
 *
 * @param page Puck's page data.
 * @param keys The site's component keys.
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
