/**
 * The Accordion's parts: none. It holds Accordion Items, which hold the questions and answers.
 */
import type { PartDefinitions, PartOf } from '@/integrations/schema/parts';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none here. */
export type Part = PartOf< typeof PARTS >;
