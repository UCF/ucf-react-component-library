import type { Meta, StoryObj } from '@storybook/react-vite';

import Paragraph from '../../Paragraph.tsx';
import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import { PROPS } from '../../Paragraph.props.ts';
import '../../style.css';

// The props' defaults, as Puck starts with them, less the empty CSS class.
const { className, ...defaults } = defaultsIn( PROPS, 'puck' );

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Paragraph',
	tags: [ 'server' ],
	component: Paragraph,
	args: defaults,
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof Paragraph >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};
