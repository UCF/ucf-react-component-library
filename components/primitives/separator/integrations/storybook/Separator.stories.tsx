import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import Separator from '../../Separator.tsx';
import { PROPS } from '../../Separator.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Separator',
	tags: [ 'server' ],
	component: Separator,
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof Separator >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const Wide: Story = { args: { variant: 'wide' } };

export const Dots: Story = { args: { variant: 'dots' } };
