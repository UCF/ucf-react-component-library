/**
 * CONTEXT: the Section, a full-width band of the page with its own padding and composition.
 * The layout every other component sits in: the composition it sets is what their colors
 * follow.
 *
 * Content component rules apply (docs/architecture.md, "Two kinds of component"): plain
 * React, no runtime imports, nothing host-specific except through a slot.
 *
 * In WordPress it is the `ucf-content/section` block, with the blocks placed inside it as inner
 * blocks; in Puck, a slot. Both pass their container in as `innerAs`, so the markup is the same
 * in every host.
 *
 * WHY its own block rather than the block theme's Section (a core/group variation): the
 * library owns the section so it works on any theme, with the same markup and settings in
 * WordPress, Puck and Next. Its composition classes ship with the plugin (base.css), not
 * the theme. The spacing tokens (`--ucf-custom-section-y`, `--ucf-custom-gutter`,
 * `--ucf-custom-measure`) are the ones the theme's band reads, so the two look the same while
 * both exist.
 * WHY `ucf-section` and not `ucf-c-section`: a Section sets roles rather than reading them, so
 * it takes no part in the component layer (`ucf-c`), whose class prefix that is.
 * SYNC: WordPress stores this markup in every post with a Section. Changing it needs a major
 * version and a deprecation, as for any content block.
 */
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import type { Composition } from './compositions.ts';

export type SectionProps = {
	/** The composition: what the band's background is, and so every color inside it. */
	composition?: Composition;
	/**
	 * How wide the content runs: `default`, the theme's wide layout (1240px, as most bands are);
	 * `constrained` to the reading width for a band of text (720px); or `wide`, edge to edge.
	 */
	width?: 'default' | 'constrained' | 'wide';
	/**
	 * Space above and below, from the most to the least: `default`, then `cozy` and `compact`
	 * for a band that continues the one above rather than starting a new subject.
	 */
	spacing?: 'default' | 'cozy' | 'compact';
	/** What goes in the band. */
	children?: ReactNode;
	/**
	 * The element that holds the content. Puck passes its slot component here, so its drop
	 * zone is the inner element itself rather than a wrapper inside it.
	 */
	innerAs?: ElementType;
} & Omit< ComponentPropsWithoutRef< 'section' >, 'children' >;

export default function Section( {
	composition = 'light',
	width = 'default',
	spacing = 'default',
	children,
	innerAs: Inner = 'div',
	className,
	...sectionProps
}: SectionProps ) {
	return (
		<section
			{ ...sectionProps }
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
			<Inner
				className={ `ucf-section__inner ucf-section__inner--${ width }` }
			>
				{ children }
			</Inner>
		</section>
	);
}
