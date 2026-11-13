import type { Meta, StoryObj } from '@storybook/react-vite';

import {
	PLACEHOLDER_ALT,
	PLACEHOLDER_IMAGE,
} from '../../../../../.storybook/placeholder.ts';
import Image, { type ImageProps } from '../../Image.tsx';
import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import { PROPS } from '../../Image.props.ts';
import '../../style.css';

// The props' defaults, as Puck starts with them, less the empty CSS class.
const { className, ...defaults } = defaultsIn( PROPS, 'puck' );

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Image',
	tags: [ 'server' ],
	component: Image,
	args: {
		...( defaults as ImageProps ),
		url: PLACEHOLDER_IMAGE,
		alt: PLACEHOLDER_ALT,
	},
	argTypes: argTypesOf( PROPS ),
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
