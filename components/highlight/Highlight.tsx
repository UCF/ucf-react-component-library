/**
 * CONTEXT: the Highlight, a content component and a frame: the accent rule and spacing of a
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
 * WHY a frame: what goes inside is open. A new Highlight starts with one of the UCF designs
 * (VARIATIONS in variations.ts: statement, key figure, bracket, side rule, centered), each part
 * carrying the class that styles it, and editors can change any of it. The cost: nothing
 * makes a Highlight have a statement or a source, and nothing else can read them as fields.
 * WHY "Highlight", not "Stat": not every one is a number (a partnership, a ranking with a
 * logo), and all of them are something pulled out of the page to stand on its own.
 * SPEC: the default is the statement, a fact written as a full sentence. The key figure (a
 * large number or date over a label) is for values that are not claims: a deadline, a code.
 *
 * SYNC: WordPress stores what this returns in every post that uses the block. Changing the
 * markup makes those blocks invalid: it needs a major version and a `deprecated` entry in
 * adapters/wp/index.tsx that carries a frozen copy of the old markup. tests/Highlight.test.tsx fails on
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
	/** A fact as a full sentence, in display capitals. */
	statement: 'ucf-c-highlight__statement',
	/** A short value set very large: "Nov 1", "003954", "No. 1". */
	figure: 'ucf-c-highlight__figure',
	/** What the figure is, in sans bold: "Early action deadline". */
	label: 'ucf-c-highlight__label',
	/** One sentence saying why it matters. */
	detail: 'ucf-c-highlight__detail',
	/** Where it comes from, in the data voice: "Source: UCF Facts, fall 2025". */
	source: 'ucf-c-highlight__source',
	/** Where it comes from, as a short italic credit: "(Aviation Week)". */
	citation: 'ucf-c-highlight__citation',
	/** A logo or badge in place of a figure: NASA's, a ranking's. Its image keeps its shape. */
	logo: 'ucf-c-highlight__logo',
} as const;

export type HighlightProps = {
	/**
	 * The accent rule: across the top (`top`), down the left (`side`), both, as a bracket
	 * (`corner`), a short bar under the first part, centered (`divider`), or none.
	 */
	rule?: 'top' | 'side' | 'corner' | 'divider' | 'none';
	/** The content's alignment, across. */
	contentAlign?: 'start' | 'center';
	/** The statement, its detail and its source, or whatever an editor placed instead. */
	children?: ReactNode;
	/**
	 * The element that holds the content. WordPress passes its inner-blocks element and Puck its
	 * slot, so each host's editing area is this element, with no wrapper of its own.
	 */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function Highlight( {
	rule = 'top',
	contentAlign = 'start',
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
