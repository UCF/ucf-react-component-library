/** CONTEXT: the Quick Links' parts: none. Its tiles are a prop. */
import type { PartDefinitions, PartOf } from '@/core/frame/types';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none. */
export type Part = PartOf< typeof PARTS >;
