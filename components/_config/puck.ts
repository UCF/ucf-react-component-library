/**
 * CONTEXT: the shape of a Puck component config, written out here so the library does not
 * depend on Puck.
 *
 * A Puck site imports a component's config (`@ucf/components/stat/puck`) and adds it to its
 * own `config.components`. Puck stores the props as JSON and calls `render` on every request,
 * so a Puck host has none of WordPress's saved-markup limits.
 *
 * UPSTREAM: follows `@puckeditor/core`'s `ComponentConfig` (0.24) for the parts used here.
 * Puck needs a field for every prop and complete `defaultProps`. _config/puck.test.tsx checks
 * every config against the real Puck types, so a change in Puck fails `npm run typecheck`.
 */
import type { ElementType, ReactElement } from 'react';

type Option = { label: string; value: string };

export type PuckField =
	| { type: 'text' | 'textarea'; label?: string }
	| { type: 'select' | 'radio'; label?: string; options: Option[] }
	| { type: 'slot'; label?: string; allow?: string[] };

/**
 * A slot prop as Puck stores it: the components dropped into it. `render` receives a
 * component that draws them instead (PuckRenderInput).
 *
 * SYNC: `Slot` in `@puckeditor/core`. Puck turns a prop into a slot only when its type matches
 * Puck's own, which _config/puck.test.tsx checks.
 */
export type PuckSlot = {
	type: string;
	props: { id?: string; [ key: string ]: unknown };
}[];

/** The props `render` gets: each slot prop arrives as a component that draws its contents. */
export type PuckRenderInput< Props > = {
	[ Key in keyof Props ]: Props[ Key ] extends PuckSlot
		? ElementType
		: Props[ Key ];
};

/**
 * What Puck passes to `render` besides the component's own props.
 *
 * WHY listed: `render` must not hand these to the component. A component that spreads its
 * other props onto its root element (Stat does) would put them in the markup.
 */
export type PuckRenderProps = {
	id?: string;
	puck?: unknown;
	editMode?: boolean;
};

export type PuckComponentConfig< Props > = {
	label?: string;
	fields: { [ Key in keyof Props ]: PuckField };
	defaultProps: Props;
	render: (
		props: PuckRenderInput< Props > & PuckRenderProps
	) => ReactElement;
};
