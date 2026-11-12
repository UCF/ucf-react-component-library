import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import DegreeList from '../../DegreeList.tsx';
import { PROPS } from '../../DegreeList.props.ts';
import { SAMPLE_PROGRAMS } from '../../sample-data.ts';
// FIX: the Heading primitive's rules, first, so the list's overrides follow them (as the Event
// List's stories load them).
import '@/components/primitives/heading/style.css';
import '../../style.css';

const defaults = defaultsIn( PROPS, 'wp' );

/**
 * WHY sample programs, not the Search Service: a story must look the same on every run, and the
 * service's programs change. client.ts's own tests cover fetching. The filters aren't controls
 * here for the same reason: they choose what is fetched, and a story fetches nothing.
 */
const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Live (Server)/Degree List',
	tags: [ 'server' ],
	component: DegreeList,
	argTypes: argTypesOf( { columns: PROPS.columns } ),
	args: {
		programs: SAMPLE_PROGRAMS.slice( 0, 6 ),
		title: defaults.title,
		columns: defaults.columns,
		emptyMessage: defaults.emptyMessage,
	},
} satisfies Meta< typeof DegreeList >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const WithHeading: Story = {
	args: { title: 'Business programs' },
};

// WHY every sample program: enough names to fill columns. Below 36rem of list (the mobile
// story width) both are one column.
export const TwoColumns: Story = {
	args: { programs: SAMPLE_PROGRAMS, columns: '2' },
};

export const ThreeColumns: Story = {
	args: { programs: SAMPLE_PROGRAMS, columns: '3' },
};

export const NoPrograms: Story = {
	args: { programs: [] },
};
