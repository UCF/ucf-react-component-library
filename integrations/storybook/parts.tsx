/**
 * CONTEXT: parts drawn for the stories: the plain React renderer (integrations/react/parts.tsx)
 * with the primitives' styles loaded and the sample photo in every image part.
 *
 * WHY a wrapper: the stories load each component's own style.css so a CSS edit shows without a
 * rebuild, where a site loads ucf.css; and they show the placeholder photo.
 */
import '../../components/primitives/button/style.css';
import '../../components/primitives/heading/style.css';
import '../../components/primitives/image/style.css';
import '../../components/primitives/paragraph/style.css';
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
