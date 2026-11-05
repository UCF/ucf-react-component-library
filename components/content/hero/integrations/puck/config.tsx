/**
 * The Hero for Puck: P1's layout and image settings (less those this port leaves out, Hero.tsx),
 * with the copy as a slot.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the Hero's copy element, Puck's drop zone is that element, so the markup matches what the
 * Hero renders in Next, with no extra wrapper.
 */
import Hero, { PARTS, type HeroProps } from '../../Hero.tsx';
import example from '../../example.json' with { type: 'json' };
import { CHOICES, TEXTS, type ChoiceKey } from '../../options.ts';
import type {
	PuckComponentConfig,
	PuckScalarField,
	PuckSlot,
} from '../../../../../integrations/puck/types.ts';

type Props = {
	[ Key in keyof typeof example ]: ( typeof example )[ Key ];
} & { content: PuckSlot };

const choice = ( key: ChoiceKey ): PuckScalarField => {
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
		content: { type: 'slot' },
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
		height: choice( 'height' ),
	},
	defaultProps: { ...example, content: [] },
	// FIX: only the Hero's own props. Puck's `id`, `puck` and `editMode` would reach the markup
	// (see PuckRenderProps in integrations/puck/types.ts).
	render: ( { id, puck, editMode, content, ...props } ) => (
		<Hero { ...( props as HeroProps ) } innerAs={ content } />
	),
};

export default config;

/**
 * What a new Hero's copy starts with in Puck: P1's eyebrow, title, description and two
 * buttons, as in WordPress (TEMPLATE in wp/edit.tsx), from the library's primitives.
 *
 * SYNC: each `type` is the key a host registers the primitive under (README: `Heading`,
 * `Paragraph`, `Button`).
 * WHY the buttons stack in Puck: there is no Buttons group primitive yet to set them in a row
 * (docs/todo.md); in WordPress, core's Buttons does.
 */
export const TEMPLATE: PuckSlot = [
	{
		type: 'Paragraph',
		props: {
			content: 'Undergraduate admissions',
			className: PARTS.eyebrow,
		},
	},
	{
		type: 'Heading',
		props: {
			content: 'Reach for the stars',
			level: '1',
			className: PARTS.title,
		},
	},
	{
		type: 'Paragraph',
		props: {
			content:
				'Florida’s largest university, with 70,674 students, in Orlando and online.',
			className: PARTS.description,
		},
	},
	{
		type: 'Button',
		props: {
			text: 'Apply now',
			url: '#',
			linkTarget: '',
			variant: 'fill',
			fontSize: '',
			className: '',
		},
	},
	{
		type: 'Button',
		props: {
			text: 'Visit campus',
			url: '#',
			linkTarget: '',
			variant: 'outline',
			fontSize: '',
			className: '',
		},
	},
];

/**
 * The Hero, starting with its copy already in its slot. Opt-in, as the Card's is
 * (components/content/card/integrations/puck/config.tsx says why).
 *
 * @param content The components a new Hero starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}
