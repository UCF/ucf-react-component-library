/**
 * CONTEXT: the Event List, a live component: upcoming events from an events.ucf.edu feed.
 *
 * Live: its data is fetched, and its HTML must be in the page (search engines read it, and it
 * works without JavaScript). So this core follows content rules: props in, markup out, no state,
 * no effects, no fetching. Whoever renders it fetches first and passes `events`: a Next Server
 * Component through client.ts; WordPress in PHP (integrations/wp/render.php).
 *
 * SYNC: integrations/wp/render.php writes this same markup in PHP, for WordPress.
 * tests/EventList.php.test.tsx fails when the two differ. Change both together. Nothing stores
 * this markup, so a change needs no block deprecation.
 * SPEC: the UCF Brand Block Theme's Events block (`ucf/events`, includes/events.php there): a
 * date block, the title, then when and where.
 */
import Heading from '../../primitives/heading/Heading.tsx';
import { PROPS, type EventListEditableProps } from './EventList.props.ts';
import type { EventItem } from './types.ts';
import { dateBlock, whenText } from './utils/dates.ts';

export type EventListProps = Partial<
	Pick<
		EventListEditableProps,
		'title' | 'columns' | 'dates' | 'descriptions' | 'emptyMessage'
	>
> & {
	/** The events to show, already fetched, in order (client.ts). */
	events?: readonly EventItem[];
	/** Extra classes for the root, as a host adds its own. */
	className?: string;
};

/**
 * The heading to show: the one given, or the default when it is empty or only spaces.
 * SYNC: integrations/wp/render.php trims the same four
 * characters. WHY not trim(): JavaScript's and PHP's differ in which spaces they remove.
 *
 * @param title The heading an editor set.
 */
function headingOf( title: string ) {
	const trimmed = title.replace( /^[ \t\n\r]+|[ \t\n\r]+$/g, '' );
	return trimmed || PROPS.title.default;
}

export default function EventList( {
	events = [],
	title = PROPS.title.default,
	columns = '1',
	dates = 'show',
	descriptions = 'hide',
	emptyMessage = '',
	className,
}: EventListProps ) {
	return (
		<div
			className={ [ className, 'ucf-c', 'ucf-c-event-list' ]
				.filter( Boolean )
				.join( ' ' ) }
			// WHY only when not the default: the default has no attribute to style.
			data-columns={ columns === '2' ? '2' : undefined }
			data-dates={ dates === 'hide' ? 'hide' : undefined }
		>
			<Heading
				level={ 2 }
				className="ucf-c-event-list__heading"
				content={ headingOf( title ) }
			/>
			{ events.length ? (
				<ul className="ucf-c-event-list__items">
					{ events.map( ( event ) => {
						const { month, day } = dateBlock( event.starts );
						return (
							<li
								className="ucf-c-event-list__item"
								key={ event.id || event.url }
							>
								{ /* A11Y: the date block is for the eye; the full date is in
								     the <time> beside it, so it is hidden rather than read twice. */ }
								{ dates === 'hide' ? null : (
									<div
										className="ucf-c-event-list__date"
										aria-hidden="true"
									>
										<span className="ucf-c-event-list__month">
											{ month }
										</span>
										<span className="ucf-c-event-list__day">
											{ day }
										</span>
									</div>
								) }
								<div className="ucf-c-event-list__body">
									<Heading
										level={ 3 }
										className="ucf-c-event-list__title"
										content={
											<a href={ event.url }>
												{ event.title }
											</a>
										}
									/>
									<p className="ucf-c-event-list__meta">
										<time dateTime={ event.starts }>
											{ whenText( event.starts ) }
										</time>
										{ event.location ? (
											<span>{ event.location }</span>
										) : null }
									</p>
									{ descriptions === 'show' &&
									event.summary ? (
										<p className="ucf-c-event-list__description">
											{ event.summary }
										</p>
									) : null }
								</div>
							</li>
						);
					} ) }
				</ul>
			) : null }
			{ ! events.length && emptyMessage ? (
				<p className="ucf-c-event-list__empty">{ emptyMessage }</p>
			) : null }
		</div>
	);
}
