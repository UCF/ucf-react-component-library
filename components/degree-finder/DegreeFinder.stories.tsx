import type { Meta, StoryObj } from '@storybook/react-vite';

import DegreeFinder from './DegreeFinder.tsx';
import { createSampleClient } from './sample-client.ts';
import './style.css';

// WHY sample data by default: stories should work offline and never depend on the live API.
// Try Bachelors, then "computer" or "psych".
const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Interactive (Client)/Degree Finder',
	tags: [ 'client' ],
	component: DegreeFinder,
	args: { client: createSampleClient() },
	argTypes: {
		client: { control: false },
		programType: {
			control: 'select',
			options: [ undefined, 'bachelor', 'master', 'doctorate' ],
		},
	},
} satisfies Meta< typeof DegreeFinder >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

/**
 * As on a masters page: the type is known, so the finder starts at interests.
 */
export const PresetType: Story = {
	args: { programType: 'master' },
};

export const ServiceDown: Story = {
	args: { client: createSampleClient( { fail: true } ) },
};

/**
 * The real ucf.edu REST API. Needs a network connection.
 *
 * WHY `!test`: a test that calls a live API fails whenever the network or the API does, which
 * says nothing about the component. The other stories cover it with sample data.
 */
export const LiveData: Story = {
	args: { client: undefined },
	tags: [ '!test' ],
};
