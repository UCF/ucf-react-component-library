/**
 * The Card for Puck: the box with a slot, so other components are dropped inside it.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the frame's inner element, Puck's drop zone is that element, so the markup matches what the
 * frame renders in Next, with no extra wrapper.
 */
import imageExample from '#primitives/image/example.json' with { type: 'json' };
import FlexibleCard from '../../FlexibleCard.tsx';
import { VARIANTS, type Variant } from '../../options.ts';
import type {
	PuckComponentConfig,
	PuckSlot,
} from '#integrations/puck/types.js';

type Props = {
	variant: Variant;
	content: PuckSlot;
};

const config: PuckComponentConfig< Props > = {
	label: 'Flexible card (example)',
	fields: {
		variant: {
			type: 'radio',
			label: VARIANTS.label,
			options: VARIANTS.options.map( ( option ) => ( { ...option } ) ),
		},
		content: { type: 'slot' },
	},
	defaultProps: { variant: 'boxed', content: [] },
	// FIX: only the frame's own props; Puck's `id`, `puck` and `editMode` would reach the markup.
	render: ( { variant, content } ) => (
		<FlexibleCard variant={ variant } innerAs={ content } />
	),
};

export default config;

/**
 * What a new Card starts with in Puck: an image, a heading and a paragraph, as in
 * WordPress (TEMPLATE in wp/edit.tsx), built from the library's own primitives.
 *
 * SYNC: the `type` of each item is the key a host registers that primitive under. These are
 * the names the README gives: `Image`, `Heading`, `Paragraph`. A host that uses others passes
 * its own template to withTemplate().
 * WHY the h3: a card sits under its section's h2.
 */
export const TEMPLATE: PuckSlot = [
	{ type: 'Image', props: { ...imageExample, aspectRatio: '3/2' } },
	{ type: 'Heading', props: { content: 'Title', level: '3', className: '' } },
	{
		type: 'Paragraph',
		props: {
			content: 'One or two sentences about what this card holds.',
			className: '',
		},
	},
];

/**
 * The Card, starting with components already in its slot.
 *
 * WHY the plain config starts empty and this is opt-in: a slot names its contents by the keys
 * the host registered them under, and a host that hasn't registered the primitives would get
 * items Puck can't draw. Puck gives each item an id when the frame is inserted, so the
 * template needs none.
 * WHY a starting point, not a lock: as in WordPress, editors may change, move or remove it.
 *
 * @param content The components a new Card starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}
