/**
 * CONTEXT: the UCF highlight designs, as data both hosts read: WordPress makes each a block
 * variation (adapters/wp/index.tsx), Puck a starting preset (withVariation() in
 * adapters/puck/config.tsx), and the stories render them. As the Card's (card/variations.ts).
 *
 * SPEC: the designs come from UCF's current pages: the stats band, the admissions key figures,
 * the careers bracket, the engineering side rule and the centered space-band highlights.
 */
import { PARTS } from './Highlight.tsx';
import type { HighlightProps } from './Highlight.tsx';

export type PartKey = keyof typeof PARTS;

export type Part =
	/** A logo or badge (PARTS.logo): core Image in WordPress, the Image primitive in Puck. */
	| { kind: 'logo'; alt: string }
	| { kind: 'text'; text: string; part: PartKey };

export type Variation = {
	name: string;
	/**
	 * Its name in the inserter and Puck, after the block's: "Card: Pathway". WHY the prefix: in
	 * a search or a list of blocks, it says which block the design is.
	 */
	title: string;
	description: string;
	settings: Pick< HighlightProps, 'rule' | 'contentAlign' >;
	content: Part[];
};

export const VARIATIONS: Variation[] = [
	{
		name: 'statement',
		title: 'Highlight: Statement',
		description:
			'A fact as a full sentence, why it matters, and its source.',
		settings: { rule: 'top' },
		content: [
			{
				kind: 'text',
				part: 'statement',
				text: 'Florida’s largest university, with 70,674 students',
			},
			{
				kind: 'text',
				part: 'detail',
				text: 'More students than any other university in the state.',
			},
			{
				kind: 'text',
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
		settings: { rule: 'top' },
		content: [
			{ kind: 'text', part: 'figure', text: 'Nov 1' },
			{ kind: 'text', part: 'label', text: 'Early action deadline' },
			{
				kind: 'text',
				part: 'source',
				text: 'UCF Undergraduate Admissions',
			},
		],
	},
	{
		name: 'bracket',
		title: 'Highlight: Bracket',
		description: 'A statement and its detail inside an accent bracket.',
		settings: { rule: 'corner' },
		content: [
			{ kind: 'text', part: 'statement', text: '375+ companies' },
			{
				kind: 'text',
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
		settings: { rule: 'side' },
		content: [
			{
				kind: 'text',
				part: 'statement',
				text: '1 in 4 of Florida’s engineering graduates come from UCF',
			},
			{
				kind: 'text',
				part: 'detail',
				text: 'Making UCF the driving force behind the state’s tech and space workforce.',
			},
			{
				kind: 'text',
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
		settings: { rule: 'divider', contentAlign: 'center' },
		content: [
			{ kind: 'text', part: 'figure', text: 'No. 1' },
			{
				kind: 'text',
				part: 'detail',
				text: 'Supplier of talent to the nation’s aerospace and defense industries.',
			},
			{ kind: 'text', part: 'citation', text: '(Aviation Week)' },
		],
	},
];
