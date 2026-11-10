/**
 * The Section's presets: none. A Section holds anything, so it has no designs to pick from; a new
 * one starts with DEFAULT_PRESET's heading and paragraph.
 */
import type { Part } from './Section.parts.ts';
import type { SectionEditableProps } from './Section.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< SectionEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Section starts with: a start, not a lock. Not a variation: it's the block itself. */
export const DEFAULT_PRESET: Preset = {
	name: 'section',
	title: 'Section',
	description: 'A band with a heading and body copy.',
	wpIcon: 'stretchFullWidth',
	props: {},
	parts: [
		{ part: 'heading', level: 2, text: 'Florida’s largest university' },
		{
			part: 'body',
			text: 'A paragraph of body copy, on the band’s own background.',
		},
	],
};
