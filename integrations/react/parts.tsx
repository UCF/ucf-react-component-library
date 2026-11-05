/**
 * CONTEXT: how a component's presets render on a plain React site (Next, or any React app), with
 * no CMS. A preset's parts (integrations/schema/parts.ts) drawn with the library's primitives,
 * as Puck places them (integrations/puck/primitives.mapper.ts builds the same parts as Puck data)
 * and as the stories show them (integrations/storybook/parts.tsx).
 *
 *   import { Card, CARD_PARTS, CARD_PRESETS } from '@ucf/components/card';
 *   import { findPreset, presetContent } from '@ucf/components/react';
 *
 *   const pathway = findPreset( CARD_PRESETS, 'pathway' );
 *   <Card { ...pathway.props }>{ presetContent( CARD_PARTS, pathway ) }</Card>
 *
 * WHY no CSS imports here: a site loads `@ucf/components/ucf.css` once, which holds every
 * primitive's and component's styles; Next refuses global CSS imported from a package.
 * WHY a preset's text as it is: it is sample content, the same the stories and Puck start with.
 * A site with its own content writes the parts itself, with the classes in `{NAME}_PARTS`.
 */
import type { ReactElement } from 'react';

import Button from '../../components/primitives/button/Button.tsx';
import Heading from '../../components/primitives/heading/Heading.tsx';
import Image from '../../components/primitives/image/Image.tsx';
import Paragraph from '../../components/primitives/paragraph/Paragraph.tsx';
import {
	resolveParts,
	unhandledPart,
	type Looks,
	type PartOf,
	type ResolvedPart,
} from '../schema/parts.ts';

export { findPreset } from '../schema/presets.ts';

/** How to fill parts that carry no content of their own. */
export type PartOptions = {
	/** The image an image part shows: a preset names the shape, not a photo. */
	imageUrl?: string;
};

/**
 * Parts as primitives.
 *
 * @param parts            Parts, from resolveParts().
 * @param options          How to fill them.
 * @param options.imageUrl The image an image part shows.
 */
export function renderParts(
	parts: ResolvedPart[],
	{ imageUrl = '' }: PartOptions = {}
): ReactElement[] {
	return parts.map( ( part, index ) => {
		// The part's class, when its look has one.
		const className = part.className || undefined;
		switch ( part.kind ) {
			case 'image':
				return (
					<Image
						key={ index }
						url={ part.url ?? imageUrl }
						alt={ part.alt ?? '' }
						aspectRatio={ part.aspectRatio }
						className={ className }
					/>
				);
			case 'heading':
				return (
					<Heading
						key={ index }
						content={ part.text }
						level={ part.level }
						className={ className }
					/>
				);
			case 'text':
				return (
					<Paragraph
						key={ index }
						content={ part.text }
						className={ className }
					/>
				);
			case 'link':
				return (
					<Button
						key={ index }
						text={ part.text }
						url={ part.url }
						variant="text"
						className={ className }
					/>
				);
			case 'button':
				return (
					<Button
						key={ index }
						text={ part.text }
						url={ part.url }
						className={ className }
					/>
				);
			default:
				return unhandledPart( part );
		}
	} );
}

/**
 * A preset's parts, ready to place inside its component.
 *
 * @param looks        The component's PARTS (`CARD_PARTS`).
 * @param preset       One of its presets (`CARD_PRESETS`), or anything with parts.
 * @param preset.parts Its parts, in order.
 * @param options      How to fill them.
 */
export function presetContent< L extends Looks >(
	looks: L,
	preset: { parts: PartOf< L >[] },
	options?: PartOptions
): ReactElement[] {
	return renderParts( resolveParts( looks, preset.parts ), options );
}
