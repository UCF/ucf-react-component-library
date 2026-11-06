/**
 * Editor entry: registers the Degree Finder block.
 */
import { institution } from '@wordpress/icons';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';

// UPSTREAM: see the same cast in components/content/highlight/integrations/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

// WHY icons here, not in block.json: block.json takes only a Dashicon name, and WordPress's own
// icon set (@wordpress/icons, the one core's blocks use) has closer pictures.
registerBlockType< Attributes >( blockMetadata, {
	icon: institution,
	edit: Edit,
	// WHY null: a dynamic block. render.php builds the front end on every request, so the
	// post stores only the attributes and a later change to the component can never make a
	// saved block invalid.
	save: () => null,
} );
