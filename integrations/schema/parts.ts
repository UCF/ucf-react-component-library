/**
 * Parts: the content a component holds.
 *
 * A part is one piece of content inside a component (a title, an eyebrow, an image). Each has a
 * kind, shared by every component (below), and a class that gives it the component's look
 * ({Name}.parts.ts). A preset names a part and fills it: `{ part: 'title', text, level }`.
 */

// ── Kinds ──────────────────────────────────────────────────────────────────────────────────────
//
// What a part can be, and the content each kind carries. Shared by every component.

/** Each kind of part, and the content it carries. */
export type KindContent = {
	/** No `aspectRatio` keeps the image's own shape (a logo). `url` comes from a site's content. */
	image: {
		aspectRatio?: '3/2' | '16/9' | '4/3' | '1/1';
		alt?: string;
		url?: string;
	};
	/** `level: 1` only where the part opens the page (the Hero's title). */
	heading: { text: string; level: 1 | 2 | 3 | 4 };
	text: { text: string };
	/** A text link with an arrow. */
	link: { text: string; url: string };
	/** `outline`: the secondary button, core Button's Outline style. */
	button: { text: string; url: string; outline?: boolean };
};

export type Kind = keyof KindContent;

// ── A component's parts ────────────────────────────────────────────────────────────────────────
//
// Each component's PARTS, and a part as its presets write it.

/** One part: its kind, and the class that styles it. */
export type PartDefinition = {
	readonly kind: Kind;
	readonly className?: string;
};

/** A component's PARTS. */
export type PartDefinitions = Record< string, PartDefinition >;

/** A part as a preset writes it: `{ part: 'title', text: 'Next step', level: 3 }`. */
export type PartOf< Parts extends PartDefinitions > = {
	[ PartName in keyof Parts & string ]: {
		part: PartName;
	} & KindContent[ Parts[ PartName ][ 'kind' ] ];
}[ keyof Parts & string ];

/** A part as each environment's parts.ts reads it: kind, class ('' for none) and content. */
export type ResolvedPart = {
	[ KindName in Kind ]: {
		kind: KindName;
		className: string;
	} & KindContent[ KindName ];
}[ Kind ];

// ── Reading parts ──────────────────────────────────────────────────────────────────────────────
//
// What each environment's parts.ts calls.

/**
 * Parts with their kind and class looked up, for each environment's parts.ts.
 *
 * @param partDefinitions A component's PARTS.
 * @param parts           A preset's parts.
 */
export function resolveParts< Parts extends PartDefinitions >(
	partDefinitions: Parts,
	parts: readonly PartOf< Parts >[]
): ResolvedPart[] {
	return parts.map( ( { part, ...content } ) => {
		const definition = partDefinitions[ part ] as PartDefinition;
		// UPSTREAM: TypeScript can't follow a look's kind to its content through the table.
		return {
			kind: definition.kind,
			className: definition.className ?? '',
			...content,
		} as unknown as ResolvedPart;
	} );
}

/**
 * The end of a switch over every kind. WHY: a new kind no case handles is then a type error.
 *
 * @param part A part no case handled.
 */
export function unhandledPart( part: never ): never {
	throw new Error( `No case for the part ${ JSON.stringify( part ) }.` );
}
