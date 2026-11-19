/**
 * CONTEXT: the Quick Links: two to four task tiles, each a question that links where it's
 * answered, with a sentence on what's there.
 *
 * SPEC: the block theme's quick-links pattern (`.ucf-quick-links`), rebuilt as our markup.
 * WHY tiles as a prop, not an area: the design allows at most four, which props can enforce.
 * A11Y: a list, so its length is announced; each tile is one tab stop, its title's link.
 * SYNC: WordPress saves this markup in every post that uses it.
 */
import { frame } from '@/core/frame/frame';
import type { FrameProps, OwnProps, PresetProps } from '@/core/frame/types';
import { PARTS } from './frame/parts.ts';
import { DEFAULT_PRESET, PRESETS } from './frame/presets.ts';
import { PROPS } from './props.ts';

/** The Quick Links' props, plus HTML attributes. */
export type QuickLinksProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

/**
 * Whether an address is safe to link to.
 * WHY: a `javascript:` or `data:` address would run when clicked.
 *
 * @param href A tile's address.
 */
const isSafe = ( href: string ) =>
	! /^\s*(javascript|data|vbscript):/i.test( href );

function QuickLinksMarkup( {
	tiles = [ ...PROPS.tiles.default ],
	// WHY dropped: it has no children or areas.
	children: _children,
	area: _area,
	className,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-quick-links' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<ul className="ucf-c-quick-links__list">
				{ tiles
					.filter( ( tile ) => tile.label )
					.slice( 0, PROPS.tiles.max )
					.map( ( tile, index ) => (
						// WHY the index as key: two tiles may share an address.
						<li key={ index } className="ucf-c-quick-links__item">
							<a
								className="ucf-c-quick-links__link"
								href={
									tile.href && isSafe( tile.href )
										? tile.href
										: undefined
								}
							>
								{ tile.label }
							</a>
							{ tile.description ? (
								<p className="ucf-c-quick-links__description">
									{ tile.description }
								</p>
							) : null }
						</li>
					) ) }
			</ul>
		</div>
	);
}

/**
 * Two to four task tiles:
 *
 *   <QuickLinks tiles={ [
 *     { label: 'Can I get in?', description: 'Requirements and deadlines.', href: '/admissions/' },
 *   ] } />
 *
 * A tile with no text is left out, and only the first four show.
 */
const QuickLinks = frame( QuickLinksMarkup, {
	// Who it is
	slug: 'quick-links',
	title: 'Quick Links', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'grid',
} );

export default QuickLinks;
