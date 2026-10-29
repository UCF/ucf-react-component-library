/**
 * Editor entry: registers the Stat block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import '../../style.css';
import example from '../../example.json';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript reads block.json values as plain strings ("ucf" rather than a known
// category), so it has to be told the file is block metadata. WordPress validates it itself.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	// WHY here and not in block.json: block.json cannot reference another file, and the
	// inserter preview should be the same example Storybook and the test render.
	// UPSTREAM: @wordpress/blocks types `example.attributes` as the attribute schema rather
	// than attribute values, so real values need the cast.
	example: {
		attributes: example,
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
