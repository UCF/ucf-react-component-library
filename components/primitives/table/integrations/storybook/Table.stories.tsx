import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import Table from '../../Table.tsx';
import { PROPS } from '../../Table.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Table',
	tags: [ 'server' ],
	component: Table,
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof Table >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const Stripes: Story = { args: { variant: 'stripes' } };

/** Wider than a phone: it scrolls sideways with its first column held, and takes keyboard focus. */
export const Compare: Story = { args: { variant: 'compare' } };

export const NoCaption: Story = { args: { caption: '' } };
