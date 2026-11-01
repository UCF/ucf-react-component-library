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
	// WHY a Stat inside: the inserter preview should show what a Section is for.
	example: {
		attributes: example,
		innerBlocks: [
			{
				name: 'ucf-content/stat',
				attributes: {
					statement:
						'Florida’s largest university, with 70,674 students',
				},
			},
		],
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
