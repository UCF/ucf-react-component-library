import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import Code from '../../Code.tsx';
import { PROPS } from '../../Code.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Code',
	tags: [ 'server' ],
	component: Code,
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof Code >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

/** A line too long for the column wraps rather than scrolling. */
export const LongLine: Story = {
	args: {
		content:
			'const url = "https://www.ucf.edu/degree/computer-science-bs/?utm_source=newsletter&utm_campaign=fall";',
	},
};
