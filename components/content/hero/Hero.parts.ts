/**
 * The Hero's parts: its copy, each with the class that styles it.
 * SYNC: style.css styles every class here.
 */
import type {
	PartDefinitions,
	PartOf,
} from '../../../integrations/schema/parts.ts';

export const PARTS = {
	/** A short line above the title: "Undergraduate admissions". */
	eyebrow: { kind: 'text', className: 'ucf-c-hero__eyebrow' },
	/** The page's title, an h1: a Hero opens the page. */
	title: { kind: 'heading', className: 'ucf-c-hero__title' },
	/** One or two sentences. */
	description: { kind: 'text', className: 'ucf-c-hero__description' },
	/** The main call to action. */
	button: { kind: 'button' },
	/** The second, in core Button's Outline style. */
	secondaryButton: { kind: 'button' },
} as const satisfies PartDefinitions;

/** A part in a preset: `{ part: 'title', level: 1, text }`. */
export type Part = PartOf< typeof PARTS >;
