/**
 * WordPress: parts as core blocks.
 *
 * For variations, the block template and the inserter preview.
 * SYNC: puck/parts.ts builds the same parts as primitives.
 * WHY placeholders, not text: a variation inserts real blocks, and text that looks written would
 * get published by an editor who missed it. The preview (`sample`) is never saved, so it has text.
 */

import imageExample from '../../components/primitives/image/example.json';
import { unhandledPart, type ResolvedPart } from '../schema/parts.ts';

// ── Parts → blocks ─────────────────────────────────────────────────────────────────────────────

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
 * @param options.sample Real text and a sample image instead of placeholders, for a preview that is
 *                       never saved.
 */
export function toBlocks(
	parts: ResolvedPart[],
	{ sample = false }: { sample?: boolean } = {}
): BlockTemplate {
	// Placeholder text, or the text itself in a sample.
	const text = ( value: string ) =>
		sample ? { content: value } : { placeholder: value };
	// The part's class, when its look has one.
	const classOf = ( className: string ) => ( className ? { className } : {} );

	const blocks = parts.map( ( part ): BlockTemplate[ number ] => {
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
						...classOf( part.className ),
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
						...classOf( part.className ),
					},
				];
			case 'text':
				return [
					'core/paragraph',
					{ ...text( part.text ), ...classOf( part.className ) },
				];
			case 'link':
				return [
					'core/paragraph',
					{
						...classOf( part.className ),
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
								...classOf(
									[
										part.className,
										part.outline && 'is-style-outline',
									]
										.filter( Boolean )
										.join( ' ' )
								),
							},
						],
					],
				];
			default:
				return unhandledPart( part );
		}
	} );
	// WHY: buttons side by side share one core Buttons group, so they sit in a row.
	return blocks.reduce< BlockTemplate >( ( merged, block ) => {
		const last = merged.at( -1 );
		if ( block[ 0 ] === 'core/buttons' && last?.[ 0 ] === 'core/buttons' ) {
			last[ 2 ] = [ ...( last[ 2 ] ?? [] ), ...( block[ 2 ] ?? [] ) ];
			return merged;
		}
		return [ ...merged, block ];
	}, [] );
}

// ── The inserter preview ───────────────────────────────────────────────────────────────────────

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
