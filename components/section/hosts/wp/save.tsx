import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Section from '../../Section.tsx';
import type { Attributes } from './edit.tsx';

/**
 * The saved inner element, with the blocks placed inside the Section.
 *
 * @param props The inner element's props from Section.
 */
function InnerBlocksContent( props: Record< string, unknown > ) {
	return <div { ...useInnerBlocksProps.save( props ) } />;
}

/**
 * The stored markup: the core Section, its inner blocks inside its inner element.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	const { composition, width, spacing } = attributes;

	return (
		<Section
			{ ...useBlockProps.save() }
			composition={ composition }
			width={ width }
			spacing={ spacing }
			innerAs={ InnerBlocksContent }
		/>
	);
}
