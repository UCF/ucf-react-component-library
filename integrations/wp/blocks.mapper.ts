/**
 * CONTEXT: parts (integrations/schema/parts.ts) as core blocks, for every component's block
 * variations, block template and inserter preview. SYNC: integrations/puck/primitives.mapper.ts
 * builds the same parts as primitives.
 *
 * WHY placeholders, not content: a variation inserts real blocks; text that looks written
 * would be published by an editor who missed it. Placeholders show the intent and save nothing.
 * The link and the button are the exceptions: core has no placeholder for a link's address.
 * The inserter's preview is the other exception (`sample`): it is never saved, and an empty
 * placeholder previews as nothing.
 */
import imageExample from '../../components/primitives/image/example.json';
import { unhandledPart, type ResolvedPart } from '../schema/parts.ts';

// WordPress's block template: a block's name, its attributes, and the blocks inside it.
export type BlockTemplate = [
	string,
	Record< string, unknown >?,
	BlockTemplate?,
][];

/**
 * Parts as core blocks.
 *
 * @param parts          Parts, from resolveParts().
 * @param options        How to fill them.
 * @param options.sample Real text and a sample image instead of placeholders, for a preview
 *                       that is never saved.
 */
export function toBlocks(
	parts: ResolvedPart[],
	{ sample = false }: { sample?: boolean } = {}
): BlockTemplate {
	// Placeholder text, or the text itself in a sample.
	const text = ( value: string ) =>
		sample ? { content: value } : { placeholder: value };
	// The part's class, when its look has one.
	const look = ( className: string ) => ( className ? { className } : {} );

	return parts.map( ( part ): BlockTemplate[ number ] => {
		switch ( part.kind ) {
			case 'image':
				return [
					'core/image',
					{
						// A fixed shape crops to fill it; with none, the image keeps its own.
						...( part.aspectRatio && {
							aspectRatio: part.aspectRatio,
							scale: 'cover',
						} ),
						...look( part.className ),
						...( part.alt !== undefined && { alt: part.alt } ),
						...( part.url !== undefined && { url: part.url } ),
						...( sample && {
							url: part.url ?? imageExample.url,
							alt: part.alt ?? '',
						} ),
					},
				];
			case 'heading':
				return [
					'core/heading',
					{
						level: part.level,
						...text( part.text ),
						...look( part.className ),
					},
				];
			case 'text':
				return [
					'core/paragraph',
					{ ...text( part.text ), ...look( part.className ) },
				];
			case 'link':
				return [
					'core/paragraph',
					{
						...look( part.className ),
						content: `<a href="${ part.url }">${ part.text }</a>`,
					},
				];
			case 'button':
				return [
					'core/buttons',
					{},
					[
						[
							'core/button',
							{
								text: part.text,
								url: part.url,
								...look( part.className ),
							},
						],
					],
				];
			default:
				return unhandledPart( part );
		}
	} );
}

/** A block as `registerBlockType()`'s `example` takes it. */
type ExampleBlock = {
	name: string;
	attributes: Record< string, unknown >;
	innerBlocks: ExampleBlock[];
};

/**
 * A block template as the inserter preview's inner blocks: the same blocks, as objects.
 *
 * @param template A block template, from toBlocks().
 */
export function toExampleBlocks( template: BlockTemplate ): ExampleBlock[] {
	return template.map( ( [ name, attributes = {}, inner = [] ] ) => ( {
		name,
		attributes,
		innerBlocks: toExampleBlocks( inner ),
	} ) );
}
