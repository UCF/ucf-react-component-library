/**
 * Editor entry: registers the Card block, and each UCF card design as a variation of it.
 *
 * WHY variations: each design (variations.ts) is the Card with some settings and starting
 * blocks. As a variation it is its own entry in the inserter ("Pathway card"), and still the
 * one block, so an editor can turn a story card into a pathway card in the sidebar.
 */
import {
	registerBlockType,
	type BlockConfiguration,
	type BlockVariation,
} from '@wordpress/blocks';

import '../../../../primitives/image/style.css';
import '../../style.css';
import example from '../../example.json';
import { VARIATIONS } from '../../variations.ts';
import { toBlocks } from './blocks.ts';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same casts in components/stat/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	example: {
		attributes: example,
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	// WHY the first is the default: inserting "Card" gives the story card, the common one.
	// UPSTREAM: @wordpress/blocks types innerBlocks as its own template type, which this
	// file's Template matches in shape, not in name.
	variations: VARIATIONS.map( ( variation, index ) => ( {
		name: variation.name,
		title: variation.title,
		description: variation.description,
		attributes: variation.settings,
		innerBlocks: toBlocks( variation.content ),
		isDefault: index === 0,
		scope: [ 'inserter' ],
	} ) ) as unknown as BlockVariation< Attributes >[],
	edit: Edit,
	save,
} );
