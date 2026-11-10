import type { Meta, StoryObj } from '@storybook/react-vite';

import Heading, { type HeadingProps } from '../../Heading.tsx';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS } from '../../Heading.props.ts';
import '../../style.css';

// The props' defaults, as Puck starts with them, less the empty CSS class. WHY the level a number
// and its own control: the Heading takes a number; the props hold Puck's string.
const {
	className,
	level: defaultLevel,
	...defaults
} = defaultsIn( PROPS, 'puck' );

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Heading',
	tags: [ 'server' ],
	component: Heading,
	args: {
		...defaults,
		content: 'Undergraduate degrees',
		level: Number( defaultLevel ),
	} as HeadingProps,
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
