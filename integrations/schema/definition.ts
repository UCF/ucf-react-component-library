/**
 * Definition: what a component is, as data.
 *
 * frame() takes it with the markup (integrations/react/frame.tsx), and hands it to hosts as the
 * component's port: wp/block.tsx and puck/config.tsx read it there.
 * WHY data only: WordPress's code must never reach the npm package, nor Puck's the plugins; this
 * is safe to import anywhere.
 */

import type { PartDefinitions, PartOf } from './parts.ts';
import type { Preset } from './presets.ts';
import type { PropDefinitions, PropsOf } from './props.ts';

export type ComponentDefinition<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
	// WHY its own parameter: kept exact (`as const`), the presets type the names and content a
	// site may pass (react/frame.tsx).
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
	 * (built in the browser): its bucket. SYNC: Kind in integrations/wp/kind.ts. Or primitive:
	 * a piece Puck and React sites place, with no WordPress block of its own (the Columns);
	 * WordPress editors use core's equivalent (docs/architecture.md, "Primitives").
	 */
	kind: 'content' | 'live' | 'interactive' | 'primitive';

	// What it takes

	/** {Name}.props.ts */
	props: Props;
	/** {Name}.parts.ts */
	parts: Parts;
	/** {Name}.presets.ts */
	presets: Presets;
	/** The preset a new one starts with. */
	defaultPreset: Preset< PropsOf< Props >, PartOf< Parts > >;

	// WordPress only

	/** Its icon in the inserter, by its name in integrations/wp/icons.ts. */
	wpIcon: string;
};
