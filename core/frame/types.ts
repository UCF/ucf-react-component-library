/**
 * Steps 3–5 · content · the types a content component is written against: its parts, its presets,
 * the props its markup gets, its definition and its port.
 *
 * Each content component's parts.ts, presets.ts and {Name}.tsx are written against
 * these.
 *
 * Types only: nothing here runs. The code that uses them is beside this file: read-parts.ts
 * (resolveParts, findPreset) and frame.tsx (frame).
 */

import type {
	ComponentPropsWithoutRef,
	ElementType,
	ReactElement,
	ReactNode,
} from 'react';

import type { PropDefinitions, PropsOf } from '../hosts/prop-definitions.ts';

// ── §1 Parts: the content a component holds ──────────────────────────────────────────────────────
//
// A part is one piece of content inside a component (a title, an eyebrow, an image). Each has a
// kind, shared by every component, and a class that gives it the component's look
// (parts.ts). A preset names a part and fills it: `{ part: 'title', text, level }`.

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
		/** Its name in the component's PARTS: `eyebrow`. */
		part: string;
		kind: KindName;
		className: string;
	} & KindContent[ KindName ];
}[ Kind ];

// ── §2 Presets: named designs ────────────────────────────────────────────────────────────────────
//
// A named mix of a component's props and parts ("Card: Pathway"). presets.ts.

/** A preset of a component with props `Props` and parts `Part`. */
export type Preset< Props, Part > = {
	/** Its key: the WordPress variation's name and withPreset()'s argument. */
	name: string;
	/** "Card: Pathway". WHY the block's name first: in a list of blocks, it says whose it is. */
	title: string;
	/** One line for the inserter. */
	description: string;
	/**
	 * Its icon in WordPress's inserter, by its name in `@wordpress/icons` (the component's
	 * hosts/wp/index.tsx looks it up): the shape of the preset where it can be.
	 */
	wpIcon: string;
	/** The props it sets; the rest keep their defaults. */
	props: Partial< Props >;
	/** Whether it has a background image. WHY a flag: WordPress must not save a sample one. */
	background?: boolean;
	/** What it starts with inside, in order. */
	parts: readonly Part[];
};

// ── §3 Your markup: the props it gets, its areas, and what a site passes ─────────────────────────

/** What a site passes for one part, by its kind. */
type ContentFor< KindName extends Kind > = KindName extends 'text' | 'heading'
	? string
	: KindName extends 'link' | 'button'
		? { text: string; url: string }
		: { url: string; alt?: string };

/** The content a site passes for a component's parts, by each part's name in its PARTS. */
export type ContentOf< Parts extends PartDefinitions > = {
	[ PartName in keyof Parts ]?: ContentFor< Parts[ PartName ][ 'kind' ] >;
};

/**
 * The HTML attributes a site may pass: a class, an id, style, `aria-*` and `data-*`.
 * WHY not every `<div>` attribute: there are about 270, and they buried the component's own props
 * in the editor's suggestions. Hosts need the rest (WordPress adds its own), so `Frame` takes them.
 */
type SiteAttributes = Pick<
	ComponentPropsWithoutRef< 'div' >,
	'className' | 'id' | 'style'
> & {
	[ attribute: `aria-${ string }` ]: string | number | boolean | undefined;
	[ attribute: `data-${ string }` ]: string | number | boolean | undefined;
};

/** Every `<div>` attribute. WHY HTML's `content` left out: ours is the parts' content. */
export type HostAttributes = Omit<
	ComponentPropsWithoutRef< 'div' >,
	'children' | 'content'
>;

/** A component's own props, its children, and the HTML attributes a site may pass. */
export type OwnProps< Props extends PropDefinitions > = Partial<
	PropsOf< Props >
> &
	SiteAttributes & {
		/** What goes in the content area. */
		children?: ReactNode;
	};

/** What the component you write gets: its own props, any HTML attribute, and `area`. */
export type FrameProps< Props extends PropDefinitions > = OwnProps< Props > &
	HostAttributes & {
		/** Where content goes: `area( 'content', { className }, children )`. */
		area: Area;
	};

/** Any component's presets, for a component with props `Props` and parts `Parts`. */
export type PresetsOf<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
> = readonly Preset< PropsOf< Props >, PartOf< Parts > >[];

/** The names of the parts a preset holds: `pathway` → `'eyebrow' | 'display' | …`. */
type PartsIn< Presets extends readonly { name: string }[], Name > =
	Extract< Presets[ number ], { name: Name } > extends {
		parts: readonly ( infer Part )[];
	}
		? Part extends { part: infer PartName }
			? PartName
			: never
		: never;

/**
 * What the component takes besides its props: a preset to start from, and its parts' content.
 * `Name` is the preset passed, so `content` takes only the parts that preset holds.
 */
export type PresetProps<
	Parts extends PartDefinitions,
	Presets extends readonly { name: string }[] = readonly { name: string }[],
	Name extends string = Presets[ number ][ 'name' ],
> = {
	/** A preset's name in the component's presets: its props and parts are the start. */
	preset?: Name;
	/**
	 * Each of the preset's parts' content, by name. A part left out isn't shown.
	 * WHY nothing without a preset: there are no parts to fill; pass `children`.
	 */
	content?: [ Name ] extends [ never ]
		? undefined
		: ContentOf< Pick< Parts, PartsIn< Presets, Name > & keyof Parts > >;
	/**
	 * Show the preset's sample text and image for parts with no content, and a sample background image
	 * where it has one.
	 */
	sample?: boolean;
};

/** The elements a host fills a component's areas with, by area name. */
export type Areas = Partial< Record< string, ElementType > >;

/**
 * An area: where content goes in the markup. A host's element takes the same props.
 *
 * @param name     Its name. Hosts fill the one named `content` with their editable content.
 * @param props    Its element's props: `className`, and `as`, the element on a React site (a
 *                 `<div>` by default; the Hero's image area is an `<Image>`).
 * @param children What a React site puts there.
 */
export type Area = ( (
	name: string,
	props: { as?: ElementType; className?: string; [ prop: string ]: unknown },
	children?: ReactNode
) => ReactElement ) & {
	/**
	 * Whether a host fills the area: the Hero shows its image frame while WordPress's picker is
	 * in it, before an image is chosen.
	 *
	 * @param name The area's name.
	 */
	hosted: ( name: string ) => boolean;
};

// ── §4 The definition: what frame() takes, as data ───────────────────────────────────────────────
//
// frame() takes it with the markup and hands it to hosts as the component's port.
// WHY data only: WordPress's code must never reach the npm package, nor Puck's the plugins; this
// is safe to import anywhere.

export type ComponentDefinition<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	// WHY its own parameter: kept exact (`as const`), the presets type the names and content a
	// site may pass (frame.tsx).
	Presets extends readonly Preset< PropsOf< Props >, PartOf< Parts > >[] =
		readonly Preset< PropsOf< Props >, PartOf< Parts > >[],
> = {
	// Who it is

	/** Its machine name: its folder, its block's name, its package path (`card`). */
	slug: string;
	/** Its name on screen: the inserter, Puck, Storybook. SYNC: block.json's `title`. */
	title: string;
	/**
	 * Content (saved as HTML), live (written by the server on each request) or interactive
	 * (built in the browser): its bucket. SYNC: Kind in core/hosts/wordpress/kind.ts. Or primitive:
	 * a piece Puck and React sites place, with no WordPress block of its own (the Columns);
	 * WordPress editors use core's equivalent (docs/architecture.md, "Primitives").
	 */
	kind: 'content' | 'live' | 'interactive' | 'primitive';

	// What it takes

	/** props.ts */
	props: Props;
	/** parts.ts */
	parts: Parts;
	/** presets.ts */
	presets: Presets;
	/** The preset a new one starts with. */
	defaultPreset: Preset< PropsOf< Props >, PartOf< Parts > >;

	// WordPress only

	/** Its icon in the inserter, by its name in core/hosts/wordpress/icons.ts. */
	wpIcon: string;
};

// ── §5 The port: what a host reads ───────────────────────────────────────────────────────────────

/** What a host reads: the definition, and the markup with its areas open. */
export type Port<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	Presets extends PresetsOf< Props, Parts > = PresetsOf< Props, Parts >,
> = ComponentDefinition< Props, Parts, Presets > & {
	Frame: (
		props: OwnProps< Props > & HostAttributes & { areas?: Areas }
	) => ReactElement;
};

/** Anything with a port: what the translators take (wp/block.tsx, puck/config.tsx). */
export type Ported<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
> = { port: Port< Props, Parts > };
