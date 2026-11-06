/**
 * The Event List's props: every prop an editor sets, with its type, values, default and field.
 * WordPress's sidebar and block.json attributes, Puck's fields and defaults, and the stories'
 * controls are built from it (integrations/schema/props.ts says how).
 *
 * SPEC: the UCF Events plugin's `[ucf-events]` settings (feed_url, limit, offset, title,
 * layout, and the message inside the shortcode), less `layout`: its three layouts are one list
 * here, with or without descriptions.
 * SYNC: each prop's key is a block attribute, saved in every post that uses the block, so it is
 * permanent (docs/architecture.md, "Naming"). block.json lists them too, written by
 * `npm run sync:blocks`; integrations/tests/parity.test.tsx fails while the two differ.
 */
import type {
	PropDefinitions,
	PropsOf,
} from '../../../integrations/schema/props.ts';

// WHY choices, not free numbers: the schema's fields are text or a choice, and a list of a few
// events is what this is for. The old plugin's default was 3.
const counts = ( from: number, to: number ) =>
	Array.from( { length: to - from + 1 }, ( _, index ) => {
		const value = String( from + index );
		return { value, label: value };
	} );

export const PROPS = {
	/** A calendar's JSON feed, or '' for the site's default (the upcoming UCF events). */
	feedUrl: {
		type: 'text',
		label: 'Feed URL',
		help: 'An events.ucf.edu calendar feed, ending in feed.json. Leave empty for all upcoming UCF events.',
		panel: 'Events',
		default: '',
	},
	/** How many events to show. */
	limit: {
		type: 'choice',
		label: 'Number of events',
		panel: 'Events',
		control: 'select',
		options: counts( 1, 12 ),
		default: '3',
	},
	/** How many upcoming events to skip first. */
	offset: {
		type: 'choice',
		label: 'Skip',
		help: 'Leave out this many of the soonest events, to continue another list.',
		panel: 'Events',
		control: 'select',
		options: counts( 0, 12 ),
		default: '0',
	},
	/** A heading above the list, or '' for none. */
	title: {
		type: 'text',
		label: 'Heading',
		help: 'Shown above the list. Leave empty when the section already has one.',
		panel: 'Display',
		default: '',
	},
	/**
	 * One column, or two side by side where the list is wide enough (one again on a phone or in
	 * a narrow column).
	 */
	columns: {
		type: 'choice',
		label: 'Columns',
		panel: 'Display',
		control: 'radio',
		options: [
			{ value: '1', label: 'One' },
			{ value: '2', label: 'Two' },
		],
		default: '1',
	},
	/** Standard, or a larger date block and title, for a list that leads a page or section. */
	size: {
		type: 'choice',
		label: 'Size',
		panel: 'Display',
		control: 'radio',
		options: [
			{ value: 'standard', label: 'Standard' },
			{ value: 'large', label: 'Large date and title' },
		],
		default: 'standard',
	},
	/** Whether each event shows the start of its description. */
	descriptions: {
		type: 'choice',
		label: 'Descriptions',
		panel: 'Display',
		control: 'radio',
		options: [
			{ value: 'hide', label: 'Hide' },
			{ value: 'show', label: 'Show the first 40 words' },
		],
		default: 'hide',
	},
	/** What to say when there are no events, or '' to show nothing. */
	emptyMessage: {
		type: 'text',
		label: 'When there are no events',
		panel: 'Display',
		default: 'There are no upcoming events.',
	},
} as const satisfies PropDefinitions;

export type EventListEditableProps = PropsOf< typeof PROPS >;
