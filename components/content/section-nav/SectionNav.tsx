/**
 * CONTEXT: the Section Nav: a sticky bar of links to the page's sections.
 *
 * WHY content, not interactive: the links are saved HTML and work without JavaScript.
 * WHY links as a prop, not an area: editors fill them from the page's Sections.
 * A11Y: a named `<nav>`, a landmark apart from the site's navigation.
 * SYNC: WordPress saves this markup in every post that uses it.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame';
import { PARTS } from './SectionNav.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './SectionNav.presets.ts';
import { isAnchor } from '@/integrations/schema/props';
import { PROPS } from './SectionNav.props.ts';

/** The Section Nav's props, plus HTML attributes. */
export type SectionNavProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function SectionNavMarkup( {
	links = [ ...PROPS.links.default ],
	linkLayout = PROPS.linkLayout.default,
	// WHY dropped: it has no children or areas.
	children: _children,
	area: _area,
	className,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<nav
			aria-label="On this page"
			{ ...props }
			className={ [
				className,
				'ucf-c',
				'ucf-c-section-nav',
				// WHY no class for Left: it's the default.
				linkLayout === 'left'
					? null
					: `ucf-c-section-nav--${ linkLayout }`,
			]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<ul className="ucf-c-section-nav__list">
				{ /* WHY anchors only: it jumps within the page; a URL or `javascript:` is left out. */ }
				{ links
					.filter( ( link ) => isAnchor( link.href ) )
					.map( ( link, index ) => (
						// WHY the index as key: two links may share an address.
						<li key={ index } className="ucf-c-section-nav__item">
							<a
								className="ucf-c-section-nav__link"
								href={ link.href }
							>
								{ link.label }
							</a>
						</li>
					) ) }
			</ul>
		</nav>
	);
}

/**
 * A sticky bar of links to the page's sections:
 *
 *   <SectionNav links={ [ { label: 'Apply', href: '#apply' } ] } />
 *   <SectionNav linkLayout="spread" links={ … } />
 *
 * Place it between Sections, not inside one: it only sticks within its parent.
 */
const SectionNav = frame( SectionNavMarkup, {
	// Who it is
	slug: 'section-nav',
	title: 'Section Nav', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'tableOfContents',
} );

export default SectionNav;
