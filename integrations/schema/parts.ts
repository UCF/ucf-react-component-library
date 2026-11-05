/**
 * CONTEXT: what a component's parts may be. A part is one piece of content placed inside a
 * frame; a component's model declares its parts in a `PARTS` table, each with a kind (from
 * here) and the class that gives it its look:
 *
 *   PARTS = { title: { kind: 'heading', className: 'ucf-c-card__title' }, … }
 *
 * A preset then names a part and gives its kind's content: `{ part: 'title', text, level }`.
 * resolveParts() turns those into what the mappers read: each part's kind, class and content.
 * The mappers build each kind once, for every component: integrations/wp/blocks.mapper.ts
 * as core blocks, integrations/puck/primitives.mapper.ts as primitives,
 * integrations/storybook/parts.tsx as markup.
 *
 * WHY kinds here and looks in the component: a heading is `core/heading` in WordPress and the
 * Heading primitive in Puck whatever frame it is in; how a title looks is the Card's own.
 * WHY one table of looks, each with its kind: a preset names only the part, and can't put a
 * look on the wrong kind (a title class on an image). Editors still can, in WordPress: any
 * block takes any class. This shapes presets and stories, not what editors may do.
 */

/** Each kind of part, and the content a part of that kind carries. */
export type KindContent = {
	/**
	 * A fixed shape, or none to keep the image's own (a logo). `alt` when the image carries
	 * meaning; empty or absent when it is decoration. `url` when the content supplies the photo
	 * (a React site's `content`); a preset leaves it out and names only the shape.
	 */
	image: {
		aspectRatio?: '3/2' | '16/9' | '4/3' | '1/1';
		alt?: string;
		url?: string;
	};
	heading: { text: string; level: 2 | 3 | 4 };
	text: { text: string };
	/** A text link with an arrow: a paragraph with a link in WordPress. */
	link: { text: string; url: string };
	button: { text: string; url: string };
};

export type Kind = keyof KindContent;

/** One look in a component's PARTS table: its kind, and the class that styles it, if any. */
export type Look = { readonly kind: Kind; readonly className?: string };

/** A component's PARTS table. */
export type Looks = Record< string, Look >;

/**
 * A part as a preset writes it: the name of a look in `L`, and that look's kind's content.
 * `{ part: 'title', text: 'Next step', level: 3 }`.
 */
export type PartOf< L extends Looks > = {
	[ Name in keyof L & string ]: {
		part: Name;
	} & KindContent[ L[ Name ][ 'kind' ] ];
}[ keyof L & string ];

/** A part as the mappers read it: its kind, its class ('' for none) and its content. */
export type ResolvedPart = {
	[ K in Kind ]: { kind: K; className: string } & KindContent[ K ];
}[ Kind ];

/**
 * Parts as the mappers read them: each one's kind and class from the component's PARTS table.
 *
 * @param looks A component's PARTS table.
 * @param parts Parts as a preset writes them.
 */
export function resolveParts< L extends Looks >(
	looks: L,
	parts: PartOf< L >[]
): ResolvedPart[] {
	return parts.map( ( { part, ...content } ) => {
		const look = looks[ part ] as Look;
		// UPSTREAM: TypeScript can't follow a look's kind to its content through the table, so
		// the pairing PartOf guarantees is asserted here.
		return {
			kind: look.kind,
			className: look.className ?? '',
			...content,
		} as unknown as ResolvedPart;
	} );
}

/**
 * The end of a switch over every kind of part. WHY: a kind added to KindContent but not
 * handled in a switch (each mapper) is then a type error there, not a part that silently
 * renders as something else.
 *
 * @param part A part whose kind no case handled.
 */
export function unhandledPart( part: never ): never {
	throw new Error( `No case for the part ${ JSON.stringify( part ) }.` );
}
