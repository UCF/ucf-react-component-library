/**
 * `@ucf/components/event-list`. SYNC: docs/architecture.md, "What a component exports".
 *
 * A live component: fetch the events, then render the list. In a Next Server Component:
 *
 *     const events = await createClient().getEvents( { limit: 3 } );
 *     return <EventList events={ events } />;
 */
export { default as EventList, type EventListProps } from './EventList.tsx';
export { PROPS as EVENT_LIST_PROPS } from './EventList.props.ts';
export {
	createClient,
	normalizeEvents,
	DEFAULT_FEED_URL,
	type EventClient,
	type ClientOptions,
	type ListOptions,
} from './client.ts';
export type { EventItem } from './types.ts';
