import type { Meta, StoryObj } from '@storybook/react-vite';

import Heading, { type HeadingProps } from '../Heading.tsx';
import example from '../example.json';
import '../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Heading',
	tags: [ 'server' ],
	component: Heading,
	args: example as HeadingProps,
	argTypes: {
		level: { control: 'inline-radio', options: [ 1, 2, 3, 4, 5, 6 ] },
	},
} satisfies Meta< typeof Heading >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

/** Every level, largest first: display type to h3, body type from h4. */
export const Levels: Story = {
	render: ( args ) => (
		<div style={ { display: 'grid', gap: '1.5rem' } }>
			{ ( [ 1, 2, 3, 4, 5, 6 ] as const ).map( ( level ) => (
				<Heading
					key={ level }
					{ ...args }
					level={ level }
					content={ `Heading ${ level }` }
				/>
			) ) }
		</div>
	),
};
