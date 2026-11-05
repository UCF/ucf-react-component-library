/**
 * CONTEXT: the Highlight, a content component and a frame: the accent rule and spacing of a
 * statement, with its text placed inside. Every host renders this one file.
 *
 * WordPress's block `save()` renders it to produce the HTML stored in a post, its `edit()`
 * renders it with the editable inner blocks inside, and Next, Puck or any other React host
 * renders it as a page component. So it has to be plain React:
 *
 *   - no runtime imports but its own files: not `react`, not `@wordpress/*`, not `next/*`. JSX
 *     compiles to `react/jsx-runtime`, which each host supplies. (`import type` is erased at
 *     build.)
 *   - no state, effects, handlers, `'use client'` or data fetching. `save()` renders this
 *     synchronously, once, to a string.
 *   - anything host-specific comes in through a slot. `innerAs` is the example: WordPress
 *     passes its inner-blocks element, Puck its slot; plain React leaves the default `<div>`.
 *     The library holds no host code.
 *
 * WHY a frame: what goes inside is open. A new Highlight starts with one of the UCF designs
 * (PRESETS in Highlight.presets.ts: statement, key figure, bracket, side rule, centered), each
 * part carrying the class that styles it, and editors can change any of it. The cost: nothing
 * makes a Highlight have a statement or a source, and nothing else can read them as fields.
 * WHY "Highlight", not "Stat": not every one is a number (a partnership, a ranking with a
 * logo), and all of them are something pulled out of the page to stand on its own.
 * SPEC: the default is the statement, a fact written as a full sentence. The key figure (a
 * large number or date over a label) is for values that are not claims: a deadline, a code.
 *
 * SYNC: WordPress stores what this returns in every post that uses the block. Changing the
 * markup makes those blocks invalid: it needs a major version and a `deprecated` entry in
 * integrations/wp/index.tsx that carries a frozen copy of the old markup.
 * tests/Highlight.test.tsx fails on any markup change so this cannot happen by accident.
 *
 * WHY `ucf-c-` and not `ucf-`: the block theme already styles `.ucf-stat` for its pattern,
 * and its `> p:not(...)` selectors outrank a single class. A separate prefix keeps this
 * component's CSS the only CSS that applies to it, on any theme.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { PROPS, type HighlightEditableProps } from './Highlight.props.ts';

/**
 * The props from the prop definitions (Highlight.props.ts, where each is described), and what a
 * host passes besides. The classes for the parts placed inside are in Highlight.parts.ts.
 */
export type HighlightProps = Partial< HighlightEditableProps > & {
	/** The statement, its detail and its source, or whatever an editor placed instead. */
	children?: ReactNode;
	/**
	 * The element that holds the content. WordPress passes its inner-blocks element and Puck its
	 * slot, so each host's editing area is this element, with no wrapper of its own.
	 */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function Highlight( {
	rule = PROPS.rule.default,
	contentAlign = PROPS.contentAlign.default,
	children,
	innerAs: Inner = 'div',
	className,
	...wrapperProps
}: HighlightProps ) {
	return (
		<div
			{ ...wrapperProps }
			className={ [ className, 'ucf-c', 'ucf-c-highlight' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-rule={ rule }
			data-align={ contentAlign === 'start' ? undefined : contentAlign }
		>
			<Inner className="ucf-c-highlight__content">{ children }</Inner>
		</div>
	);
}
