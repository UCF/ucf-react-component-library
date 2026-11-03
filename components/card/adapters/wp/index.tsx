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
import {
	arrowRight,
	button,
	overlayText,
	people,
	postFeaturedImage,
} from '@wordpress/icons';

import '../../style.css';
import example from '../../example.json';
import { VARIATIONS } from '../../variations.ts';
import { toBlocks } from './blocks.ts';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: see the same casts in components/highlight/adapters/wp/index.tsx.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

// WHY icons here, not in block.json: block.json takes only a Dashicon name, and WordPress's own
// icon set (@wordpress/icons, the one core's blocks use) has closer pictures.
// Each design's icon, by its name in variations.ts: the shape of the design where it can.
// variations.test.tsx checks every design has one.
export const VARIATION_ICONS: Record< string, JSX.Element > = {
	story: postFeaturedImage,
	'next-step': button,
	audience: people,
	pathway: arrowRight,
	media: overlayText,
};

registerBlockType< Attributes >( blockMetadata, {
	icon: postFeaturedImage,
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
		icon: VARIATION_ICONS[ variation.name ],
		attributes: variation.settings,
		innerBlocks: toBlocks( variation.content ),
		isDefault: index === 0,
		scope: [ 'inserter' ],
	} ) ) as unknown as BlockVariation< Attributes >[],
	edit: Edit,
	save,
} );
