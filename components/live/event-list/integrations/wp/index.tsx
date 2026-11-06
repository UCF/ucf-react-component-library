/** Registers the Event List's block. */
// WHY imported here: webpack builds the block's stylesheet from what its script imports.
import '../../style.css';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';

// UPSTREAM: TypeScript reads block.json's values as plain strings, not WordPress's types.
registerBlockType< Attributes >(
	metadata as unknown as BlockConfiguration< Attributes >,
	{
		edit: Edit,
		// WHY null: a live block. render.php writes the list on every request, so the post
		// stores only the attributes.
		save: () => null,
	}
);
