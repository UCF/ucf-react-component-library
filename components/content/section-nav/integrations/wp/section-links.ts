/**
 * CONTEXT: Section Nav links from the block editor: one per Section with an HTML anchor,
 * labeled with its first heading. SYNC: integrations/puck/section-links.ts.
 *
 * WHY plain functions: tests run them on a real store without an editor.
 */
import type { Link } from '@/integrations/schema/props';
import { textOf } from '../../utils/links.ts';

/** The parts of a block read here. */
export type BlockNode = {
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: readonly BlockNode[];
};

/** The block-editor selectors used here. */
export type BlockSelectors = {
	getBlocksByName: ( name: string ) => readonly string[];
	getBlock: ( clientId: string ) => BlockNode | null;
};

// SYNC: components/content/section/integrations/wp/block.json.
const SECTION = 'ucf-content/section';
const HEADING = 'core/heading';

/**
 * A Section's title: its first heading, depth first.
 *
 * @param blocks A Section's inner blocks.
 */
function firstHeading( blocks: readonly BlockNode[] ): string {
	for ( const block of blocks ) {
		if ( block.name === HEADING ) {
			return textOf( block.attributes.content );
		}
		// WHY skip nested Sections: their headings are their own titles.
		if ( block.name !== SECTION ) {
			const inner = firstHeading( block.innerBlocks );
			if ( inner ) {
				return inner;
			}
		}
	}
	return '';
}

/**
 * Every Section in the editor, in page order.
 * FIX: getBlocks() misses Sections inside Post Content when the template is shown.
 * WHY getBlock(): it keeps the same object while unchanged, so useSelect re-renders less.
 *
 * @param store The block-editor selectors.
 */
export function pageSections( store: BlockSelectors ): BlockNode[] {
	return store
		.getBlocksByName( SECTION )
		.map( ( clientId ) => store.getBlock( clientId ) )
		.filter( ( block ): block is BlockNode => block !== null );
}

/**
 * A link to each anchored Section. A Section with no heading is labeled with its anchor.
 *
 * @param sections The page's Sections (pageSections()).
 */
export function sectionLinks( sections: readonly BlockNode[] ): Link[] {
	return sections.flatMap( ( section ) => {
		const anchor = section.attributes.anchor;
		if ( typeof anchor !== 'string' || ! anchor ) {
			return [];
		}
		const label = firstHeading( section.innerBlocks ) || anchor;
		return [ { label, href: `#${ anchor }` } ];
	} );
}
