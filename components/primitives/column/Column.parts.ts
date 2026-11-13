/**
 * The Column's parts: none. It holds anything.
 */
import type { PartDefinitions, PartOf } from '@/integrations/schema/parts';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none here. */
export type Part = PartOf< typeof PARTS >;
