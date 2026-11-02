import { useBlockProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Hero, { type HeroProps } from '../../Hero.tsx';
import type { Attributes } from './edit.tsx';

/**
 * The stored markup: the core Hero, with its attributes as props.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	// WHY without `align`: it is WordPress's own; useBlockProps.save() turns it into a class.
	const { align, ...props } = attributes as Attributes & { align?: string };

	return <Hero { ...useBlockProps.save() } { ...( props as HeroProps ) } />;
}
