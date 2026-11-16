/**
 * The Section Nav's presets: none. It has one look; what changes is its links.
 */
import type { Part } from './SectionNav.parts.ts';
import type { SectionNavEditableProps } from './SectionNav.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< SectionNavEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Section Nav starts with: no links, until WordPress fills them from the page. */
export const DEFAULT_PRESET: Preset = {
	name: 'section-nav',
	title: 'Section Nav',
	description: 'Links to the sections of the page.',
	wpIcon: 'tableOfContents',
	props: {},
	parts: [],
};
