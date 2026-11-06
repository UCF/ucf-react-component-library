/**
 * The events for an editor's preview, fetched in the browser.
 *
 * WHY only for editors: the WordPress editor and Puck render on the client, so they fetch
 * there. A page a visitor sees gets its events on the server (render.php, or a Next Server
 * Component calling client.ts), and EventList itself never fetches.
 */
import { useEffect, useState } from 'react';

import { createClient } from '../client.ts';
import type { EventItem } from '../types.ts';

export type EventsState =
	| { status: 'loading'; events: readonly EventItem[] }
	| { status: 'success'; events: readonly EventItem[] }
	| { status: 'error'; events: readonly EventItem[]; error: Error };

/**
 * Fetch a feed's events, again whenever the feed, limit or offset change.
 *
 * @param options         Which feed, and how many.
 * @param options.feedUrl A calendar's JSON feed, or '' for the default.
 * @param options.limit   How many to show.
 * @param options.offset  How many to skip.
 * @return The request's state, with the last events while the next load.
 */
export function useEvents( {
	feedUrl,
	limit,
	offset,
}: {
	feedUrl: string;
	limit: number;
	offset: number;
} ): EventsState {
	const [ state, setState ] = useState< EventsState >( {
		status: 'loading',
		events: [],
	} );

	useEffect( () => {
		const controller = new AbortController();
		setState( ( last ) => ( { status: 'loading', events: last.events } ) );
		createClient( { feedUrl } )
			.getEvents( { limit, offset, signal: controller.signal } )
			.then(
				( events ) => {
					if ( ! controller.signal.aborted ) {
						setState( { status: 'success', events } );
					}
				},
				( error: unknown ) => {
					if ( ! controller.signal.aborted ) {
						setState( {
							status: 'error',
							events: [],
							error:
								error instanceof Error
									? error
									: new Error( String( error ) ),
						} );
					}
				}
			);
		return () => controller.abort();
	}, [ feedUrl, limit, offset ] );

	return state;
}
