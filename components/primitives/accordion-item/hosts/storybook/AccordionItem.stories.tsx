/** CONTEXT: one Accordion Item, open as it is before behavior.ts runs; each heading level. */
import type { Meta, StoryObj } from '@storybook/react-vite';

import Accordion from '@/components/primitives/accordion/Accordion';
import '@/components/primitives/accordion/style.css';
import Paragraph from '@/components/primitives/paragraph/Paragraph';
import '@/components/primitives/paragraph/style.css';
import { defaultsIn } from '@/core/hosts/read-props';
import { argTypesOf } from '@/core/hosts/storybook/props-to-controls';
import AccordionItem, {
	type AccordionItemProps,
} from '../../AccordionItem.tsx';
import { PROPS } from '../../props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Accordion Item',
	tags: [ 'server' ],
	component: AccordionItem,
	args: {
		...defaultsIn( PROPS, 'puck' ),
		title: 'Can I change my major after I am admitted?',
	},
	argTypes: argTypesOf( PROPS ),
	// WHY in an Accordion: an item is only ever placed in one.
	render: ( args: AccordionItemProps ) => (
		<Accordion>
			<AccordionItem { ...args }>
				<Paragraph content="Usually yes, through a change-of-major process. Some majors have course requirements that decide whether a change adds a semester." />
			</AccordionItem>
		</Accordion>
	),
} satisfies Meta< typeof AccordionItem >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

/** SPEC: every level looks the same; the level is the outline's. */
export const AtH2: Story = { args: { level: '2' } };
