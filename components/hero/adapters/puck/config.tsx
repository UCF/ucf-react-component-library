/**
 * The Hero for Puck: P1's Hero fields, less the settings this port leaves out (Hero.tsx).
 *
 * WHY the copy fields are plain text fields: P1 edits them in place on the canvas
 * (`contentEditable`, a Puck 0.21 feature this library's Puck types don't describe yet).
 */
import Hero, { type HeroProps } from '../../Hero.tsx';
import example from '../../example.json' with { type: 'json' };
import { CHOICES, TEXTS, type ChoiceKey } from '../../options.ts';
import type { PuckComponentConfig, PuckField } from '../../../_config/puck.ts';

type Props = { [ Key in keyof typeof example ]: ( typeof example )[ Key ] };

const choice = ( key: ChoiceKey ): PuckField => {
	const { label, control, options } = CHOICES[ key ];
	return {
		type: control,
		label,
		options: options.map( ( { value, label: text } ) => ( {
			value,
			label: text,
		} ) ),
	};
};

const config: PuckComponentConfig< Props > = {
	label: 'Hero',
	fields: {
		eyebrow: { type: 'text', label: TEXTS.eyebrow },
		title: { type: 'text', label: TEXTS.title },
		description: { type: 'textarea', label: TEXTS.description },
		primaryLabel: { type: 'text', label: TEXTS.primaryLabel },
		secondaryLabel: { type: 'text', label: TEXTS.secondaryLabel },
		primaryHref: { type: 'text', label: TEXTS.primaryHref },
		primaryTarget: choice( 'primaryTarget' ),
		secondaryHref: { type: 'text', label: TEXTS.secondaryHref },
		secondaryTarget: choice( 'secondaryTarget' ),
		imageSrc: { type: 'text', label: TEXTS.imageSrc },
		imageAlt: { type: 'text', label: TEXTS.imageAlt },
		tone: choice( 'tone' ),
		layout: choice( 'layout' ),
		imageSide: choice( 'imageSide' ),
		imageFill: choice( 'imageFill' ),
		splitRatio: choice( 'splitRatio' ),
		contentAlign: choice( 'contentAlign' ),
		overlay: choice( 'overlay' ),
		overlayStrength: choice( 'overlayStrength' ),
		badges: choice( 'badges' ),
		badgeItems: {
			type: 'array',
			label: 'Badge items',
			arrayFields: { text: { type: 'text', label: 'Text' } },
			defaultItemProps: { text: 'Badge' },
		},
		height: choice( 'height' ),
	},
	defaultProps: example,
	// FIX: only the Hero's own props. Puck's `id`, `puck` and `editMode` would reach the markup
	// (see PuckRenderProps in _config/puck.ts).
	render: ( { id, puck, editMode, ...props } ) => (
		<Hero { ...( props as HeroProps ) } />
	),
};

export default config;
