/**
 * CONTEXT: the Heading, a primitive: a heading at any level, in the theme's heading styles
 * (docs/architecture.md, "Primitives").
 *
 * WHY its props are core Heading's: `content` and `level` are the attribute names of
 * WordPress's `core/heading`, so the two read alike.
 * WHY level is structure, not size: each level has its own size, as in the theme. A heading
 * that should look smaller than its place in the outline is a different component's job (the
 * Card's title is an h3 at the h4 size).
 *
 * Content rules apply: plain React, no runtime imports. In WordPress, editors use
 * `core/heading` instead, so it has no block of its own.
 *
 * SYNC: our blocks save this markup inside theirs. Once a site uses them, changing what this
 * returns needs a new version of it and a deprecation in every block that uses it.
 */
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = {
	/** The text. */
	content: ReactNode;
	/** Its place in the page's outline, 1 to 6. */
	level?: HeadingLevel;
} & Omit< ComponentPropsWithoutRef< 'h2' >, 'children' | 'content' >;

export default function Heading( {
	content,
	level = 2,
	className,
	...props
}: HeadingProps ) {
	const Tag = `h${ level }` as const;
	return (
		<Tag
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-heading' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ content }
		</Tag>
	);
}
