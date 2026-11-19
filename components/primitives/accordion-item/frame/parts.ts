/**
 * The Accordion Item's parts: none. Its answer is open content.
 */
import type { PartDefinitions, PartOf } from '@/core/frame/types';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none here. */
export type Part = PartOf< typeof PARTS >;
