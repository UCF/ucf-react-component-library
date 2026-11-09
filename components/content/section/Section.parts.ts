/**
 * The Section's parts: what a new one starts with. It holds anything; these have no look of their
 * own, so no class.
 */
import type { PartDefinitions, PartOf } from '#integrations/schema/parts.js';

export const PARTS = {
	/** The band's heading, an h2: a Section is a band of the page, under its h1. */
	heading: { kind: 'heading' },
	/** Body copy. */
	body: { kind: 'text' },
} as const satisfies PartDefinitions;

/** A part in a preset: `{ part: 'heading', level: 2, text }`. */
export type Part = PartOf< typeof PARTS >;
