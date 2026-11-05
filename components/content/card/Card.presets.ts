/**
 * The Card's presets: UCF's card designs, each a mix of props and parts.
 * SPEC: from UCF's pages: story, next step, admissions audience tiles, pathway cards, media tiles.
 */
import type { Part } from './Card.parts.ts';
import type { CardEditableProps } from './Card.props.ts';
import {
	findPreset,
	type Preset as PresetOf,
} from '../../../integrations/schema/presets.ts';

export type Preset = PresetOf< CardEditableProps, Part >;

// WHY `as const`: the names and parts stay exact, so `<Card preset="pathway" content={ … } />`
// offers only the pathway card's parts.
export const PRESETS = [
	{
		name: 'story',
		title: 'Card: Story',
		description: 'An image, a category and date, a title and a sentence.',
		wpIcon: 'postFeaturedImage',
		props: { variant: 'plain' },
		parts: [
			{ part: 'image', aspectRatio: '3/2' },
			{ part: 'meta', text: 'News · Sept. 18, 2026' },
			{
				part: 'title',
				level: 3,
				text: 'A senior design team’s drone goes into service',
			},
			{
				part: 'description',
				text: 'One or two sentences that help someone decide whether to read it.',
			},
		],
	},
	{
		name: 'next-step',
		title: 'Card: Next step',
		description: 'A boxed title, a sentence and one button.',
		wpIcon: 'button',
		props: { variant: 'boxed' },
		parts: [
			{ part: 'title', level: 3, text: 'Next step' },
			{
				part: 'description',
				text: 'One application covers every undergraduate program, and you can save and come back.',
			},
			{ part: 'button', text: 'Start your application', url: '#' },
		],
	},
	{
		name: 'audience',
		title: 'Card: Audience tile',
		description:
			'A square tile: a photo under a tint, a name in capitals and a sentence.',
		wpIcon: 'people',
		props: {
			variant: 'plain',
			composition: 'gold',
			overlay: 'tint',
			contentAlign: 'center',
			contentPosition: 'center',
			aspectRatio: '1/1',
		},
		background: true,
		parts: [
			{ part: 'label', level: 3, text: 'Freshman' },
			{
				part: 'description',
				text: 'I’m a high school senior or first-time-in-college student seeking a bachelor’s degree.',
			},
		],
	},
	{
		name: 'pathway',
		title: 'Card: Pathway',
		description:
			'A dark card: who it is for, a display title, a sentence and a link.',
		wpIcon: 'arrowRight',
		props: { variant: 'plain', composition: 'dark' },
		parts: [
			{ part: 'eyebrow', text: 'First-year' },
			{
				part: 'display',
				level: 3,
				text: 'I am applying from high school',
			},
			{
				part: 'description',
				text: 'Deadlines, the admitted profile, and what we look at besides grades.',
			},
			{ part: 'link', text: 'First-year admission', url: '#' },
		],
	},
	{
		name: 'media',
		title: 'Card: Media tile',
		description:
			'A photo under a gradient, a tag in the corner and a caption at the bottom.',
		wpIcon: 'overlayText',
		props: {
			variant: 'plain',
			composition: 'dark',
			overlay: 'gradient',
			contentPosition: 'bottom',
			aspectRatio: '4/3',
		},
		background: true,
		parts: [
			{ part: 'tag', text: 'Engineering' },
			{
				part: 'description',
				text: 'A materials pour. You do it, nobody demonstrates it at you.',
			},
		],
	},
] as const satisfies readonly Preset[];

// A preset by its name.
export const presetNamed = ( name: string ): Preset =>
	findPreset( PRESETS, name );

/** What a new Card starts with: a starting point editors may change, not a lock. */
export const DEFAULT_PRESET: Preset = presetNamed( 'story' );
