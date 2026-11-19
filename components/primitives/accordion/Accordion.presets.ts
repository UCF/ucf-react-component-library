/**
 * The Accordion's presets: none. It has one design.
 */
import type { Part } from './Accordion.parts.ts';
import type { AccordionEditableProps } from './Accordion.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< AccordionEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Accordion starts with: empty, for Accordion Items to go in. */
export const DEFAULT_PRESET: Preset = {
	name: 'accordion',
	title: 'Accordion',
	description: 'Questions that open to show their answers.',
	wpIcon: 'list-view',
	props: {},
	parts: [],
};
