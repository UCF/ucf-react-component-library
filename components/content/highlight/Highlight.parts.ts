/**
 * The Highlight's parts: the content placed inside it. Each part is a look (a statement, a
 * figure, a source) with its kind (text, an image: integrations/schema/parts.ts) and the class
 * that styles it here. Frames style their content by class (docs/architecture.md, "Frames");
 * the shared mappers in integrations/ build each kind for each host.
 *
 * The Highlight's own settings are in Highlight.props.ts; named combinations of both, in
 * Highlight.presets.ts.
 *
 * SYNC: style.css styles every class here; tests/Highlight.test.tsx checks.
 */
import type {
	PartDefinitions,
	PartOf,
} from '../../../integrations/schema/parts.ts';

/**
 * The Highlight's parts: each look, its kind and the class that styles it. A preset names a part
 * by its key here: `{ part: 'statement', text }`.
 */
export const PARTS = {
	/** A fact as a full sentence, in display capitals. */
	statement: { kind: 'text', className: 'ucf-c-highlight__statement' },
	/** A short value set very large: "Nov 1", "003954", "No. 1". */
	figure: { kind: 'text', className: 'ucf-c-highlight__figure' },
	/** What the figure is, in sans bold: "Early action deadline". */
	label: { kind: 'text', className: 'ucf-c-highlight__label' },
	/** One sentence saying why it matters. */
	detail: { kind: 'text', className: 'ucf-c-highlight__detail' },
	/** Where it comes from, in the data voice: "Source: UCF Facts, fall 2025". */
	source: { kind: 'text', className: 'ucf-c-highlight__source' },
	/** Where it comes from, as a short italic credit: "(Aviation Week)". */
	citation: { kind: 'text', className: 'ucf-c-highlight__citation' },
	/**
	 * A logo or badge in place of a figure: NASA's, a ranking's. An image with no fixed shape,
	 * so it keeps its own.
	 */
	logo: { kind: 'image', className: 'ucf-c-highlight__logo' },
} as const satisfies PartDefinitions;

/** A part as a preset writes it: `{ part: 'figure', text: 'Nov 1' }`. */
export type Part = PartOf< typeof PARTS >;
