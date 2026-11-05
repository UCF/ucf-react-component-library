/**
 * The Section for Puck: a band with a slot, so other components are dropped inside it and
 * take on its composition.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the Section's inner element, Puck's drop zone is that element, so the markup matches what
 * the Section renders in Next, with no extra wrapper between the band and its content.
 */
import Section from '../../Section.tsx';
import {
	COMPOSITIONS,
	type Composition,
} from '../../../../../integrations/schema/compositions.ts';
import type {
	PuckComponentConfig,
	PuckSlot,
} from '../../../../../integrations/puck/config.ts';

type Props = {
	composition: Composition;
	width: 'default' | 'constrained' | 'wide';
	spacing: 'default' | 'cozy' | 'compact';
	content: PuckSlot;
};

const config: PuckComponentConfig< Props > = {
	label: 'Section',
	fields: {
		composition: {
			type: 'select',
			label: 'Composition',
			options: COMPOSITIONS.map( ( { value, label } ) => ( {
				value,
				label,
			} ) ),
		},
		width: {
			type: 'radio',
			label: 'Content width',
			options: [
				{ value: 'default', label: 'Default' },
				{ value: 'constrained', label: 'Constrained' },
				{ value: 'wide', label: 'Wide' },
			],
		},
		spacing: {
			type: 'radio',
			label: 'Spacing',
			options: [
				{ value: 'default', label: 'Default' },
				{ value: 'cozy', label: 'Cozy' },
				{ value: 'compact', label: 'Compact' },
			],
		},
		content: { type: 'slot' },
	},
	defaultProps: {
		composition: 'light',
		width: 'default',
		spacing: 'default',
		content: [],
	},
	// FIX: only Section's own props; Puck's `id`, `puck` and `editMode` would reach the markup.
	render: ( { composition, width, spacing, content } ) => (
		<Section
			composition={ composition }
			width={ width }
			spacing={ spacing }
			innerAs={ content }
		/>
	),
};

export default config;

/**
 * What a new Section starts with in Puck: a Heading (h2) and a Paragraph, as in WordPress
 * (TEMPLATE in wp/edit.tsx).
 *
 * SYNC: each `type` is the key a host registers the primitive under (README: `Heading`,
 * `Paragraph`).
 */
export const TEMPLATE: PuckSlot = [
	{
		type: 'Heading',
		props: { content: 'Heading', level: '2', className: '' },
	},
	{
		type: 'Paragraph',
		props: { content: 'Body copy.', className: '' },
	},
];

/**
 * The Section, starting with components already in its slot. Opt-in, as the Card's is
 * (components/content/card/integrations/puck/config.tsx says why).
 *
 * @param content The components a new Section starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}
