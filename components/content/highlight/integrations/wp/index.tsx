/**
 * Editor entry: registers the Highlight block, and each of its presets as a variation of it, as
 * the Card does.
 *
 * WHY variations: each preset (Highlight.presets.ts) is the Highlight with some props and
 * starting blocks; "block variation" is WordPress's name for that. As a variation it is its own
 * entry in the inserter ("Highlight: Key figure"), and still the one block.
 */
import {
	registerBlockType,
	type BlockConfiguration,
	type BlockVariation,
} from '@wordpress/blocks';

import '../../style.css';
import { PARTS } from '../../Highlight.parts.ts';
import { DEFAULT_PRESET, PRESETS } from '../../Highlight.presets.ts';
import { resolveParts } from '../../../../../integrations/schema/parts.ts';
import {
	toBlocks,
	toExampleBlocks,
} from '../../../../../integrations/wp/parts.ts';
import { ICONS } from '../../../../../integrations/wp/icons.ts';
import metadata from './block.json';
import Edit, { type Attributes } from './edit.tsx';
import save from './save.tsx';

// UPSTREAM: TypeScript reads block.json values as plain strings ("ucf" rather than a known
// category), so it has to be told the file is block metadata. WordPress validates it itself.
const blockMetadata = metadata as unknown as BlockConfiguration< Attributes >;

registerBlockType< Attributes >( blockMetadata, {
	icon: ICONS.starFilled,
	// The inserter's preview: the default preset, with sample content. WHY inner blocks: a
	// Highlight's content is its inner blocks, so the preview is empty without them.
	// UPSTREAM: @wordpress/blocks types `example` loosely, so it needs the cast.
	example: {
		attributes: DEFAULT_PRESET.props,
		innerBlocks: toExampleBlocks(
			toBlocks( resolveParts( PARTS, DEFAULT_PRESET.parts ), {
				sample: true,
			} )
		),
	} as unknown as BlockConfiguration< Attributes >[ 'example' ],
	// WHY a default: inserting "Highlight" gives the statement, the common one.
	variations: PRESETS.map( ( preset ) => ( {
		name: preset.name,
		title: preset.title,
		description: preset.description,
		icon: ICONS[ preset.wpIcon ],
		attributes: preset.props,
		innerBlocks: toBlocks( resolveParts( PARTS, preset.parts ) ),
		isDefault: preset === DEFAULT_PRESET,
		scope: [ 'inserter' ],
	} ) ) as unknown as BlockVariation< Attributes >[],
	edit: Edit,
	save,
} );
