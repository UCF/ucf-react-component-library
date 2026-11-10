/**
 * The Column: one track of a Columns. Its layouts are in Primitives/Columns.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import Column from '../../Column.tsx';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Column',
	tags: [ 'server' ],
	component: Column,
	render: ( args ) => (
		<Column { ...args }>
			<h3>A column</h3>
			<p>Anything goes in a Column; blocks inside it are a gap apart.</p>
			<p>A second paragraph.</p>
		</Column>
	),
} satisfies Meta< typeof Column >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
