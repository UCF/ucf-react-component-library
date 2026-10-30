import type { Meta, StoryObj } from '@storybook/react-vite';

import Stat from '../stat/Stat.tsx';
import statExample from '../stat/example.json';
import '../stat/style.css';
import Section from './Section.tsx';
import type { Composition } from './compositions.ts';
import './style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Section',
	tags: [ 'server' ],
	component: Section,
	args: { width: 'default', spacing: 'default' },
	argTypes: {
		width: {
			control: 'inline-radio',
			options: [ 'default', 'constrained', 'wide' ],
		},
		spacing: {
			control: 'inline-radio',
			options: [ 'default', 'cozy', 'compact' ],
		},
	},
	// WHY section: false: these stories are the Section, so the preview doesn't wrap them in one.
	parameters: { section: false },
	// WHY the composition from the toolbar, not an arg: the Composition menu, and each story
	// test project, then set the band itself rather than a wrapper around it.
	render: ( args, { globals } ) => (
		<Section
			{ ...args }
			composition={ ( globals.composition ?? 'light' ) as Composition }
		>
			<h2>Florida’s largest university</h2>
			<p>
				A paragraph of body copy, at the reading measure, on the band’s
				own background.
			</p>
			<Stat { ...statExample } />
		</Section>
	),
} satisfies Meta< typeof Section >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

/** A band of text, constrained to the reading width. */
export const Constrained: Story = { args: { width: 'constrained' } };

/** Edge to edge, inside the band's gutter. */
export const Wide: Story = { args: { width: 'wide' } };

/** Less space above and below, for a band that continues the one above it. */
export const Cozy: Story = { args: { spacing: 'cozy' } };

/** The least space above and below. */
export const Compact: Story = { args: { spacing: 'compact' } };
