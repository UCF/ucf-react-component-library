/**
 * CONTEXT: the Stat, a content component and a frame: the accent rule and spacing of a stat
 * statement, with its text placed inside. Every host renders this one file.
 *
 * WordPress's block `save()` renders it to produce the HTML stored in a post, its `edit()`
 * renders it with the editable inner blocks inside, and Next, Puck or any other React host
 * renders it as a page component. So it has to be plain React:
 *
 *   - no runtime imports: not `react`, not `@wordpress/*`, not `next/*`. JSX compiles to
 *     `react/jsx-runtime`, which each host supplies. (`import type` is erased at build.)
 *   - no state, effects, handlers, `'use client'` or data fetching. `save()` renders this
 *     synchronously, once, to a string.
 *   - anything host-specific comes in through a slot. `innerAs` is the example: WordPress
 *     passes its inner-blocks element, Puck its slot; plain React leaves the default `<div>`.
 *     The library holds no host code.
 *
 * WHY a frame: what goes inside is open. A new Stat starts with three paragraphs (statement,
 * detail, source: the templates in adapters/wp/edit.tsx and adapters/puck/config.tsx), each
 * carrying the class that styles it, and editors can change any of it. The cost: nothing
 * makes a Stat have a statement or a source, and nothing else can read them as fields.
 *
 * SYNC: WordPress stores what this returns in every post that uses the block. Changing the
 * markup makes those blocks invalid: it needs a major version and a `deprecated` entry in
 * adapters/wp/index.tsx that carries a frozen copy of the old markup. tests/Stat.test.tsx fails on
 * any markup change so this cannot happen by accident.
 *
 * WHY `ucf-c-` and not `ucf-`: the block theme already styles `.ucf-stat` for its pattern,
 * and its `> p:not(...)` selectors outrank a single class. A separate prefix keeps this
 * component's CSS the only CSS that applies to it, on any theme.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

/**
 * The classes that style the parts placed inside. The templates set them; an editor can too.
 * SYNC: style.css, and the templates in adapters/wp/edit.tsx and adapters/puck/config.tsx.
 */
export const PARTS = {
	statement: 'ucf-c-stat__statement',
	detail: 'ucf-c-stat__detail',
	source: 'ucf-c-stat__source',
} as const;

export type StatProps = {
	/** The statement, its detail and its source, or whatever an editor placed instead. */
	children?: ReactNode;
	/**
	 * The element that holds the content. WordPress passes its inner-blocks element and Puck its
	 * slot, so each host's editing area is this element, with no wrapper of its own.
	 */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function Stat( {
	children,
	innerAs: Inner = 'div',
	className,
	...wrapperProps
}: StatProps ) {
	return (
		<div
			{ ...wrapperProps }
			className={ [ className, 'ucf-c', 'ucf-c-stat' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<Inner className="ucf-c-stat__content">{ children }</Inner>
		</div>
	);
}
