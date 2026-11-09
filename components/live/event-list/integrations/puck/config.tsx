/**
 * The Event List for Puck: a plain config object, so this library needs no Puck dependency.
 *
 * WHY fetched in the browser here: Puck's editor renders on the client, and `render` can't wait
 * for data. TODO: a Puck site rendering a saved page on the server should fetch there instead
 * (Puck's `resolveData`, or the site's own Server Component calling client.ts); work it out in
 * the Puck playground (docs/todo.md).
 */
import { defaultsIn } from '../../../../../integrations/schema/props.ts';
import { puckFields } from '../../../../../integrations/puck/config.tsx';
import type { PuckComponentConfig } from '../../../../../integrations/puck/types.ts';
import EventList from '../../EventList.tsx';
import { PROPS, type EventListEditableProps } from '../../EventList.props.ts';
import { useEvents } from '../../utils/useEvents.ts';

/**
 * The list, fetched for the preview.
 *
 * @param props The stored props.
 */
function Preview( props: EventListEditableProps ) {
	const { events } = useEvents( {
		feedUrl: props.feedUrl,
		limit: Number( props.limit ),
		offset: Number( props.offset ),
	} );
	return (
		<EventList
			events={ events }
			title={ props.title }
			columns={ props.columns }
			dates={ props.dates }
			descriptions={ props.descriptions }
			emptyMessage={ props.emptyMessage }
		/>
	);
}

const config: PuckComponentConfig< EventListEditableProps > = {
	label: 'Event List',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// WHY each prop by name: Puck also passes `id`, `puck` and `editMode`, which aren't ours.
	render: ( {
		feedUrl,
		limit,
		offset,
		title,
		columns,
		dates,
		descriptions,
		emptyMessage,
	} ) => (
		<Preview
			feedUrl={ feedUrl }
			limit={ limit }
			offset={ offset }
			title={ title }
			columns={ columns }
			dates={ dates }
			descriptions={ descriptions }
			emptyMessage={ emptyMessage }
		/>
	),
};

export default config;
