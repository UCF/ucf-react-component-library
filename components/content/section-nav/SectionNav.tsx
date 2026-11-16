/**
 * The Section Nav: a bar of links to the sections of a page, which stays at the top of the
 * window while the page scrolls past it.
 *
 * WHY content, not interactive: the links are in the saved HTML and work without JavaScript.
 * Sticking, smooth scrolling and stopping short of the bar are CSS (style.css).
 * WHY a prop, not an area: the links are data a block can fill from the page (WordPress's
 * edit.tsx reads the Sections' anchors), and their markup stays ours rather than core's List.
 * A11Y: a `<nav>` with its own name, so it is a landmark apart from the site's navigation.
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame';
import { PARTS } from './SectionNav.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './SectionNav.presets.ts';
import { PROPS } from './SectionNav.props.ts';

/** Everything the Section Nav takes: its links, and a site's HTML attributes. */
export type SectionNavProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function SectionNavMarkup( {
	links = [ ...PROPS.links.default ],
	// WHY taken out: it holds no content, so neither reaches the `<nav>`.
	children: _children,
	area: _area,
	className,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<nav
			aria-label="On this page"
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-section-nav' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<ul className="ucf-c-section-nav__list">
				{ links.map( ( link, index ) => (
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
 * A bar of links to the page's sections, which sticks to the top of the window:
 *
 *   <SectionNav links={ [ { label: 'Apply', href: '#apply' } ] } />
 *
 * Place it between Sections, not inside one: it sticks only while its parent is on screen.
 * Its props: SectionNav.props.ts.
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
