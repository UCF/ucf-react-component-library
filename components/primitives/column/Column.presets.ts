/**
 * The Column's presets: none. A Column holds anything, so it has no designs to pick from.
 */
import type { Part } from './Column.parts.ts';
import type { ColumnEditableProps } from './Column.props.ts';
import type { Preset as PresetOf } from '@/integrations/schema/presets';

export type Preset = PresetOf< ColumnEditableProps, Part >;

export const PRESETS = [] as const satisfies readonly Preset[];

/** What a new Column starts with: empty. */
export const DEFAULT_PRESET: Preset = {
	name: 'column',
	title: 'Column',
	description: 'One column of a Columns.',
	wpIcon: 'column',
	props: {},
	parts: [],
};
