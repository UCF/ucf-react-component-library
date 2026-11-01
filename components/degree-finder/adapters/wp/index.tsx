/**
 * Editor entry: registers the Degree Finder block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';

// UPSTREAM: see the same cast in components/stat/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	edit: Edit,
	// WHY null: a dynamic block. render.php builds the front end on every request, so the
	// post stores only the attributes and a later change to the component can never make a
	// saved block invalid.
	save: () => null,
} );
