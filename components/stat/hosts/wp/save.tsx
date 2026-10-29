import { useBlockProps } from '@wordpress/block-editor';
import type { BlockSaveProps } from '@wordpress/blocks';

import Stat from '../../Stat.tsx';
import type { Attributes } from './edit.tsx';

/**
 * The stored markup: the core component, with strings in its slots.
 *
 * @param props            The block's save props.
 * @param props.attributes Its attributes.
 */
export default function save( { attributes }: BlockSaveProps< Attributes > ) {
	const { statement, detail, source, sourceUrl, asOf } = attributes;

	return (
		<Stat
			{ ...useBlockProps.save() }
			statement={ statement }
			detail={ detail }
			source={ source }
			sourceUrl={ sourceUrl }
			asOf={ asOf }
		/>
	);
}
