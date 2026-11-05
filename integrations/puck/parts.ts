/**
 * Puck: parts as primitives, for Puck's templates.
 *
 * SYNC: wp/parts.ts builds the same parts as core blocks; each `type` is the key the README tells
 * hosts to register the primitive under.
 * WHY each part's name, not its preset's sample copy: Puck has no placeholders, so whatever a
 * template holds is published if an editor misses it. A label ("Title") is plainly unfinished;
 * sample copy reads as written, and its facts ("70,674 students") go stale. No sample image and
 * no `#` address, for the same reason.
 */

import { unhandledPart, type ResolvedPart } from '../schema/parts.ts';
import type { PuckSlot } from './types.ts';

/**
 * The Button primitive's variant for a link or button part.
 *
 * @param part A link or button part.
 */
const variantOf = ( part: ResolvedPart ) => {
	if ( part.kind === 'link' ) {
		return 'text';
	}
	return part.kind === 'button' && part.outline ? 'outline' : 'fill';
};

/**
 * `secondaryButton` → `Secondary button`: a part's name as the text a template starts with.
 *
 * @param part A part.
 */
const labelOf = ( part: ResolvedPart ) => {
	const words = part.part.replace( /([A-Z])/g, ' $1' ).toLowerCase();
	return words.charAt( 0 ).toUpperCase() + words.slice( 1 );
};

/**
 * Parts as the library's primitives.
 *
 * @param parts Parts, from resolveParts().
 */
export function toPrimitives( parts: ResolvedPart[] ): PuckSlot {
	return parts.map( ( part ) => {
		switch ( part.kind ) {
			case 'image':
				return {
					type: 'Image',
					props: {
						url: '',
						alt: '',
						aspectRatio: part.aspectRatio ?? '',
						className: part.className,
					},
				};
			case 'heading':
				return {
					type: 'Heading',
					props: {
						content: labelOf( part ),
						level: String( part.level ),
						className: part.className,
					},
				};
			case 'text':
				return {
					type: 'Paragraph',
					props: {
						content: labelOf( part ),
						className: part.className,
					},
				};
			// Both the Button primitive: a link is its text variant.
			case 'link':
			case 'button':
				return {
					type: 'Button',
					props: {
						text: labelOf( part ),
						url: '',
						linkTarget: '',
						variant: variantOf( part ),
						fontSize: '',
						className: part.className,
					},
				};
			default:
				return unhandledPart( part );
		}
	} );
}
