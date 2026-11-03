/**
 * Editor entry: registers the Highlight block, and each UCF highlight design as a variation
 * of it (variations.ts), as the Card does.
 */
import {
	registerBlockType,
	type BlockConfiguration,
	type BlockVariation,
} from '@wordpress/blocks';

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

registerBlockType< Attributes >( blockMetadata, {
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
		attributes: variation.settings,
		innerBlocks: toBlocks( variation.content ),
		isDefault: index === 0,
		scope: [ 'inserter' ],
	} ) ) as unknown as BlockVariation< Attributes >[],
	edit: Edit,
	save,
} );
