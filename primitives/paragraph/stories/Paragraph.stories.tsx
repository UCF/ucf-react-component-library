import type { Meta, StoryObj } from '@storybook/react-vite';

import Paragraph from '../Paragraph.tsx';
import example from '../example.json';
import '../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Paragraph',
	tags: [ 'server' ],
	component: Paragraph,
	args: example,
} satisfies Meta< typeof Paragraph >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
