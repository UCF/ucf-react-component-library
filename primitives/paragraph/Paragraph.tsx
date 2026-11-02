/**
 * CONTEXT: the Paragraph, a primitive: one paragraph of body copy, in the theme's body style
 * (docs/architecture.md, "Primitives").
 *
 * WHY `content`: the attribute name of WordPress's `core/paragraph`, so the two read alike.
 *
 * Content rules apply: plain React, no runtime imports. In WordPress, editors use
 * `core/paragraph` instead, so it has no block of its own.
 *
 * SYNC: our blocks save this markup inside theirs. Once a site uses them, changing what this
 * returns needs a new version of it and a deprecation in every block that uses it.
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type ParagraphProps = {
	/** The text. */
	content: ReactNode;
} & Omit< ComponentPropsWithoutRef< 'p' >, 'children' | 'content' >;

export default function Paragraph( {
	content,
	className,
	...props
}: ParagraphProps ) {
	return (
		<p
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-paragraph' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ content }
		</p>
	);
}
