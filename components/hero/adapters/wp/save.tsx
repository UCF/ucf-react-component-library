import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Hero, { type HeroProps } from '../../Hero.tsx';
import { ownAttributes } from '../../../_config/wp.ts';
import metadata from './block.json';
import type { Attributes } from './edit.tsx';

/**
 * The saved copy element, with the blocks placed inside the Hero.
 *
 * @param props The copy element's props from Hero.
 */
function InnerBlocksContent( props: Record< string, unknown > ) {
	return <div { ...useInnerBlocksProps.save( props ) } />;
}

/**
 * The stored markup: the Hero, with its attributes as props and its inner blocks as its copy.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	// WHY without `align`: it is WordPress's own; useBlockProps.save() turns it into a class.
	const { align, ...props } = ownAttributes< HeroProps & { align?: string } >(
		attributes,
		metadata
	);

	return (
		<Hero
			{ ...useBlockProps.save() }
			{ ...( props as HeroProps ) }
			innerAs={ InnerBlocksContent }
		/>
	);
}
