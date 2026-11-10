import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import List from '../../List.tsx';
import { PROPS } from '../../List.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/List',
	tags: [ 'server' ],
	component: List,
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof List >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const Numbered: Story = { args: { variant: 'numbered' } };

export const Check: Story = { args: { variant: 'check' } };

export const Divided: Story = { args: { variant: 'divided' } };

export const Tags: Story = {
	args: { variant: 'tags', items: 'Research\nInternships\nStudy abroad' },
};

/** Each item is "Term: value"; the term is bold, beside its value from 1024px. */
export const Definitions: Story = {
	args: {
		variant: 'definitions',
		items: 'Office hours: Monday to Friday, 8 a.m. to 5 p.m.\nPhone: 407-823-3000\nLocation: Millican Hall, Room 161',
	},
};
