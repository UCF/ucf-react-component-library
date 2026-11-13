/**
 * The Columns's presets: none. Its distributions are a setting, not designs to pick from.
 */
import type { Part } from './Columns.parts.ts';
import type { ColumnsEditableProps } from './Columns.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< ColumnsEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Columns starts with: empty, for Column primitives to go in. */
export const DEFAULT_PRESET: Preset = {
	name: 'columns',
	title: 'Columns',
	description: 'Two to four columns on a 12-column grid.',
	wpIcon: 'columns',
	props: {},
	parts: [],
};
