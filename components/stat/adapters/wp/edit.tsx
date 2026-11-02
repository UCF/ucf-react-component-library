import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Stat, { PARTS } from '../../Stat.tsx';

// SYNC: the attributes in block.json: none. Everything in a Stat is its inner blocks.
export type Attributes = Record< string, never >;

/**
 * What a new Stat starts with: three paragraphs, each with the class that styles it.
 *
 * WHY classes on core paragraphs: they are the part's name (Stat.tsx, PARTS). The Stat's CSS
 * styles them, and an editor sees them under Advanced, "Additional CSS class(es)".
 * WHY a starting point, not a lock: the frame's content is open; editors may change, move or
 * remove any of it. The source is a paragraph, so its link is core's link tool.
 * SYNC: TEMPLATE in adapters/puck/config.tsx, the same parts with the library's primitives.
 */
const TEMPLATE: [ string, Record< string, unknown > ][] = [
	[
		'core/paragraph',
		{
			className: PARTS.statement,
			placeholder: __(
				'The fact, as a complete statement',
				'ucf-content'
			),
		},
	],
	[
		'core/paragraph',
		{
			className: PARTS.detail,
			placeholder: __(
				'One sentence saying why the number matters',
				'ucf-content'
			),
		},
	],
	[
		'core/paragraph',
		{
			className: PARTS.source,
			placeholder: __(
				'Source: who published it, and when',
				'ucf-content'
			),
		},
	],
];

/**
 * The Stat's inner element, holding the blocks placed inside it.
 *
 * WHY passed as `innerAs`: the inner-blocks area is then the Stat's own inner element, as in
 * save() and in Puck, with no wrapper of WordPress's own in between.
 *
 * @param props The inner element's props from Stat.
 */
function InnerBlocksArea( props: object ) {
	return <div { ...useInnerBlocksProps( props, { template: TEMPLATE } ) } />;
}

/**
 * The editor view: the Stat, with its blocks editable inside it. It has no settings.
 */
export default function Edit( {}: BlockEditProps< Attributes > ) {
	return <Stat { ...useBlockProps() } innerAs={ InnerBlocksArea } />;
}
