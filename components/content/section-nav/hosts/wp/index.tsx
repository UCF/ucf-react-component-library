/** CONTEXT: registers the Section Nav block. */
// UPSTREAM: webpack builds the block's stylesheet from its script's imports.
import '../../style.css';
import { registerBlockType, type BlockConfiguration } from '@wordpress/blocks';

import { blockSettings } from '@/core/hosts/wordpress/block';
import SectionNav from '../../SectionNav.tsx';
import metadata from './block.json';
import edit from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript types block.json's values as plain strings.
registerBlockType( metadata as unknown as BlockConfiguration, {
	...blockSettings( SectionNav ),
	edit,
	save,
} );
