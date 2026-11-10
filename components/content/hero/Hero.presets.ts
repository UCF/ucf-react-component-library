/**
 * The Hero's presets: none yet. A new one starts with DEFAULT_PRESET, P1's copy: an eyebrow, a
 * title, a description and two buttons.
 */
import type { Part } from './Hero.parts.ts';
import type { HeroEditableProps } from './Hero.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< HeroEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Hero starts with: a start, not a lock. Not a variation: it's the block itself. */
export const DEFAULT_PRESET: Preset = {
	name: 'hero',
	title: 'Hero',
	description: 'An image, an eyebrow, a title, a sentence and two buttons.',
	wpIcon: 'cover',
	props: {},
	background: true,
	parts: [
		{ part: 'eyebrow', text: 'Undergraduate admissions' },
		{ part: 'title', level: 1, text: 'Reach for the stars' },
		{
			part: 'description',
			text: 'Florida’s largest university, with 70,674 students, in Orlando and online.',
		},
		{ part: 'button', text: 'Apply now', url: '#' },
		{
			part: 'secondaryButton',
			text: 'Visit campus',
			url: '#',
			outline: true,
		},
	],
};
