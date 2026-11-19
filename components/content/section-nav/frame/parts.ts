/** CONTEXT: the Section Nav's parts: none. Its links are a prop. */
import type { PartDefinitions, PartOf } from '@/core/frame/types';

export const PARTS = {} as const satisfies PartDefinitions;

/** A part in a preset: none. */
export type Part = PartOf< typeof PARTS >;
