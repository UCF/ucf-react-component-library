import type { Meta, StoryObj } from '@storybook/react-vite';

import Button, { type ButtonProps } from '../Button.tsx';
import example from '../example.json';
import '../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Button',
	tags: [ 'server' ],
	component: Button,
	args: example as ButtonProps,
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: [ 'fill', 'outline', 'text' ],
		},
		fontSize: { control: 'inline-radio', options: [ '', 'small', 'body' ] },
		linkTarget: { control: 'inline-radio', options: [ '', '_blank' ] },
	},
} satisfies Meta< typeof Button >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Core's Fill style: the main action. */
export const Default: Story = {};

/** Core's Outline style: the less important action beside a filled one. */
export const Outline: Story = {
	args: { text: 'Visit campus', variant: 'outline' },
};

/** The two together, as a hero or a call to action uses them. */
export const Pair: Story = {
	render: ( args ) => (
		<div style={ { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' } }>
			<Button { ...args } />
			<Button { ...args } text="Visit campus" variant="outline" />
		</div>
	),
};

/** The theme's Text style: a link-weight action, for "See all" beside a heading. */
export const Text: Story = {
	args: { text: 'See all programs', variant: 'text' },
};

/** The three sizes, as core's font-size control sets them in the theme: Small, default, Large. */
export const Sizes: Story = {
	render: ( args ) => (
		<div
			style={ {
				alignItems: 'center',
				display: 'flex',
				flexWrap: 'wrap',
				gap: '0.75rem',
			} }
		>
			<Button { ...args } fontSize="small" />
			<Button { ...args } />
			<Button { ...args } fontSize="body" />
		</div>
	),
};

/** Opens in a new tab, with `rel="noopener noreferrer"`. */
export const NewTab: Story = { args: { linkTarget: '_blank' } };
