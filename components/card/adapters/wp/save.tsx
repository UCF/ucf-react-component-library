import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Card from '../../Card.tsx';
import type { Attributes } from './edit.tsx';

/**
 * The saved inner element, with the blocks placed inside the frame.
 *
 * @param props The inner element's props from Card.
 */
function InnerBlocksContent( props: Record< string, unknown > ) {
	return <div { ...useInnerBlocksProps.save( props ) } />;
}

/**
 * The stored markup: the frame, its inner blocks inside its inner element.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	return (
		<Card
			{ ...useBlockProps.save() }
			variant={ attributes.variant }
			innerAs={ InnerBlocksContent }
		/>
	);
}
