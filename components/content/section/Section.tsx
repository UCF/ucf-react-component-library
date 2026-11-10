/**
 * The Section: a full-width band of the page with its own padding and composition. The layout
 * every other component sits in: the composition it sets is what their colors follow.
 *
 * WHY its own block rather than the block theme's Section (a core/group variation): the library
 * owns the section so it works on any theme, with the same markup and settings in WordPress, Puck
 * and Next. The spacing tokens (`--ucf-custom-section-y`, `--ucf-custom-gutter`,
 * `--ucf-custom-measure`) are the ones the theme's band reads, so the two look the same while
 * both exist.
 * WHY `ucf-section` and not `ucf-c-section`: a Section sets roles rather than reading them, so it
 * takes no part in the component layer (`ucf-c`), whose class prefix that is.
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame.js';
import { PARTS } from './Section.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Section.presets.ts';
import { PROPS } from './Section.props.ts';

/** Everything the Section takes: its props, its children, and a site's HTML attributes. */
export type SectionProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function SectionMarkup( {
	composition = PROPS.composition.default,
	width = PROPS.width.default,
	spacing = PROPS.spacing.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<section
			{ ...props }
			className={ [
				className,
				'ucf-section',
				`ucf-composition-${ composition }`,
				// WHY no class for `default`: the base `.ucf-section` rule is the default.
				spacing === 'default' ? null : `ucf-section--${ spacing }`,
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ area(
				'content',
				{
					className: `ucf-section__inner ucf-section__inner--${ width }`,
				},
				children
			) }
		</section>
	);
}

/**
 * A full-width band with its own background; everything inside takes on its colors:
 *
 *   <Section composition="dark" width="constrained">…</Section>
 *
 * Its props: Section.props.ts.
 */
const Section = frame( SectionMarkup, {
	// Who it is
	slug: 'section',
	title: 'Section', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'stretchFullWidth',
} );

export default Section;
