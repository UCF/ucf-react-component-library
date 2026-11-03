/**
 * Editor entry: registers the Highlight block, and each UCF highlight design as a variation
 * of it (variations.ts), as the Card does.
 */
import {
	registerBlockType,
	type BlockConfiguration,
	type BlockVariation,
} from '@wordpress/blocks';

import {
	alignCenter,
	chartBar,
	cornerTopLeft,
	sidesLeft,
	sidesTop,
	starFilled,
} from '@wordpress/icons';

import '../../style.css';
import { PARTS } from '../../Highlight.tsx';
import example from '../../example.json';
import { VARIATIONS } from '../../variations.ts';
import { toBlocks } from './blocks.ts';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript reads block.json values as plain strings ("ucf" rather than a known
// category), so it has to be told the file is block metadata. WordPress validates it itself.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

// WHY icons here, not in block.json: block.json takes only a Dashicon name, and WordPress's own
// icon set (@wordpress/icons, the one core's blocks use) has closer pictures.
// Each design's icon, by its name in variations.ts: the shape of the design where it can.
// variations.test.tsx checks every design has one.
export const VARIATION_ICONS: Record< string, JSX.Element > = {
	statement: sidesTop,
	'key-figure': chartBar,
	bracket: cornerTopLeft,
	'side-rule': sidesLeft,
	centered: alignCenter,
};

registerBlockType< Attributes >( blockMetadata, {
	icon: starFilled,
	// WHY inner blocks in the example: a Highlight's content is its inner blocks, so the inserter
	// preview is empty without them. The statement design's text, written in.
	// UPSTREAM: @wordpress/blocks types `example` loosely, so it needs the cast.
	example: {
		attributes: example,
		innerBlocks: ( VARIATIONS[ 0 ]?.content ?? [] ).flatMap( ( part ) =>
			part.kind === 'text'
				? [
						{
							name: 'core/paragraph',
							attributes: {
								className: PARTS[ part.part ],
								content: part.text,
							},
						},
					]
				: []
		),
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	// WHY the first is the default: inserting "Highlight" gives the statement, the common one.
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
