/** CONTEXT: the Quick Links' presets: none; it has one look. */
import type { Part } from './parts.ts';
import type { QuickLinksEditableProps } from '../props.ts';
import type { Preset as PresetOf } from '@/core/frame/types';

export type Preset = PresetOf< QuickLinksEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** A new Quick Links: no tiles until the editor adds them. */
export const DEFAULT_PRESET: Preset = {
	name: 'quick-links',
	title: 'Quick Links',
	description:
		'Two to four task links, each a question a visitor arrives with.',
	wpIcon: 'grid',
	props: {},
	parts: [],
};
