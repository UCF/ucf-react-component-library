import type { Meta, StoryObj } from '@storybook/react-vite';

import Stat from './Stat.tsx';
import example from './example.json';
import './style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Stat',
	tags: [ 'server' ],
	component: Stat,
	// WHY example.json: the same props the WordPress inserter preview and the markup test use.
	args: example,
} satisfies Meta< typeof Stat >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const StatementOnly: Story = {
	args: {
		detail: undefined,
		source: undefined,
		sourceUrl: undefined,
		asOf: undefined,
	},
};

export const SourceWithoutLink: Story = {
	args: { sourceUrl: undefined },
};

/**
 * How a host's link component goes in through the slot. Next would pass `next/link` here.
 */
export const CustomLink: Story = {
	args: {
		linkAs: ( props: { href: string; children: React.ReactNode } ) => (
			<a { ...props } data-router="host">
				{ props.children }
			</a>
		),
	},
};
