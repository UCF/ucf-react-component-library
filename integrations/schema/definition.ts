/**
 * CONTEXT: a component's definition (`{Name}.definition.ts`): everything the component is, in one
 * object. Each environment's translator reads it and produces that environment's integration:
 *
 *   integrations/react/with-presets.tsx  presetComponent( definition )  → <Card preset content />
 *   integrations/puck/translate.tsx      puckConfig( definition )       → Puck's config
 *   integrations/wp/register.tsx         registerComponent( definition ) → the WordPress block
 *
 * WHY one definition and one translator per environment, not one file that translates for
 * every environment: the definition is plain data and a React component, safe to import
 * anywhere; WordPress's code must never reach the npm package, nor Puck's the plugins. Each
 * translator is the one place that knows its environment, written once for every component.
 */
import type { ComponentType } from 'react';

import type { Looks, PartOf } from './parts.ts';
import type { Preset } from './presets.ts';
import type { PropDefinitions, PropsOf } from './props.ts';

export type ComponentDefinition<
	Definitions extends PropDefinitions,
	L extends Looks,
	// WHY `any` by default: a translator that takes any definition passes the props its
	// environment stores; a component's own definition keeps its component's exact props.
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
	props: Definitions;
	/** {Name}.parts.ts */
	parts: L;
	/** {Name}.presets.ts */
	presets: readonly Preset< PropsOf< Definitions >, PartOf< L > >[];
	/** The preset a new one starts with. */
	defaultPreset: Preset< PropsOf< Definitions >, PartOf< L > >;

	// WordPress only

	/** Its icon in the inserter, by its name in integrations/wp/icons.ts. */
	wpIcon: string;
};

/**
 * A component's definition, checked: TypeScript keeps each piece's exact types for the
 * translators.
 *
 * @param definition Everything the component is.
 */
export const defineComponent = <
	Definitions extends PropDefinitions,
	L extends Looks,
	ComponentProps,
>(
	definition: ComponentDefinition< Definitions, L, ComponentProps >
) => definition;
