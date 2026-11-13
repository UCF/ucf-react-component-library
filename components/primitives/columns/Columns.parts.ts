/**
 * The Columns's parts: none. It holds Column primitives, which hold anything; it has no parts of
 * its own to fill.
 */
import type { PartDefinitions, PartOf } from '@/integrations/schema/parts';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none here. */
export type Part = PartOf< typeof PARTS >;
