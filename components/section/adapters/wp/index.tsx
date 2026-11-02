/**
 * Editor entry: registers the Section block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import '../../style.css';
import example from '../../example.json';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same cast in components/stat/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	// WHY blocks inside: the inserter preview should show what a Section is for. The same
	// heading and paragraph a new Section starts with (TEMPLATE in edit.tsx).
	example: {
		attributes: example,
		innerBlocks: [
			{
				name: 'core/heading',
				attributes: {
					level: 2,
					content: 'Florida’s largest university',
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					content:
						'A paragraph of body copy, on the band’s own background.',
				},
			},
		],
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
