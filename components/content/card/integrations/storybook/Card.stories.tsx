/**
 * The Card's props: the frame holding content no preset has, with a control for every prop
 * (Card.props.ts). The presets are in Card.presets.stories.tsx.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import Button from '#primitives/button/Button.js';
import Heading from '#primitives/heading/Heading.js';
import Paragraph from '#primitives/paragraph/Paragraph.js';
import Card from '../../Card.tsx';
import { PARTS } from '../../Card.parts.ts';
import { base } from './shared.tsx';

const meta = {
	...base,
	title: 'Content (Server)/Card/Props',
	// Content no preset holds, to show the frame takes anything: a list and two buttons.
	render: ( args ) => (
		<Card { ...args }>
			<Heading
				content="Visit campus"
				level={ 3 }
				className={ PARTS.title.className }
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

/** The defaults, holding content none of the presets has: a list and two actions. */
export const Default: Story = {};

/** Under a heavy top rule. */
export const Ruled: Story = { args: { variant: 'ruled' } };
