/**
 * The card designs' parts (variations.ts) as core blocks, for the block variations and the
 * default template.
 *
 * WHY placeholders, not content: a variation inserts real blocks; text that looks written
 * would be published by an editor who missed it. Placeholders show the intent and save nothing.
 * The link and the button are the exceptions: core has no placeholder for a link's address.
 */
import { PARTS } from '../../Card.tsx';
import type { Part } from '../../variations.ts';

// A block template: a block's name, its attributes, and the blocks inside it.
export type Template = [ string, Record< string, unknown >?, Template? ][];

export function toBlocks( parts: Part[] ): Template {
	return parts.map( ( part ): Template[ number ] => {
		switch ( part.kind ) {
			case 'image':
				return [
					'core/image',
					{ aspectRatio: part.aspectRatio, scale: 'cover' },
				];
			case 'heading':
				return [
					'core/heading',
					{
						level: part.level,
						placeholder: part.text,
						...( part.part && { className: PARTS[ part.part ] } ),
					},
				];
			case 'text':
				return [
					'core/paragraph',
					{
						placeholder: part.text,
						...( part.part && { className: PARTS[ part.part ] } ),
					},
				];
			case 'link':
				return [
					'core/paragraph',
					{
						className: PARTS.link,
						content: `<a href="${ part.url }">${ part.text }</a>`,
					},
				];
			// 'button'
			default:
				return [
					'core/buttons',
					{},
					[ [ 'core/button', { text: part.text, url: part.url } ] ],
				];
		}
	} );
}
