/**
 * An event as the Event List shows it: the feed's fields it uses, cleaned up by client.ts (and
 * its PHP copy, integrations/wp/client.php).
 *
 * WHY not `Event`: that is the DOM's event type, in scope everywhere.
 */
export interface EventItem {
	/** The feed's event instance ID: one date of a repeating event. */
	id: string;
	/** Plain text, entities decoded. */
	title: string;
	/** Its page on events.ucf.edu. */
	url: string;
	/**
	 * When it starts, as ISO 8601 in the event's own time zone: `2026-11-06T11:00:00-05:00`.
	 * WHY its own zone: the date and time shown are read from this string, never converted, so
	 * a server or browser in another zone shows the time the event's calendar gave.
	 */
	starts: string;
	/** When it ends, the same way. '' when the feed gives none. */
	ends: string;
	/** Plain text. '' when there is none. */
	location: string;
	/** The description as plain text, cut to its first 40 words. */
	summary: string;
}
