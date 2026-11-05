/**
 * CONTEXT: the Highlight's presets: named combinations of its props (Highlight.props.ts) and the
 * parts placed inside it (Highlight.parts.ts), as data every host reads. WordPress registers
 * each as a block variation (integrations/wp/index.tsx), Puck as a component of its own
 * (withPreset() in integrations/puck/config.tsx), and integrations/storybook renders them. A
 * new Highlight starts with DEFAULT_PRESET's parts. As the Card's (card/Card.presets.ts).
 *
 * SPEC: the presets are UCF's highlight designs, from its current pages: the stats band, the
 * admissions key figures, the careers bracket, the engineering side rule and the centered
 * space-band highlights.
 */
import type { Part } from './Highlight.parts.ts';
import type { HighlightEditableProps } from './Highlight.props.ts';
import {
	findPreset,
	type Preset as PresetOf,
} from '../../../integrations/schema/presets.ts';

export type Preset = PresetOf< HighlightEditableProps, Part >;

export const PRESETS: Preset[] = [
	{
		name: 'statement',
		title: 'Highlight: Statement',
		description:
			'A fact as a full sentence, why it matters, and its source.',
		wpIcon: 'sidesTop',
		props: { rule: 'top' },
		parts: [
			{
				part: 'statement',
				text: 'Florida’s largest university, with 70,674 students',
			},
			{
				part: 'detail',
				text: 'More students than any other university in the state.',
			},
			{
				part: 'source',
				text: 'Source: UCF Facts, fall 2025',
			},
		],
	},
	{
		name: 'key-figure',
		title: 'Highlight: Key figure',
		description:
			'A date, code or number set large, what it is, and its source.',
		wpIcon: 'chartBar',
		props: { rule: 'top' },
		parts: [
			{ part: 'figure', text: 'Nov 1' },
			{ part: 'label', text: 'Early action deadline' },
			{
				part: 'source',
				text: 'UCF Undergraduate Admissions',
			},
		],
	},
	{
		name: 'bracket',
		title: 'Highlight: Bracket',
		description: 'A statement and its detail inside an accent bracket.',
		wpIcon: 'cornerTopLeft',
		props: { rule: 'corner' },
		parts: [
			{ part: 'statement', text: '375+ companies' },
			{
				part: 'detail',
				text: 'Recruit Knights for internships and jobs at expo events held by UCF Career Services.',
			},
		],
	},
	{
		name: 'side-rule',
		title: 'Highlight: Side rule',
		description:
			'A statement beside an accent rule, its detail, and a short credit.',
		wpIcon: 'sidesLeft',
		props: { rule: 'side' },
		parts: [
			{
				part: 'statement',
				text: '1 in 4 of Florida’s engineering graduates come from UCF',
			},
			{
				part: 'detail',
				text: 'Making UCF the driving force behind the state’s tech and space workforce.',
			},
			{
				part: 'citation',
				text: '(State University System, 2025)',
			},
		],
	},
	{
		name: 'centered',
		title: 'Highlight: Centered',
		description:
			'A large figure or a logo, a short bar, a sentence and a credit, centered.',
		wpIcon: 'alignCenter',
		props: { rule: 'divider', contentAlign: 'center' },
		parts: [
			{ part: 'figure', text: 'No. 1' },
			{
				part: 'detail',
				text: 'Supplier of talent to the nation’s aerospace and defense industries.',
			},
			{ part: 'citation', text: '(Aviation Week)' },
		],
	},
];

/**
 * A preset by its name.
 *
 * @param name A preset's name in PRESETS.
 */
export const presetNamed = ( name: string ): Preset =>
	findPreset( PRESETS, name );

/**
 * The preset a Highlight inserted without picking one starts with, in every host: the
 * statement, the common one. WordPress makes it the default variation, the block's template
 * and the inserter's preview; Puck's withTemplate() starts the slot with its parts.
 *
 * WHY a starting point, not a lock: the frame's content is open; editors may change, move or
 * remove any of it.
 */
export const DEFAULT_PRESET: Preset = presetNamed( 'statement' );
