/**
 * Editor entry: registers the Card block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import '../../style.css';
import example from '../../example.json';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same casts in components/stat/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	example: {
		attributes: example,
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
