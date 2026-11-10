/**
 * The Highlight: something pulled out of the page to stand on its own, a fact, a key figure or a
 * ranking, with its source. The accent rule and spacing; the content placed inside is open.
 *
 * `<Highlight preset="key-figure" content={ { figure: 'Nov 1', label: 'Early action' } } />`, or
 * any children. Hosts read `Highlight.port` (integrations/react/frame.tsx).
 * WHY "Highlight", not "Stat": not every one is a number (a partnership, a ranking with a logo).
 * SPEC: the default is the statement, a fact written as a full sentence. The key figure (a large
 * number or date over a label) is for values that are not claims: a deadline, a code.
 * WHY `ucf-c-` and not `ucf-`: the block theme already styles `.ucf-stat`, and its
 * `> p:not(...)` selectors outrank a single class.
 * SYNC: WordPress stores this markup in every post that uses the block.
 */
import {
	frame,
	type FrameProps,
	type OwnProps,
	type PresetProps,
} from '@/integrations/react/frame.js';
import { PARTS } from './Highlight.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Highlight.presets.ts';
import { PROPS } from './Highlight.props.ts';

/** Everything the Highlight takes: its props, `preset`, `content`, and a site's HTML attributes. */
export type HighlightProps = OwnProps< typeof PROPS > &
	PresetProps< typeof PARTS, typeof PRESETS >;

function HighlightMarkup( {
	rule = PROPS.rule.default,
	contentAlign = PROPS.contentAlign.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-highlight' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-rule={ rule }
			data-align={ contentAlign === 'start' ? undefined : contentAlign }
		>
			{ area(
				'content',
				{ className: 'ucf-c-highlight__content' },
				children
			) }
		</div>
	);
}

/**
 * A fact, a key figure or a ranking, with its source. Start from a preset and fill its parts, or
 * pass any children:
 *
 *   <Highlight preset="key-figure" content={ { figure: 'Nov 1', label: 'Early action deadline' } } />
 *
 * Its props, presets and parts: Highlight.props.ts, Highlight.presets.ts, Highlight.parts.ts.
 */
const Highlight = frame( HighlightMarkup, {
	// Who it is
	slug: 'highlight',
	title: 'Highlight', // SYNC: block.json's title
	kind: 'content',

	// What it takes
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'starFilled',
} );

export default Highlight;
