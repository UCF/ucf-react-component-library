import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '#integrations/schema/props.js';
import { argTypesOf } from '#integrations/storybook/arg-types.js';
import EventList from '../../EventList.tsx';
import { PROPS } from '../../EventList.props.ts';
import { SAMPLE_EVENTS } from '../../sample-data.ts';
// FIX: the Heading primitive's rules, first, so the list's overrides follow them. Without it
// they arrived only once another story (the Hero's) had loaded them.
import '#primitives/heading/style.css';
import '../../style.css';

const defaults = defaultsIn( PROPS, 'wp' );

/**
 * WHY sample events, not the feed: a story must look the same on every run, and the feed
 * changes daily. client.ts's own tests cover fetching.
 */
const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Live (Server)/Event List',
	tags: [ 'server' ],
	component: EventList,
	argTypes: argTypesOf( PROPS ),
	args: {
		events: SAMPLE_EVENTS.slice( 0, Number( defaults.limit ) ),
		title: defaults.title,
		columns: defaults.columns,
		dates: defaults.dates,
		descriptions: defaults.descriptions,
		emptyMessage: defaults.emptyMessage,
	},
} satisfies Meta< typeof EventList >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const WithDescriptions: Story = {
	args: { descriptions: 'show' },
};

export const Six: Story = {
	args: { events: SAMPLE_EVENTS },
};

// WHY six: three full rows. Below 40rem of list (the mobile story width) it is one column.
export const TwoColumns: Story = {
	args: { events: SAMPLE_EVENTS, columns: '2', descriptions: 'show' },
};

export const NoDateBlocks: Story = {
	args: { dates: 'hide' },
};

export const NoEvents: Story = {
	args: { events: [] },
};
