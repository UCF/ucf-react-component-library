/**
 * CONTEXT: the Stat, a content component. Every host renders this one file.
 *
 * WordPress's block `save()` renders it to produce the HTML stored in a post, its `edit()`
 * renders it with text fields in the slots, and Next, Puck or any other React host renders it
 * as a page component. So it has to be plain React:
 *
 *   - no runtime imports: not `react`, not `@wordpress/*`, not `next/*`. JSX compiles to
 *     `react/jsx-runtime`, which each host supplies. (`import type` is erased at build.)
 *   - no state, effects, handlers, `'use client'` or data fetching. `save()` renders this
 *     synchronously, once, to a string.
 *   - anything host-specific comes in through a slot. `linkAs` is the example: Next passes
 *     `next/link`, WordPress leaves the default `<a>`. The library holds no Next code.
 *
 * SYNC: WordPress stores what this returns in every post that uses the block. Changing the
 * markup makes those blocks invalid: it needs a major version and a `deprecated` entry in
 * adapters/wp/index.tsx that carries a frozen copy of the old markup. Stat.test.tsx fails on any
 * markup change so this cannot happen by accident.
 *
 * WHY `ucf-c-` and not `ucf-`: the block theme already styles `.ucf-stat` for its pattern,
 * and its `> p:not(...)` selectors outrank a single class. A separate prefix keeps this
 * component's CSS the only CSS that applies to it, on any theme.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

export type StatProps = {
	/** The fact, written as a complete statement. */
	statement: ReactNode;
	/** One sentence saying why it matters. */
	detail?: ReactNode;
	/** Who published the number. */
	source?: ReactNode;
	/** Where they published it. No URL, no link. */
	sourceUrl?: string;
	/** When the number was true: "fall 2025". */
	asOf?: ReactNode;
	/** The element the source link renders as. */
	linkAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'div' >, 'children' >;

export default function Stat( {
	statement,
	detail,
	source,
	sourceUrl,
	asOf,
	linkAs: Link = 'a',
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
			<p className="ucf-c-stat__statement">{ statement }</p>
			{ detail ? <p className="ucf-c-stat__detail">{ detail }</p> : null }
			{ source ? (
				<p className="ucf-c-stat__source">
					Source:{ ' ' }
					{ sourceUrl ? (
						<Link href={ sourceUrl }>{ source }</Link>
					) : (
						source
					) }
					{ asOf ? <>, { asOf }</> : null }
				</p>
			) : null }
		</div>
	);
}
