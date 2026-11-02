/**
 * The Hero, a trial port of P1's Hero block. Hero.tsx lists what changed from P1 and why.
 *
 * The Hero is a band of its own and picks its colors with its Tone, so the Composition toolbar
 * only shows at its edges. That is one of the questions this port raises: in UCF the Section
 * picks the colors, in P1 each block does.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';

import Hero, { type HeroProps } from '../Hero.tsx';
import example from '../example.json';
import { CHOICES, type ChoiceKey } from '../options.ts';
import '../../../primitives/button/style.css';
import '../style.css';

const control = ( key: ChoiceKey ) => ( {
	control: CHOICES[ key ].control === 'radio' ? 'inline-radio' : 'select',
	options: CHOICES[ key ].options.map( ( option ) => option.value ),
} );

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Hero',
	tags: [ 'server' ],
	component: Hero,
	// WHY example.json: the same props the WordPress inserter preview and the markup test use.
	args: example as HeroProps,
	argTypes: Object.fromEntries(
		( Object.keys( CHOICES ) as ChoiceKey[] ).map( ( key ) => [
			key,
			control( key ),
		] )
	),
	// WHY: a band of its own, so the Section around it runs edge to edge with the least padding.
	parameters: { section: { width: 'wide', spacing: 'compact' } },
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

/** No image, centered, with P1's trust badges. */
export const TextOnly: Story = {
	args: { layout: 'text only', contentAlign: 'center', badges: 'on' },
};
