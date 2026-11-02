import type { Meta, StoryObj } from '@storybook/react-vite';

import Paragraph from '../../../primitives/paragraph/Paragraph.tsx';
import '../../../primitives/paragraph/style.css';
import Stat, { PARTS } from '../Stat.tsx';
import '../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Stat',
	tags: [ 'server' ],
	component: Stat,
	// The template's three parts, as the Paragraph primitive with each part's class.
	// SYNC: TEMPLATE in adapters/puck/config.tsx.
	render: ( args ) => (
		<Stat { ...args }>
			<Paragraph
				className={ PARTS.statement }
				content="Florida’s largest university, with 70,674 students"
			/>
			<Paragraph
				className={ PARTS.detail }
				content="One sentence saying why the number matters."
			/>
			<Paragraph
				className={ PARTS.source }
				content={
					<>
						Source:{ ' ' }
						<a href="https://www.ucf.edu/about-ucf/facts/">
							UCF Facts
						</a>
						, fall 2025
					</>
				}
			/>
		</Stat>
	),
} satisfies Meta< typeof Stat >;

export default meta;

type Story = StoryObj< typeof meta >;

/** The template: statement, detail and source. */
export const Default: Story = {};

/** An editor removed the detail and source: the frame holds whatever is left. */
export const StatementOnly: Story = {
	render: ( args ) => (
		<Stat { ...args }>
			<Paragraph
				className={ PARTS.statement }
				content="Two million square feet of research space"
			/>
		</Stat>
	),
};

/** Plain paragraphs with no part class: the frame's rule and spacing, in body type. */
export const WithoutPartClasses: Story = {
	render: ( args ) => (
		<Stat { ...args }>
			<Paragraph content="A paragraph an editor added, without a part class." />
			<Paragraph content="Another one." />
		</Stat>
	),
};
