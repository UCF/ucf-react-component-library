/**
 * The Hero, a trial port of P1's Hero block. Hero.tsx lists what changed from P1 and why.
 *
 * The Hero is a band of its own and picks its colors with its Tone, so the Composition toolbar
 * only shows at its edges. That is one of the questions this port raises: in UCF the Section
 * picks the colors, in P1 each block does.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import Button from '@/components/primitives/button/Button.js';
import '@/components/primitives/button/style.css';
import Heading from '@/components/primitives/heading/Heading.js';
import '@/components/primitives/heading/style.css';
import Paragraph from '@/components/primitives/paragraph/Paragraph.js';
import '@/components/primitives/paragraph/style.css';
import {
	PLACEHOLDER_ALT,
	PLACEHOLDER_IMAGE,
} from '../../../../../.storybook/placeholder.ts';
import { defaultsIn } from '@/integrations/schema/props.js';
import { argTypesOf } from '@/integrations/storybook/arg-types.js';
import Hero from '../../Hero.tsx';
import { PARTS } from '../../Hero.parts.ts';
import { PROPS } from '../../Hero.props.ts';
import '../../style.css';

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Hero',
	tags: [ 'server' ],
	component: Hero,
	// WHY the defaults: what a new Hero starts with in WordPress and Puck, with the stories' photo.
	args: {
		...defaultsIn( PROPS, 'puck' ),
		imageSrc: PLACEHOLDER_IMAGE,
		imageAlt: PLACEHOLDER_ALT,
	},
	argTypes: argTypesOf( PROPS ),
	// WHY: a band of its own, so the Section around it runs edge to edge with the least padding.
	parameters: { section: { width: 'wide', spacing: 'compact' } },
	// The default preset's copy (Hero.presets.ts), from the primitives.
	// WHY the buttons in a row here: Puck has no Buttons group yet, and WordPress uses core's.
	render: ( args ) => (
		<Hero { ...args }>
			<Paragraph
				className={ PARTS.eyebrow.className }
				content="Undergraduate admissions"
			/>
			<Heading
				className={ PARTS.title.className }
				level={ 1 }
				content="Reach for the stars"
			/>
			<Paragraph
				className={ PARTS.description.className }
				content="Florida’s largest university, with 70,674 students, in Orlando and online."
			/>
			<div style={ { display: 'flex', flexWrap: 'wrap', gap: '1rem' } }>
				<Button text="Apply now" url="#" />
				<Button text="Visit campus" url="#" variant="outline" />
			</div>
		</Hero>
	),
} satisfies Meta< typeof Hero >;

export default meta;

type Story = StoryObj< typeof meta >;

/** P1's defaults, with UCF copy: split, accent tone (Bold Gold), image on the right. */
export const Default: Story = {};

/** Dark tone, image on the left. The copy stays first in the HTML. */
export const DarkImageLeft: Story = {
	args: { tone: 'dark', imageSide: 'left', splitRatio: 'copy-wide' },
};

/** Light tone (Light Alt), with the image running to the band's edges. */
export const LightFlush: Story = {
	args: { tone: 'light', imageFill: 'flush' },
};

/** The image behind the copy, under a shade. Always the Dark composition. */
export const FullImage: Story = {
	args: { layout: 'full image', overlay: 'scrim', height: 'tall' },
};

/** No image, centered. */
export const TextOnly: Story = {
	args: { layout: 'text only', contentAlign: 'center' },
};
