/**
 * The Card's definition: everything the Card is. The WordPress block, the Puck config and the
 * Card a React site imports are all made from it (integrations/schema/definition.ts).
 */
import { defineComponent } from '../../../integrations/schema/definition.ts';
import Card from './Card.tsx';
import { PARTS } from './Card.parts.ts';
import { DEFAULT_PRESET, PRESETS } from './Card.presets.ts';
import { PROPS } from './Card.props.ts';

export const card = defineComponent( {
	// Who it is
	slug: 'card',
	title: 'Card', // SYNC: block.json's title
	kind: 'content',

	// What it renders and takes
	component: Card,
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,

	// WordPress only
	wpIcon: 'postFeaturedImage',
} );
