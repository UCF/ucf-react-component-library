/**
 * CONTEXT: the Button, a primitive: the one button every component uses
 * (docs/architecture.md, "Primitives").
 *
 * WHY its props are core Button's: `text`, `url`, `linkTarget` and `fontSize` are the
 * attribute names of WordPress's `core/button`, and `variant` is the styles the UCF theme
 * gives it: core's Fill and Outline, and the theme's Text. An editor who knows core's Button
 * knows this one, and content can move between the two.
 *
 * SYNC: it looks like the theme's core Button (style.css names the theme's files).
 *
 * It is a link styled as a button, as core's is. With no `url` it renders a link without an
 * address, as core's does, which our blocks' editors use while the link is still being chosen.
 *
 * Content rules apply: plain React, no runtime imports. Puck editors place it on its own; our
 * blocks render it inside their own markup; WordPress editors use `core/button` instead, so it
 * has no block of its own.
 *
 * SYNC: our blocks save this markup inside theirs. Once a site uses them, changing what this
 * returns needs a new version of it and a deprecation in every block that uses it.
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ButtonProps = {
	/** The label. */
	text: ReactNode;
	/** Where it goes. */
	url?: string;
	/** `_blank` to open in a new tab, as core stores it; anything else opens in the same tab. */
	linkTarget?: string;
	/**
	 * Fill for the main action, Outline for the second, Text for a link-weight action that
	 * must not compete. The first two are core's styles; Text is the UCF theme's.
	 */
	variant?: 'fill' | 'outline' | 'text';
	/**
	 * `small` (44px) or `body` (60px), or none for the standard 52px. Named, and valued, as
	 * core's font-size attribute, which is how the theme sizes its buttons.
	 */
	fontSize?: '' | 'small' | 'body';
} & Omit< ComponentPropsWithoutRef< 'a' >, 'children' | 'href' | 'target' >;

export default function Button( {
	text,
	url,
	linkTarget,
	variant = 'fill',
	fontSize,
	className,
	...props
}: ButtonProps ) {
	const newTab = linkTarget === '_blank';

	return (
		<a
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-button' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-variant={ variant }
			data-size={ fontSize || undefined }
			href={ url || undefined }
			target={ newTab ? '_blank' : undefined }
			// WHY: the page that opens a new tab can't reach back into this one.
			rel={ newTab ? 'noopener noreferrer' : undefined }
		>
			{ text }
		</a>
	);
}
