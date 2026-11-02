/**
 * Editor entry: registers the Hero block.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

// WHY the Button's styles here: the Hero renders it. PERF: each block that uses the Button
// carries its CSS; move primitives into the plugins' shared base.css once several do.
import '../../../../primitives/button/style.css';
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
