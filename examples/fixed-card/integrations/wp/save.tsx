import { useBlockProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import FixedCard, { type FixedCardProps } from '../../FixedCard.tsx';
import { ownAttributes } from '@/integrations/wp/attributes';
import metadata from './block.json';
import type { Attributes } from './edit.tsx';

/**
 * The stored markup: the core Card, with its attributes as props.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	return (
		<FixedCard
			{ ...useBlockProps.save() }
			{ ...ownAttributes< FixedCardProps >( attributes, metadata ) }
		/>
	);
}
