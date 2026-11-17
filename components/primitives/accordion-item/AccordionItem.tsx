/**
 * The Accordion Item: a question in a heading, and its answer, inside an Accordion. Why it's
 * built this way: docs/architecture.md, "Built with frame()", and Accordion.tsx.
 *
 * SPEC: core Accordion Item's markup, with core Accordion Heading and Panel folded in (they only
 * appear inside one): a button in a heading, so the questions are in the page's outline.
 * WHY no `aria-expanded`, ids or `role="region"` here: the answer is open until behavior.ts
 * runs, which sets them. A11Y: an unnamed region is a landmark axe rejects in a list of them.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame';
import { PARTS } from './AccordionItem.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './AccordionItem.presets.ts';
import { PROPS } from './AccordionItem.props.ts';

/** Everything the Accordion Item takes: its props, its answer, and a site's HTML attributes. */
export type AccordionItemProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function AccordionItemMarkup( {
	title = PROPS.title.default,
	level = PROPS.level.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	const Heading = `h${ level }` as const;
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-accordion-item' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<Heading className="ucf-c-accordion-item__heading">
				<button type="button" className="ucf-c-accordion-item__toggle">
					<span className="ucf-c-accordion-item__title">
						{ title }
					</span>
					<span
						className="ucf-c-accordion-item__icon"
						aria-hidden="true"
					/>
				</button>
			</Heading>
			{ area(
				'content',
				{ className: 'ucf-c-accordion-item__panel' },
				children
			) }
		</div>
	);
}

/**
 * A question and its answer, inside an Accordion; anything goes in the answer:
 *
 *   <AccordionItem title="Do I have to send test scores?"><p>…</p></AccordionItem>
 *
 * Its props: AccordionItem.props.ts.
 */
const AccordionItem = frame( AccordionItemMarkup, {
	// Who it is
	slug: 'accordion-item',
	title: 'Accordion Item',
	kind: 'primitive',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only: none. It has no block; WordPress editors place core Accordion Item.
	wpIcon: 'heading',
} );

export default AccordionItem;
