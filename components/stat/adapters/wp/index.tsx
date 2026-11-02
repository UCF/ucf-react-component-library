/**
 * Editor entry: registers the Stat block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import '../../style.css';
import { PARTS } from '../../Stat.tsx';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript reads block.json values as plain strings ("ucf" rather than a known
// category), so it has to be told the file is block metadata. WordPress validates it itself.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	// WHY inner blocks in the example: a Stat's content is its inner blocks, so the inserter
	// preview is empty without them. The same text as the Puck template (adapters/puck).
	// UPSTREAM: @wordpress/blocks types `example` loosely, so it needs the cast.
	example: {
		attributes: {},
		innerBlocks: [
			{
				name: 'core/paragraph',
				attributes: {
					className: PARTS.statement,
					content:
						'Florida’s largest university, with 70,674 students',
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					className: PARTS.detail,
					content: 'One sentence saying why the number matters.',
				},
			},
			{
				name: 'core/paragraph',
				attributes: {
					className: PARTS.source,
					content:
						'Source: <a href="https://www.ucf.edu/about-ucf/facts/">UCF Facts</a>, fall 2025',
				},
			},
		],
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
