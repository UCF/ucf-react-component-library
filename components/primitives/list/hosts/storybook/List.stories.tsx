import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/core/hosts/read-props';
import { argTypesOf } from '@/core/hosts/storybook/props-to-controls';
import List from '../../List.tsx';
import { PROPS } from '../../props.ts';
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

/** Each item is "Title: what to do"; the number sits in an accent square, a line joins them. */
export const Steps: Story = {
	args: {
		variant: 'steps',
		items: 'Apply to UCF: Name Computer Science as your intended major.\nComplete the foundation courses: Calculus and the first programming course, with the grades the catalog sets.\nMeet with an advisor: Plan your concentration and your senior design year.',
	},
};
