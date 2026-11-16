/**
 * The Section Nav's parts: none. Its links are a prop, not content an editor places inside it.
 */
import type { PartDefinitions, PartOf } from '@/integrations/schema/parts';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none. */
export type Part = PartOf< typeof PARTS >;
