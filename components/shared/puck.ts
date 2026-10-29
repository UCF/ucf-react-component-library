/**
 * CONTEXT: the shape of a Puck component config, written out here so the library does not
 * depend on Puck.
 *
 * A Puck site imports a component's config (`@ucf/components/stat/puck`) and adds it to its
 * own `config.components`. Puck stores the props as JSON and calls `render` on every request,
 * so a Puck host has none of WordPress's saved-markup limits.
 *
 * UPSTREAM: follows `@puckeditor/core`'s `ComponentConfig` (0.24) for the parts used here.
 * Puck needs a field for every prop and complete `defaultProps`. shared/puck.test.tsx checks
 * every config against the real Puck types, so a change in Puck fails `npm run typecheck`.
 */
import type { ReactElement } from 'react';

type Option = { label: string; value: string };

export type PuckField =
	| { type: 'text' | 'textarea'; label?: string }
	| { type: 'select' | 'radio'; label?: string; options: Option[] };

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
	render: ( props: Props & PuckRenderProps ) => ReactElement;
};
