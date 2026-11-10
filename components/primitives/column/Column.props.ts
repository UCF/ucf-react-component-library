/**
 * The Column's props: none. A Column is a track of its Columns; the Columns decides how wide.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';

export const PROPS = {} as const satisfies PropDefinitions;

/** The props above, typed: none. */
export type ColumnEditableProps = PropsOf< typeof PROPS >;
