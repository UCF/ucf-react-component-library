/** CONTEXT: registers the Quick Links' block: its settings from its port, and its edit and save. */
// WHY imported here: webpack builds the block's stylesheet from what its script imports.
import '../../style.css';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import { blockSettings } from '@/core/hosts/wordpress/block';
import QuickLinks from '../../QuickLinks.tsx';
import metadata from './block.json';
import edit from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript reads block.json's values as plain strings, not WordPress's types.
registerBlockType( metadata as unknown as BlockConfiguration, {
	...blockSettings( QuickLinks ),
	edit,
	save,
} );
