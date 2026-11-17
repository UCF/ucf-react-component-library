/** CONTEXT: the Section Nav's presets: none; it has one look. */
import type { Part } from './SectionNav.parts.ts';
import type { SectionNavEditableProps } from './SectionNav.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< SectionNavEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** A new Section Nav: no links until the editor fills them. */
export const DEFAULT_PRESET: Preset = {
	name: 'section-nav',
	title: 'Section Nav',
	description: 'Links to the sections of the page.',
	wpIcon: 'tableOfContents',
	props: {},
	parts: [],
};
