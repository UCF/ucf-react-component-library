/**
 * Editor entry: registers the fixed Card example block. Nothing imports this: no plugin ships it.
 */
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

// WHY the Image's styles here: the Card renders it. PERF: each block that uses a primitive
// carries its CSS; move primitives into the plugins' shared base.css once several do.
import '@/components/primitives/image/style.css';
import '../../style.css';
import example from '../../example.json';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same casts in components/content/highlight/integrations/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	example: {
		attributes: example,
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	edit: Edit,
	save,
} );
