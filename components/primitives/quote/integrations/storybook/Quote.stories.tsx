import type { Meta, StoryObj } from '@storybook/react-vite';

import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import Quote from '../../Quote.tsx';
import { PROPS } from '../../Quote.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Quote',
	tags: [ 'server' ],
	component: Quote,
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
} satisfies Meta< typeof Quote >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

/** A blank line in the quote starts a new paragraph; the marks open the first and close the last. */
export const TwoParagraphs: Story = {
	args: {
		value: 'The first paragraph of the quotation.\n\nThe second, after a blank line.',
	},
};

export const NoCitation: Story = { args: { citation: '' } };
