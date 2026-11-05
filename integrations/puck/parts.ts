/**
 * Puck: parts as primitives, for Puck's templates.
 *
 * SYNC: wp/parts.ts builds the same parts as core blocks; each `type` is the key the README tells
 * hosts to register the primitive under.
 */

import imageExample from '../../components/primitives/image/example.json' with { type: 'json' };
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
						url: part.url ?? imageExample.url,
						alt: part.alt ?? '',
						aspectRatio: part.aspectRatio ?? '',
						className: part.className,
					},
				};
			case 'heading':
				return {
					type: 'Heading',
					props: {
						content: part.text,
						level: String( part.level ),
						className: part.className,
					},
				};
			case 'text':
				return {
					type: 'Paragraph',
					props: { content: part.text, className: part.className },
				};
			// Both the Button primitive: a link is its text variant.
			case 'link':
			case 'button':
				return {
					type: 'Button',
					props: {
						text: part.text,
						url: part.url,
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
