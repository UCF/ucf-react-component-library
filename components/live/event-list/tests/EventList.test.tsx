/**
 * The Event List's markup, the record of it (docs/architecture.md, "The three layers").
 *
 * Nothing stores a live block's markup, so a change here breaks no saved post. It still
 * changes what every site shows, and integrations/wp/markup.php must change with it
 * (tests/EventList.php.test.tsx).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import EventList, { type EventListProps } from '../EventList.tsx';
import { SAMPLE_EVENTS } from '../sample-data.ts';

const cases: Record< string, EventListProps > = {
	'three events': { events: SAMPLE_EVENTS.slice( 0, 3 ) },
	'a heading and descriptions': {
		events: SAMPLE_EVENTS.slice( 0, 2 ),
		title: 'Upcoming events',
		descriptions: 'show',
	},
	'two columns': { events: SAMPLE_EVENTS.slice( 0, 2 ), columns: '2' },
	'no date blocks': { events: SAMPLE_EVENTS.slice( 0, 2 ), dates: 'hide' },
	'no events, with a message': {
		events: [],
		emptyMessage: 'There are no upcoming events.',
	},
};

describe( 'EventList', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders: ${ name }`, () => {
			expect(
				renderToStaticMarkup( <EventList { ...props } /> )
			).toMatchSnapshot();
		} );
	}

	// A11Y: the event titles are h3s, so the list's own heading is the h2 above them.
	it( 'writes its heading as an h2 before the list', () => {
		const html = renderToStaticMarkup(
			<EventList
				events={ SAMPLE_EVENTS.slice( 0, 1 ) }
				title="Upcoming events"
			/>
		);
		expect( html ).toMatch(
			/^<div[^>]*><h2 class="ucf-c-event-list__heading[^"]*">Upcoming events<\/h2><ul/
		);
	} );

	it( 'leaves out the date blocks when they are hidden', () => {
		const html = renderToStaticMarkup(
			<EventList events={ SAMPLE_EVENTS.slice( 0, 2 ) } dates="hide" />
		);
		expect( html ).toContain( 'data-dates="hide"' );
		expect( html ).not.toContain( 'ucf-c-event-list__date' );
		// The full date is still there, in the meta line.
		expect( html ).toContain( '<time' );
	} );

	it( 'shows only its heading when there are no events and no message', () => {
		expect( renderToStaticMarkup( <EventList /> ) ).toBe(
			'<div class="ucf-c ucf-c-event-list"><h2 class="ucf-c-event-list__heading ucf-c ucf-c-heading">Upcoming events</h2></div>'
		);
	} );

	// A11Y: every list has a heading. An emptied or blank one falls back to the default.
	for ( const title of [ '', '  ' ] ) {
		it( `uses the default heading for ${ JSON.stringify( title ) }`, () => {
			expect(
				renderToStaticMarkup( <EventList title={ title } /> )
			).toContain( '>Upcoming events</h2>' );
		} );
	}

	// A11Y: the date block repeats what the <time> says, so it is hidden from screen readers.
	it( 'gives each event its full start time, read once', () => {
		const html = renderToStaticMarkup(
			<EventList events={ SAMPLE_EVENTS.slice( 0, 1 ) } />
		);
		// UPSTREAM: React writes the attribute `dateTime`; HTML reads names in any case.
		expect( html ).toContain(
			'<time dateTime="2026-11-06T11:00:00-05:00">Nov. 6, 2026, 11 a.m.</time>'
		);
		expect( html ).toContain(
			'<div class="ucf-c-event-list__date" aria-hidden="true">'
		);
	} );
} );
