import type { Meta, StoryObj } from '@storybook/react-vite';

import Image, { type ImageProps } from '../Image.tsx';
import example from '../example.json';
import '../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Image',
	tags: [ 'server' ],
	component: Image,
	args: example as ImageProps,
	argTypes: {
		aspectRatio: {
			control: 'inline-radio',
			options: [ '', '3/2', '16/9', '4/3', '1/1' ],
		},
	},
	// WHY a width: the image fills whatever it's given, which would be the whole Section.
	decorators: [
		( Story ) => (
			<div style={ { maxWidth: '24rem' } }>
				<Story />
			</div>
		),
	],
} satisfies Meta< typeof Image >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Cropped to 3:2, as a card's image is. */
export const Default: Story = {};

/** The image's own shape. */
export const Original: Story = { args: { aspectRatio: '' } };

/** Square, cropped from the middle. */
export const Square: Story = { args: { aspectRatio: '1/1' } };
