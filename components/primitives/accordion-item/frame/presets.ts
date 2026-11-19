/**
 * The Accordion Item's presets: none. It has one design.
 */
import type { Part } from './parts.ts';
import type { AccordionItemEditableProps } from '../props.ts';
import type { Preset as PresetOf } from '@/core/frame/types';

export type Preset = PresetOf< AccordionItemEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Accordion Item starts with: an empty answer. */
export const DEFAULT_PRESET: Preset = {
	name: 'accordion-item',
	title: 'Accordion Item',
	description: 'A question and its answer.',
	wpIcon: 'heading',
	props: {},
	parts: [],
};
