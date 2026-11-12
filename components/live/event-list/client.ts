/**
 * CONTEXT: the only code that knows the shape of the events.ucf.edu feed. Everything it returns
 * is an EventItem (types.ts), so if the feed changes, this file changes and the component does
 * not.
 *
 * Used wherever the events are fetched in JavaScript: a Next Server Component, the WordPress
 * editor's preview, Puck. On a WordPress page, PHP fetches instead, with the same rules:
 * SYNC: integrations/wp/client.php, step for step. tests/EventList.php.test.tsx runs both on
 * the same feed and fails when their markup differs.
 *
 * UPSTREAM: the feed is UNL Events (events.ucf.edu); a calendar's `…/feed.json` is a JSON array.
 * It sends `Access-Control-Allow-Origin: *`, so a browser may fetch it directly.
 */
import { summarize, plainText } from './utils/text.ts';
import type { EventItem } from './types.ts';

/** The feed of every upcoming UCF event. SYNC: ucf_events_event_list_settings() in PHP. */
export const DEFAULT_FEED_URL = 'https://events.ucf.edu/upcoming/feed.json';

/** One event as the feed sends it: only the fields used here. */
interface FeedEvent {
	id?: string | number;
	title?: string | null;
	url?: string | null;
	starts?: string | null;
	ends?: string | null;
	location?: string | null;
	description?: string | null;
}

export interface ListOptions {
	/** How many to show. */
	limit: number;
	/** How many upcoming events to skip first. */
	offset?: number;
	/** What counts as now: events that ended before it are dropped. */
	now?: Date;
}

const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

// UPSTREAM: the feed's dates are RFC 2822: `Fri, 06 Nov 2026 11:00:00 -0500`.
const FEED_DATE =
	/^[A-Za-z]{3}, (\d{2}) ([A-Za-z]{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})$/;

/**
 * A feed date as ISO 8601, in the same zone: `2026-11-06T11:00:00-05:00`.
 *
 * @param value The feed's date.
 * @return The date, or '' when it isn't one.
 */
export function isoDate( value: string | null | undefined ): string {
	const match = FEED_DATE.exec( value ?? '' );
	const month = match ? MONTHS.indexOf( match[ 2 ] ?? '' ) + 1 : 0;
	if ( ! match || ! month ) {
		return '';
	}
	const [ , day, , year, hour, minute, second, sign, zoneHour, zoneMinute ] =
		match;
	return `${ year }-${ String( month ).padStart(
		2,
		'0'
	) }-${ day }T${ hour }:${ minute }:${ second }${ sign }${ zoneHour }:${ zoneMinute }`;
}

/**
 * The feed's events as EventItems: each one cleaned up, those already over dropped, then the
 * offset and the limit applied.
 *
 * WHY drop past events here, when the feed is "upcoming": a cached copy outlives the events in
 * it. SPEC: a list with last week's events on it reads as an abandoned site.
 *
 * @param feed           The feed's JSON, parsed.
 * @param options        How many, and from when.
 * @param options.limit  How many to show.
 * @param options.offset How many upcoming events to skip first.
 * @param options.now    What counts as now.
 * @return The events to show.
 */
export function normalizeEvents(
	feed: unknown,
	{ limit, offset = 0, now = new Date() }: ListOptions
): EventItem[] {
	if ( ! Array.isArray( feed ) ) {
		return [];
	}
	const events = ( feed as FeedEvent[] ).flatMap( ( event ): EventItem[] => {
		const starts = isoDate( event?.starts );
		const title = plainText( String( event?.title ?? '' ) );
		// WHY: an event with no date or no title can't be listed sensibly.
		if ( ! starts || ! title ) {
			return [];
		}
		const ends = isoDate( event.ends );
		if ( Date.parse( ends || starts ) < now.getTime() ) {
			return [];
		}
		return [
			{
				id: String( event.id ?? '' ),
				title,
				url: String( event.url ?? '' ),
				starts,
				ends,
				location: plainText( String( event.location ?? '' ) ),
				summary: summarize( String( event.description ?? '' ) ),
			},
		];
	} );
	return events.slice(
		Math.max( 0, offset ),
		Math.max( 0, offset ) + Math.max( 0, limit )
	);
}

export interface ClientOptions {
	/** A calendar's JSON feed. */
	feedUrl?: string;
	/** Replaces the global fetch, for tests and for hosts that cache their own. */
	fetch?: typeof globalThis.fetch;
}

export interface EventClient {
	getEvents: (
		options: ListOptions & { signal?: AbortSignal }
	) => Promise< EventItem[] >;
}

/**
 * A client for one events feed.
 *
 * @param options         Which feed, and how to fetch it.
 * @param options.feedUrl A calendar's JSON feed; the upcoming UCF feed when left out or ''.
 * @param options.fetch   Replaces the global fetch.
 * @return An EventClient.
 */
export function createClient( {
	feedUrl,
	fetch: fetchFn = globalThis.fetch,
}: ClientOptions = {} ): EventClient {
	const url = feedUrl || DEFAULT_FEED_URL;
	return {
		async getEvents( { signal, ...options } ) {
			const response = await fetchFn( url, {
				signal,
				headers: { Accept: 'application/json' },
			} );
			if ( ! response.ok ) {
				throw new Error(
					`Request failed with status ${ response.status }: ${ url }`
				);
			}
			return normalizeEvents( await response.json(), options );
		},
	};
}
