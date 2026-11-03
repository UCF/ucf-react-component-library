/**
 * The highlight designs' parts (variations.ts) as core blocks, for the block variations and
 * the default template. As the Card's (components/card/adapters/wp/blocks.ts).
 *
 * WHY placeholders, not content: a variation inserts real blocks; text that looks written
 * would be published by an editor who missed it. Placeholders show the intent and save nothing.
 */
import { PARTS } from '../../Highlight.tsx';
import type { Part } from '../../variations.ts';

// A block template: a block's name and its attributes.
export type Template = [ string, Record< string, unknown > ][];

export function toBlocks( parts: Part[] ): Template {
	return parts.map( ( part ): Template[ number ] =>
		part.kind === 'logo'
			? [ 'core/image', { className: PARTS.logo, alt: part.alt } ]
			: [
					'core/paragraph',
					{ className: PARTS[ part.part ], placeholder: part.text },
				]
	);
}
