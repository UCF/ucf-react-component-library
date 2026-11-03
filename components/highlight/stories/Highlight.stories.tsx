import type { Meta, StoryObj } from '@storybook/react-vite';

import {
	PLACEHOLDER_ALT,
	PLACEHOLDER_IMAGE,
} from '../../../.storybook/placeholder.ts';
import Image from '../../../primitives/image/Image.tsx';
import '../../../primitives/image/style.css';
import Paragraph from '../../../primitives/paragraph/Paragraph.tsx';
import '../../../primitives/paragraph/style.css';
import Highlight, { PARTS, type HighlightProps } from '../Highlight.tsx';
import example from '../example.json';
import { CHOICES, type ChoiceKey } from '../options.ts';
import { VARIATIONS, type Part } from '../variations.ts';
import '../style.css';

/**
 * A design's parts as the primitives, as Puck places them (toPrimitives() in
 * adapters/puck/config.tsx does the same as data).
 *
 * @param parts A design's parts.
 */
function renderParts( parts: Part[] ) {
	return parts.map( ( part, index ) =>
		part.kind === 'logo' ? (
			<Image
				key={ index }
				className={ PARTS.logo }
				url={ PLACEHOLDER_IMAGE }
				alt={ part.alt }
			/>
		) : (
			<Paragraph
				key={ index }
				className={ PARTS[ part.part ] }
				content={ part.text }
			/>
		)
	);
}

/**
 * A design's settings and parts as a story.
 *
 * @param name    A design's name in variations.ts.
 * @param content Parts in place of the design's own, for a row of different ones.
 */
function design( name: string, content?: Part[][] ): Story {
	const variation = VARIATIONS.find( ( item ) => item.name === name );
	const all = content ?? [ variation?.content ?? [] ];
	return {
		args: variation?.settings as HighlightProps,
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
				{ all.map( ( parts, index ) => (
					<Highlight key={ index } { ...args }>
						{ renderParts( parts ) }
					</Highlight>
				) ) }
			</div>
		),
	};
}

const text = ( part: keyof typeof PARTS, value: string ): Part => ( {
	kind: 'text',
	part,
	text: value,
} );

const control = ( key: ChoiceKey ) => ( {
	control: CHOICES[ key ].control === 'radio' ? 'inline-radio' : 'select',
	options: CHOICES[ key ].options.map( ( option ) => option.value ),
} );

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Highlight',
	tags: [ 'server' ],
	component: Highlight,
	args: example as HighlightProps,
	argTypes: Object.fromEntries(
		( Object.keys( CHOICES ) as ChoiceKey[] ).map( ( key ) => [
			key,
			control( key ),
		] )
	),
} satisfies Meta< typeof Highlight >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Statement: a fact as a full sentence, why it matters, and its source. */
export const Statement: Story = design( 'statement' );

/** Three statements in a row, as the stats band sets them. */
export const StatementRow: Story = design( 'statement', [
	VARIATIONS[ 0 ]?.content ?? [],
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
export const KeyFigure: Story = design( 'key-figure' );

/** Four key figures in a row, as admissions sets them. */
export const KeyFigureRow: Story = design( 'key-figure', [
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
	VARIATIONS[ 1 ]?.content ?? [],
	[
		text( 'figure', '003954' ),
		text( 'label', 'Federal school code' ),
		text( 'source', 'U.S. Department of Education' ),
	],
] );

/** Bracketed statement: a statement and its detail inside an accent bracket. */
export const Bracket: Story = design( 'bracket' );

/** Side-rule statement: beside an accent rule, with a short credit. */
export const SideRule: Story = design( 'side-rule' );

/** Centered figure: a large figure, a short bar, a sentence and a credit. */
export const Centered: Story = design( 'centered' );

/** Centered, with a logo or badge in place of the figure, as the space band sets them. */
export const CenteredRow: Story = design( 'centered', [
	[
		{ kind: 'logo', alt: PLACEHOLDER_ALT },
		text(
			'detail',
			'For 60+ years, UCF has partnered with NASA to power space exploration, technology and talent.'
		),
	],
	VARIATIONS[ 4 ]?.content ?? [],
	[
		{ kind: 'logo', alt: PLACEHOLDER_ALT },
		text(
			'detail',
			'UCF is a top five most innovative public university.'
		),
		text( 'citation', '(U.S. News & World Report)' ),
	],
] );
