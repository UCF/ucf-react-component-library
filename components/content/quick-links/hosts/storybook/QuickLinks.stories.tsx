/** CONTEXT: the Quick Links with two, three and four tiles, and empty. */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';

import type { Tile } from '@/core/hosts/prop-definitions';
import { defaultsIn } from '@/core/hosts/read-props';
import { argTypesOf } from '@/core/hosts/storybook/props-to-controls';
import QuickLinks from '../../QuickLinks.tsx';
import { PROPS } from '../../props.ts';
import '../../style.css';

// SPEC: the block theme's quick-links pattern.
const TILES: Tile[] = [
	{
		label: 'Can I get in?',
		description: 'Requirements, deadlines and the admitted class profile.',
		href: '#admissions',
	},
	{
		label: 'What will it cost?',
		description: 'Tuition, aid and the net price calculator.',
		href: '#cost',
	},
	{
		label: 'What do graduates do?',
		description: 'Outcomes by program, from the people who track them.',
		href: '#outcomes',
	},
	{
		label: 'What is it like here?',
		description: 'Housing, clubs and life on campus.',
		href: '#campus',
	},
];

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Quick Links',
	tags: [ 'server' ],
	component: QuickLinks,
	args: { ...defaultsIn( PROPS, 'puck' ), tiles: TILES },
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof QuickLinks >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Four tiles, the most it shows. */
export const Default: Story = {
	// A11Y: one tab stop per tile, its title's link.
	play: async ( { canvas } ) => {
		const links = canvas.getAllByRole( 'link' );
		await expect( links ).toHaveLength( 4 );
		await userEvent.tab();
		await expect( links[ 0 ] ).toHaveFocus();
		await userEvent.tab();
		await expect( links[ 1 ] ).toHaveFocus();
	},
};

/** Two tiles span the row. */
export const Two: Story = { args: { tiles: TILES.slice( 0, 2 ) } };

/** Three tiles span the row. */
export const Three: Story = { args: { tiles: TILES.slice( 0, 3 ) } };

/** Every tile removed. */
export const Empty: Story = { args: { tiles: [] } };
