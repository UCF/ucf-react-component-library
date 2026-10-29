/**
 * CONTEXT: the shape of a Puck component config, written out here so the library does not
 * depend on Puck.
 *
 * A Puck site imports a component's config (`@ucf/components/stat/puck`) and adds it to its
 * own `config.components`. Puck stores the props as JSON and calls `render` on every request,
 * so a Puck host has none of WordPress's saved-markup limits.
 *
 * UPSTREAM: follows `@measured/puck`'s `ComponentConfig` (0.20) for the parts used here. Nothing
 * runs these configs against Puck yet, so a mismatch would only show up in a Puck site. A Puck
 * playground that renders every config is on the to-do list (docs/todo.md).
 */
import type { ReactElement } from 'react';

type Option = { label: string; value: string };

export type PuckField =
	| { type: 'text' | 'textarea'; label?: string }
	| { type: 'select' | 'radio'; label?: string; options: Option[] };

export type PuckComponentConfig< Props > = {
	label?: string;
	fields: { [ Key in keyof Props ]?: PuckField };
	defaultProps?: Partial< Props >;
	render: ( props: Props ) => ReactElement;
};
