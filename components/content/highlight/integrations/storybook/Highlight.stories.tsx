import type { Meta, StoryObj } from '@storybook/react-vite';

import { PLACEHOLDER_ALT } from '../../../../../.storybook/placeholder.ts';
import { resolveParts } from '#integrations/schema/parts.js';
import { defaultsIn } from '#integrations/schema/props.js';
import { argTypesOf } from '#integrations/storybook/arg-types.js';
import { renderParts } from '#integrations/storybook/parts.js';
import Highlight from '../../Highlight.tsx';
import { PARTS, type Part } from '../../Highlight.parts.ts';
import { presetNamed } from '../../Highlight.presets.ts';
import { PROPS } from '../../Highlight.props.ts';
import '../../style.css';

/**
 * A preset as a story: its props, and its parts, or a row of other parts set the same way.
 *
 * @param name    A preset's name in Highlight.presets.ts.
 * @param content Parts in place of the preset's own, for a row of different ones.
 */
function preset( name: string, content?: ( readonly Part[] )[] ): Story {
	const { props, parts } = presetNamed( name );
	const all = content ?? [ parts ];
	return {
		args: props,
		render: ( args ) => (
			<div
				style={ {
					display: 'grid',
					gap: '2.5rem',
					gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${
						all.length > 3 ? 12 : 16
					}rem), 1fr))`,
				} }
			>
				{ all.map( ( row, index ) => (
					<Highlight key={ index } { ...args }>
						{ renderParts( resolveParts( PARTS, row ) ) }
					</Highlight>
				) ) }
			</div>
		),
	};
}

/**
 * A text part.
 *
 * @param part  Its look's name in Highlight.parts.ts.
 * @param value Its text.
 */
const text = (
	part: Exclude< keyof typeof PARTS, 'logo' >,
	value: string
): Part => ( { part, text: value } );

/** A logo or badge, with the sample photo. */
const logo: Part = { part: 'logo', alt: PLACEHOLDER_ALT };

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Highlight',
	tags: [ 'server' ],
	component: Highlight,
	// WHY the defaults: what a new Highlight starts with in WordPress and Puck.
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof Highlight >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Statement: a fact as a full sentence, why it matters, and its source. */
export const Statement: Story = preset( 'statement' );

/** Three statements in a row, as the stats band sets them. */
export const StatementRow: Story = preset( 'statement', [
	presetNamed( 'statement' ).parts,
	[
		text( 'statement', 'Twelve colleges and 250 degree programs' ),
		text(
			'detail',
			'From the arts to optics, undergraduate through doctoral.'
		),
		text( 'source', 'Source: UCF Academics' ),
	],
	[
		text( 'statement', 'Central Florida Research Park is next door' ),
		text(
			'detail',
			'Co-op placements and research partners within a bike ride of class.'
		),
		text( 'source', 'Source: UCF Facts, fall 2025' ),
	],
] );

/** Key figure: a value set large, what it is, and its source. */
export const KeyFigure: Story = preset( 'key-figure' );

/** Four key figures in a row, as admissions sets them. */
export const KeyFigureRow: Story = preset( 'key-figure', [
	[
		text( 'figure', '4.0–4.5' ),
		text( 'label', 'Middle 50% weighted GPA' ),
		text( 'source', 'Common Data Set, section C11' ),
	],
	[
		text( 'figure', '1250–1400' ),
		text( 'label', 'Middle 50% SAT' ),
		text( 'source', 'Common Data Set, section C9' ),
	],
	presetNamed( 'key-figure' ).parts,
	[
		text( 'figure', '003954' ),
		text( 'label', 'Federal school code' ),
		text( 'source', 'U.S. Department of Education' ),
	],
] );

/** Bracketed statement: a statement and its detail inside an accent bracket. */
export const Bracket: Story = preset( 'bracket' );

/** Side-rule statement: beside an accent rule, with a short credit. */
export const SideRule: Story = preset( 'side-rule' );

/** Centered figure: a large figure, a short bar, a sentence and a credit. */
export const Centered: Story = preset( 'centered' );

/** Centered, with a logo or badge in place of the figure, as the space band sets them. */
export const CenteredRow: Story = preset( 'centered', [
	[
		logo,
		text(
			'detail',
			'For 60+ years, UCF has partnered with NASA to power space exploration, technology and talent.'
		),
	],
	presetNamed( 'centered' ).parts,
	[
		logo,
		text(
			'detail',
			'UCF is a top five most innovative public university.'
		),
		text( 'citation', '(U.S. News & World Report)' ),
	],
] );
