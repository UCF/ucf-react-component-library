/**
 * The site's Event List settings the editor's preview needs, from
 * `ucf_events_event_list_settings()` in plugins/ucf-events/ucf-events.php.
 */

export type EventListSettings = {
	/** The site's default feed: used when a block's Feed URL is empty. */
	feedUrl?: string;
};

declare global {
	interface Window {
		/** Set for the editor by plugins/ucf-events/ucf-events.php. */
		ucfEventListSettings?: EventListSettings;
	}
}

/**
 * The settings, or none when the plugin didn't set them (the component's defaults apply).
 *
 * @return The settings.
 */
export function editorSettings(): EventListSettings {
	return typeof window === 'undefined'
		? {}
		: ( window.ucfEventListSettings ?? {} );
}
