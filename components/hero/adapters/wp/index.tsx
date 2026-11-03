/**
 * Editor entry: registers the Hero block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import '../../style.css';
import { PARTS } from '../../Hero.tsx';
import example from '../../example.json';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same casts in components/highlight/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	// WHY inner blocks in the example: the copy is the Hero's inner blocks, so the inserter
	// preview would show an empty band without them. The same copy as the Puck template.
	example: {
		attributes: example,
		innerBlocks: [
			{
				name: 'core/paragraph',
				attributes: {
					className: PARTS.eyebrow,
					content: 'Undergraduate admissions',
				},
			},
			{
				name: 'core/heading',
				attributes: {
					level: 1,
					className: PARTS.title,
					content: 'Reach for the stars',
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					className: PARTS.description,
					content:
						'Florida’s largest university, with 70,674 students, in Orlando and online.',
				},
			},
		],
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
