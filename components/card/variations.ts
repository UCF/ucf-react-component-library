/**
 * CONTEXT: the UCF card designs, as data both hosts read: WordPress makes each a block
 * variation (adapters/wp/index.tsx), Puck a starting preset (withVariation() in
 * adapters/puck/config.tsx), and the stories render them.
 *
 * WHY one list: a design is a mix of the Card's settings and the parts placed inside. Written
 * once, the WordPress variation, the Puck preset and the story can't drift apart, and adding a
 * design is a new entry here.
 * WHY parts by kind, not by block name: WordPress places core blocks and Puck the library's
 * primitives. Each adapter maps a kind to its own (a heading is `core/heading` in one and the
 * Heading primitive in the other).
 * SPEC: the designs come from UCF's current pages: a story card, a next-step panel, the
 * admissions audience tiles, the "Which of these are you?" pathway cards and the campus media
 * tiles.
 */
import { PARTS } from './Card.tsx';
import type { CardProps } from './Card.tsx';

export type PartKey = keyof typeof PARTS;

export type Part =
	| { kind: 'image'; aspectRatio: '3/2' | '16/9' | '4/3' | '1/1' }
	| { kind: 'heading'; text: string; level: 2 | 3 | 4; part?: PartKey }
	| { kind: 'text'; text: string; part?: PartKey }
	/** A text link with an arrow (PARTS.link): a paragraph with a link in WordPress. */
	| { kind: 'link'; text: string; url: string }
	| { kind: 'button'; text: string; url: string };

/**
 * The Card settings a design sets; the rest keep their defaults.
 *
 * WHY every design sets `variant`: the block's default (plain) and example.json's (boxed)
 * differ, and Puck and the stories start from example.json. tests/variations.test.tsx checks.
 */
export type CardSettings = Pick<
	CardProps,
	| 'variant'
	| 'composition'
	| 'overlay'
	| 'contentAlign'
	| 'contentPosition'
	| 'aspectRatio'
>;

export type Variation = {
	name: string;
	/**
	 * Its name in the inserter and Puck, after the block's: "Card: Pathway". WHY the prefix: in
	 * a search or a list of blocks, it says which block the design is.
	 */
	title: string;
	description: string;
	settings: CardSettings;
	/**
	 * WHY a flag, not an image: a design with a background shows a sample in Puck and the
	 * stories, but WordPress must not save a sample into a post; there the editor picks one.
	 */
	background?: boolean;
	content: Part[];
};

export const VARIATIONS: Variation[] = [
	{
		name: 'story',
		title: 'Card: Story',
		description: 'An image, a category and date, a title and a sentence.',
		settings: { variant: 'plain' },
		content: [
			{ kind: 'image', aspectRatio: '3/2' },
			{ kind: 'text', part: 'meta', text: 'News · Sept. 18, 2026' },
			{
				kind: 'heading',
				part: 'title',
				level: 3,
				text: 'A senior design team’s drone goes into service',
			},
			{
				kind: 'text',
				part: 'description',
				text: 'One or two sentences that help someone decide whether to read it.',
			},
		],
	},
	{
		name: 'next-step',
		title: 'Card: Next step',
		description: 'A boxed title, a sentence and one button.',
		settings: { variant: 'boxed' },
		content: [
			{ kind: 'heading', part: 'title', level: 3, text: 'Next step' },
			{
				kind: 'text',
				part: 'description',
				text: 'One application covers every undergraduate program, and you can save and come back.',
			},
			{ kind: 'button', text: 'Start your application', url: '#' },
		],
	},
	{
		name: 'audience',
		title: 'Card: Audience tile',
		description:
			'A square tile: a photo under a tint, a name in capitals and a sentence.',
		settings: {
			variant: 'plain',
			composition: 'gold',
			overlay: 'tint',
			contentAlign: 'center',
			contentPosition: 'center',
			aspectRatio: '1/1',
		},
		background: true,
		content: [
			{ kind: 'heading', part: 'label', level: 3, text: 'Freshman' },
			{
				kind: 'text',
				part: 'description',
				text: 'I’m a high school senior or first-time-in-college student seeking a bachelor’s degree.',
			},
		],
	},
	{
		name: 'pathway',
		title: 'Card: Pathway',
		description:
			'A dark card: who it is for, a display title, a sentence and a link.',
		settings: { variant: 'plain', composition: 'dark' },
		content: [
			{ kind: 'text', part: 'eyebrow', text: 'First-year' },
			{
				kind: 'heading',
				part: 'heading',
				level: 3,
				text: 'I am applying from high school',
			},
			{
				kind: 'text',
				part: 'description',
				text: 'Deadlines, the admitted profile, and what we look at besides grades.',
			},
			{ kind: 'link', text: 'First-year admission', url: '#' },
		],
	},
	{
		name: 'media',
		title: 'Card: Media tile',
		description:
			'A photo under a gradient, a tag in the corner and a caption at the bottom.',
		settings: {
			variant: 'plain',
			composition: 'dark',
			overlay: 'gradient',
			contentPosition: 'bottom',
			aspectRatio: '4/3',
		},
		background: true,
		content: [
			{ kind: 'text', part: 'tag', text: 'Engineering' },
			{
				kind: 'text',
				part: 'description',
				text: 'A materials pour. You do it, nobody demonstrates it at you.',
			},
		],
	},
];
