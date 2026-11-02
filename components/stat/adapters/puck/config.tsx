/**
 * The Stat for Puck: the frame with a slot, so its statement, detail and source are components
 * placed inside it.
 *
 * WHY the slot is passed as `innerAs`: Puck renders a slot as an element of its own. Passed as
 * the Stat's inner element, Puck's drop zone is that element, so the markup matches what the
 * Stat renders in Next, with no extra wrapper.
 */
import Stat, { PARTS } from '../../Stat.tsx';
import type { PuckComponentConfig, PuckSlot } from '../../../_config/puck.ts';

type Props = {
	content: PuckSlot;
};

const config: PuckComponentConfig< Props > = {
	label: 'Stat',
	fields: {
		content: { type: 'slot' },
	},
	defaultProps: { content: [] },
	// FIX: only the Stat's own props; Puck's `id`, `puck` and `editMode` would reach the markup.
	render: ( { content } ) => <Stat innerAs={ content } />,
};

export default config;

/**
 * What a new Stat starts with in Puck: three Paragraphs, each with the class that styles it,
 * as in WordPress (TEMPLATE in adapters/wp/edit.tsx).
 *
 * SYNC: each `type` is the key a host registers the primitive under (README: `Paragraph`).
 * WHY the source has no link here: the Paragraph primitive is plain text. In WordPress the
 * source is a core paragraph, which can hold one.
 */
export const TEMPLATE: PuckSlot = [
	{
		type: 'Paragraph',
		props: {
			content: 'Florida’s largest university, with 70,674 students',
			className: PARTS.statement,
		},
	},
	{
		type: 'Paragraph',
		props: {
			content: 'One sentence saying why the number matters.',
			className: PARTS.detail,
		},
	},
	{
		type: 'Paragraph',
		props: {
			content: 'Source: UCF Facts, fall 2025',
			className: PARTS.source,
		},
	},
];

/**
 * The Stat, starting with components already in its slot. Opt-in, as the Card's is
 * (components/card/adapters/puck/config.tsx says why).
 *
 * @param content The components a new Stat starts with, in order. TEMPLATE by default.
 */
export function withTemplate(
	content: PuckSlot = TEMPLATE
): PuckComponentConfig< Props > {
	return { ...config, defaultProps: { ...config.defaultProps, content } };
}
