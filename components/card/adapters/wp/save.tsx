import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Card, { type CardProps } from '../../Card.tsx';
import { ownAttributes } from '../../../_config/wp.ts';
import metadata from './block.json';
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
 * The stored markup: the frame, with its settings as props and its inner blocks inside.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	return (
		<Card
			{ ...useBlockProps.save() }
			{ ...ownAttributes< CardProps >( attributes, metadata ) }
			innerAs={ InnerBlocksContent }
		/>
	);
}
