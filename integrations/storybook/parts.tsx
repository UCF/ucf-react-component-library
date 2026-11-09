/**
 * Storybook: parts drawn for the stories, with the primitives' styles and the sample photo.
 */

import '#primitives/button/style.css';
import '#primitives/heading/style.css';
import '#primitives/image/style.css';
import '#primitives/paragraph/style.css';
import { PLACEHOLDER_IMAGE } from '../../.storybook/placeholder.ts';
import { renderParts as renderPartsWith } from '../react/parts.tsx';
import type { ResolvedPart } from '../schema/parts.ts';

/**
 * Parts as primitives, with the sample photo.
 *
 * @param parts Parts, from resolveParts().
 */
export const renderParts = ( parts: ResolvedPart[] ) =>
	renderPartsWith( parts, { imageUrl: PLACEHOLDER_IMAGE } );
