/**
 * WordPress: the page's Sections as Section Nav links. A Section is linked when it has an HTML
 * anchor; its link's text is its first heading's.
 *
 * WHY plain functions over the editor's store: tests/section-links.test.ts runs them on a real
 * block-editor store without an editor, and edit.tsx calls them from useSelect.
 */
import type { Link } from '@/integrations/schema/props';
import { textOf } from '../../utils/links.ts';

/** A block as the editor's store gives it: only what is read here. */
export type BlockNode = {
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: readonly BlockNode[];
};

/** The block-editor store's selectors read here. */
export type BlockSelectors = {
	getBlocksByName: ( name: string ) => readonly string[];
	getBlock: ( clientId: string ) => BlockNode | null;
};

// SYNC: the Section's block name, in components/content/section/integrations/wp/block.json.
const SECTION = 'ucf-content/section';
const HEADING = 'core/heading';

/**
 * The first heading among some blocks, depth first: a Section's title.
 *
 * @param blocks A Section's inner blocks.
 */
function firstHeading( blocks: readonly BlockNode[] ): string {
	for ( const block of blocks ) {
		if ( block.name === HEADING ) {
			return textOf( block.attributes.content );
		}
		// WHY not into another Section: its heading is that Section's title.
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
 * Every Section in the editor, in page order, Sections inside others included.
 * FIX: not by walking getBlocks() down from the top. A page that shows its template keeps its
 * content as the Post Content block's controlled inner blocks, which getBlocks() leaves out, so
 * no Section was found. getBlocksByName() reads every block in the editor, in order.
 * WHY getBlock() for each: it returns the same object while the block is unchanged, so
 * useSelect re-renders only when a Section changes.
 *
 * @param store The block-editor store's selectors.
 */
export function pageSections( store: BlockSelectors ): BlockNode[] {
	return store
		.getBlocksByName( SECTION )
		.map( ( clientId ) => store.getBlock( clientId ) )
		.filter( ( block ): block is BlockNode => block !== null );
}

/**
 * A link to each Section with an HTML anchor, in the order given. One with no heading is
 * labeled with its anchor, for an editor to rename.
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
