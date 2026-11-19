/**
 * The Accordion's props: none yet. Core Accordion's `autoclose`, `showIcon`, `iconPosition` and
 * `headingLevel` are in docs/todo.md; each item sets its own heading level.
 */
import type { PropDefinitions, PropsOf } from '@/core/hosts/prop-definitions';

export const PROPS = {} as const satisfies PropDefinitions;

/** The props above, typed: none. */
export type AccordionEditableProps = PropsOf< typeof PROPS >;
