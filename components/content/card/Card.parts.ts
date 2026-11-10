/**
 * The Card's parts: what goes inside it, each with its kind and the class that styles it.
 * SYNC: style.css styles every class here; tests/Card.test.tsx checks.
 */
import type { PartDefinitions, PartOf } from '@/integrations/schema/parts';

export const PARTS = {
	/** A photo or illustration across the card. */
	image: { kind: 'image' },
	/** A label pinned to the corner of a card with a background: "Engineering". */
	tag: { kind: 'text', className: 'ucf-c-card__tag' },
	/** A short line in the accent above the title: "First-year". */
	eyebrow: { kind: 'text', className: 'ucf-c-card__eyebrow' },
	/** Category and date: "News · Sept. 18, 2026". */
	meta: { kind: 'text', className: 'ucf-c-card__meta' },
	/** The title, sans bold. */
	title: { kind: 'heading', className: 'ucf-c-card__title' },
	/** The title in display capitals. WHY not "heading": that's the kind. */
	display: { kind: 'heading', className: 'ucf-c-card__heading' },
	/** A short name in sans bold capitals: "Freshman". */
	label: { kind: 'heading', className: 'ucf-c-card__label' },
	/** One or two sentences. */
	description: { kind: 'text', className: 'ucf-c-card__description' },
	/** A text link with an arrow: "First-year admission →". */
	link: { kind: 'link', className: 'ucf-c-card__link' },
	/** A call to action. */
	button: { kind: 'button' },
} as const satisfies PartDefinitions;

/** A part in a preset: `{ part: 'eyebrow', text: 'First-year' }`. */
export type Part = PartOf< typeof PARTS >;
