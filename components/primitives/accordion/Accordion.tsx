/**
 * The Accordion: Accordion Items, one under another, each a question that opens to show its
 * answer. Why it's built this way: docs/architecture.md, "Built with frame()".
 *
 * WHY an Accordion and an Accordion Item, as core has: WordPress editors place core Accordion,
 * which the theme styles with this CSS (scripts/core-css.mjs), so the two match.
 * WHY every answer is in the markup: search engines and visitors without JavaScript read it.
 * behavior.ts closes the items.
 */
import { frame } from '@/core/frame/frame';
import type { FrameProps, OwnProps, PresetProps } from '@/core/frame/types';
import { PARTS } from './frame/parts.ts';
import { DEFAULT_PRESET, PRESETS } from './frame/presets.ts';
import { PROPS } from './props.ts';

/** Everything the Accordion takes: its Accordion Item children, and a site's HTML attributes. */
export type AccordionProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function AccordionMarkup( {
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		// SPEC: core Accordion's `role="group"`.
		<div
			{ ...props }
			role="group"
			className={ [ className, 'ucf-c', 'ucf-c-accordion' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ area(
				'content',
				{ className: 'ucf-c-accordion__items' },
				children
			) }
		</div>
	);
}

/**
 * Questions that open to show their answers; each child is an Accordion Item:
 *
 *   <Accordion>
 *     <AccordionItem title="…"><p>…</p></AccordionItem>
 *   </Accordion>
 *
 * Run enhanceAccordion() (behavior.ts) on it from an effect to close the answers.
 */
const Accordion = frame( AccordionMarkup, {
	// Who it is
	slug: 'accordion',
	title: 'Accordion',
	kind: 'primitive',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only: none. It has no block; WordPress editors place core Accordion.
	wpIcon: 'list-view',
} );

export default Accordion;
