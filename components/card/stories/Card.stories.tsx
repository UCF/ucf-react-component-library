import type { Meta, StoryObj } from '@storybook/react-vite';

import Button from '../../../primitives/button/Button.tsx';
import '../../../primitives/button/style.css';
import Heading from '../../../primitives/heading/Heading.tsx';
import '../../../primitives/heading/style.css';
import Image from '../../../primitives/image/Image.tsx';
import '../../../primitives/image/style.css';
import Paragraph from '../../../primitives/paragraph/Paragraph.tsx';
import '../../../primitives/paragraph/style.css';
import { PLACEHOLDER_IMAGE } from '../../../.storybook/placeholder.ts';
import Card, { PARTS, type CardProps } from '../Card.tsx';
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
	return parts.map( ( part, index ) => {
		switch ( part.kind ) {
			case 'image':
				return (
					<Image
						key={ index }
						url={ PLACEHOLDER_IMAGE }
						alt=""
						aspectRatio={ part.aspectRatio }
					/>
				);
			case 'heading':
				return (
					<Heading
						key={ index }
						content={ part.text }
						level={ part.level }
						className={ part.part && PARTS[ part.part ] }
					/>
				);
			case 'text':
				return (
					<Paragraph
						key={ index }
						content={ part.text }
						className={ part.part && PARTS[ part.part ] }
					/>
				);
			case 'link':
				return (
					<Button
						key={ index }
						text={ part.text }
						url={ part.url }
						variant="text"
						className={ PARTS.link }
					/>
				);
			// 'button'
			default:
				return (
					<Button key={ index } text={ part.text } url={ part.url } />
				);
		}
	} );
}

/**
 * A design's settings and parts as a story: its sample image when it has a background.
 *
 * @param name A design's name in variations.ts.
 */
function design( name: string ): Story {
	const variation = VARIATIONS.find( ( item ) => item.name === name );
	return {
		args: {
			...( variation?.settings as CardProps ),
			imageSrc: variation?.background ? PLACEHOLDER_IMAGE : '',
		},
		render: ( args ) => (
			<Card { ...args }>{ renderParts( variation?.content ?? [] ) }</Card>
		),
	};
}

/**
 * The same design several times in a grid, as the UCF pages set them.
 *
 * @param name    A design's name in variations.ts.
 * @param columns How many cards, and so how many to a row on a wide screen.
 */
function grid( name: string, columns: number ): Story {
	const single = design( name );
	return {
		...single,
		render: ( args, context ) => (
			<div
				style={ {
					display: 'grid',
					gap: '1.5rem',
					gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${
						columns > 3 ? 12 : 16
					}rem), 1fr))`,
				} }
			>
				{ Array.from( { length: columns }, ( _, index ) => (
					<div key={ index }>
						{ single.render?.( args, context ) }
					</div>
				) ) }
			</div>
		),
		parameters: { cardWidth: 'none' },
	};
}

const control = ( key: ChoiceKey ) => ( {
	control: CHOICES[ key ].control === 'radio' ? 'inline-radio' : 'select',
	options: CHOICES[ key ].options.map( ( option ) => option.value ),
} );

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Card',
	tags: [ 'server' ],
	component: Card,
	// WHY example.json: the same props the WordPress inserter preview and the markup test use.
	args: example as CardProps,
	argTypes: Object.fromEntries(
		( Object.keys( CHOICES ) as ChoiceKey[] ).map( ( key ) => [
			key,
			control( key ),
		] )
	),
	// WHY a width: a card sits in a grid column. A story that needs more sets `cardWidth`.
	decorators: [
		( Story, { parameters } ) => (
			<div style={ { maxWidth: parameters.cardWidth ?? '22rem' } }>
				<Story />
			</div>
		),
	],
	// Content no design holds, to show the frame takes anything: a list and two buttons.
	render: ( args ) => (
		<Card { ...args }>
			<Heading
				content="Visit campus"
				level={ 3 }
				className={ PARTS.title }
			/>
			<Paragraph content="Tours run every weekday at 10 a.m. and 2 p.m." />
			<ul>
				<li>Ninety minutes, on foot</li>
				<li>Led by a current student</li>
			</ul>
			<div style={ { display: 'flex', flexWrap: 'wrap', gap: '1rem' } }>
				<Button text="Book a tour" url="#" />
				<Button text="Virtual tour" url="#" variant="text" />
			</div>
		</Card>
	),
} satisfies Meta< typeof Card >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Boxed, holding content none of the designs has: a list and two actions. */
export const Default: Story = {};

/** Story card: image, category and date, sans title, a sentence. */
export const StoryCard: Story = design( 'story' );

/** Next step card: boxed title, a sentence, one button. */
export const NextStep: Story = design( 'next-step' );

/** Audience tile: a square on Bold Gold, the photo under a tint, centered. */
export const Audience: Story = design( 'audience' );

/** Three audience tiles in a row, as the admissions page sets them. */
export const AudienceGrid: Story = grid( 'audience', 3 );

/** Pathway card: Dark, an eyebrow, a display title, a sentence and an arrow link. */
export const Pathway: Story = design( 'pathway' );

/** Four pathway cards in a row: "Which of these are you?" */
export const PathwayGrid: Story = grid( 'pathway', 4 );

/** Media tile: a photo under a gradient, a tag pinned to the corner, a caption at the bottom. */
export const Media: Story = design( 'media' );

/** Four media tiles in a row, as the campus strip sets them. */
export const MediaGrid: Story = grid( 'media', 4 );

/** Under a heavy top rule. */
export const Ruled: Story = { args: { variant: 'ruled' } };
