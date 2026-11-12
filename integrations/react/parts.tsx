/**
 * React: parts as React elements.
 *
 * For a site that places them itself: `<Card { ...pathway.props }>{ presetContent( CARD_PARTS,
 * pathway ) }</Card>`.
 * WHY no CSS imports: a site loads ucf.css once; Next refuses CSS imported from a package.
 */

import type { ReactElement } from 'react';

import Button from '@/components/primitives/button/Button';
import Heading from '@/components/primitives/heading/Heading';
import Image from '@/components/primitives/image/Image';
import Paragraph from '@/components/primitives/paragraph/Paragraph';
import {
	resolveParts,
	unhandledPart,
	type PartDefinitions,
	type PartOf,
	type ResolvedPart,
} from '../schema/parts.ts';

export { findPreset } from '../schema/presets.ts';

// ── Rendering parts ────────────────────────────────────────────────────────────────────────────

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

// ── A preset's parts ───────────────────────────────────────────────────────────────────────────

/**
 * A preset's parts, ready to place inside its component.
 *
 * @param partDefinitions The component's PARTS (`CARD_PARTS`).
 * @param preset          One of its presets (`CARD_PRESETS`), or anything with parts.
 * @param preset.parts    Its parts, in order.
 * @param options         How to fill them.
 */
export function presetContent< Parts extends PartDefinitions >(
	partDefinitions: Parts,
	preset: { parts: readonly PartOf< Parts >[] },
	options?: PartOptions
): ReactElement[] {
	return renderParts(
		resolveParts( partDefinitions, preset.parts ),
		options
	);
}
