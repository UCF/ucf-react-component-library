import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Highlight, { type HighlightProps } from '../../Highlight.tsx';
import { ownAttributes } from '../../../_config/wp.ts';
import metadata from './block.json';
import type { Attributes } from './edit.tsx';

/**
 * The saved inner element, with the blocks placed inside the Highlight.
 *
 * @param props The inner element's props from Highlight.
 */
function InnerBlocksContent( props: Record< string, unknown > ) {
	return <div { ...useInnerBlocksProps.save( props ) } />;
}

/**
 * The stored markup: the Highlight, its settings as props and its inner blocks inside.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	return (
		<Highlight
			{ ...useBlockProps.save() }
			{ ...ownAttributes< HighlightProps >( attributes, metadata ) }
			innerAs={ InnerBlocksContent }
		/>
	);
}
