/**
 * Definition: everything a component is, in one object.
 *
 * Each environment reads it: wp/block.tsx, puck/config.tsx, react/component.tsx.
 * WHY one reader per environment: WordPress's code must never reach the npm package, nor Puck's the
 * plugins; the definition is safe to import anywhere.
 */

import type { ComponentType } from 'react';

import type { PartDefinitions, PartOf } from './parts.ts';
import type { Preset } from './presets.ts';
import type { PropDefinitions, PropsOf } from './props.ts';

export type ComponentDefinition<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	// WHY `any` by default: a translator takes any component; each definition keeps its own.
	ComponentProps = any,
> = {
	// Who it is

	/** Its machine name: its folder, its block's name, its package path (`card`). */
	slug: string;
	/** Its name on screen: the inserter, Puck, Storybook. SYNC: block.json's `title`. */
	title: string;
	/** Content (saved as HTML) or interactive (built in the browser): its bucket. */
	kind: 'content' | 'interactive';

	// What it renders and takes

	/** The React component: the frame. It takes its props, and `className`, `children`. */
	component: ComponentType< ComponentProps >;
	/** {Name}.props.ts */
	props: Props;
	/** {Name}.parts.ts */
	parts: Parts;
	/** {Name}.presets.ts */
	presets: readonly Preset< PropsOf< Props >, PartOf< Parts > >[];
	/** The preset a new one starts with. */
	defaultPreset: Preset< PropsOf< Props >, PartOf< Parts > >;

	// WordPress only

	/** Its icon in the inserter, by its name in integrations/wp/icons.ts. */
	wpIcon: string;
};

/**
 * A component's definition, with each piece's exact types kept.
 *
 * @param definition Everything the component is.
 */
export const defineComponent = <
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	ComponentProps,
>(
	definition: ComponentDefinition< Props, Parts, ComponentProps >
) => definition;
