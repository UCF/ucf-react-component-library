import type { Meta, StoryObj } from '@storybook/react-vite';

import Button from '../../../primitives/button/Button.tsx';
import '../../../primitives/button/style.css';
import Heading from '../../../primitives/heading/Heading.tsx';
import '../../../primitives/heading/style.css';
import Image from '../../../primitives/image/Image.tsx';
import '../../../primitives/image/style.css';
import Paragraph from '../../../primitives/paragraph/Paragraph.tsx';
import '../../../primitives/paragraph/style.css';
import imageExample from '../../../primitives/image/example.json';
import Card from '../Card.tsx';
import example from '../example.json';
import { VARIANTS, type Variant } from '../options.ts';
import '../style.css';

// WHY the Image's sample: the frame holds whatever an editor puts in it, and these stories
// stand in for that.
const IMAGE = imageExample.url;

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Card',
	tags: [ 'server' ],
	component: Card,
	// WHY example.json: the same props the WordPress inserter preview and the markup test use.
	args: example as { variant: Variant },
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: VARIANTS.options.map( ( option ) => option.value ),
		},
	},
	// WHY a width: a card sits in a grid column. A story that needs more sets `cardWidth`.
	decorators: [
		( Story, { parameters } ) => (
			<div style={ { maxWidth: parameters.cardWidth ?? '22rem' } }>
				<Story />
			</div>
		),
	],
	// Stand-ins for what an editor would place, from the primitives (and a plain list): a heading,
	// a list and two buttons, which a card with fields couldn't hold.
	render: ( args ) => (
		<Card { ...args }>
			<Heading content="Visit campus" level={ 3 } />
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

/** Boxed, holding a list and two actions: content a card with fields couldn't hold. */
export const Default: Story = {};

/** No box: the content alone, with the frame's spacing. */
export const Plain: Story = { args: { variant: 'plain' } };

/** Under a heavy top rule. */
export const Ruled: Story = { args: { variant: 'ruled' } };

/**
 * An image placed inside: it sits within the box's padding. The frame doesn't bleed it to the
 * edges, because it doesn't know what it holds; the fixed example
 * (examples/fixed-card), which owns its image, does.
 */
export const WithImage: Story = {
	render: ( args ) => (
		<Card { ...args }>
			<Image url={ IMAGE } alt="" aspectRatio="3/2" />
			<Heading content="Undergraduate degrees" level={ 3 } />
			<Paragraph content="Explore more than 100 bachelor’s programs." />
		</Card>
	),
};
