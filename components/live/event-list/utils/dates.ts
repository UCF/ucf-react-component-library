/**
 * The Event List's dates, in UCF's (AP) style.
 *
 * WHY read from the string, not a Date: a Date shows the time in the zone of whatever runs it.
 * The parts here are the event's own wall-clock time, so every host shows the same thing.
 * SYNC: integrations/wp/markup.php formats the same way; tests/EventList.php.test.tsx compares.
 */

// SPEC: AP style abbreviates these months and spells out the rest.
const AP_MONTHS = [
	'Jan.',
	'Feb.',
	'March',
	'April',
	'May',
	'June',
	'July',
	'Aug.',
	'Sept.',
	'Oct.',
	'Nov.',
	'Dec.',
];

// The date block's month: three letters, made capitals by the CSS.
const SHORT_MONTHS = [
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

const ISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/**
 * The wall-clock parts of an ISO 8601 date and time.
 *
 * @param iso As in EventItem's `starts`.
 * @return Its parts, or null when it isn't one.
 */
function partsOf( iso: string ) {
	const match = ISO.exec( iso );
	if ( ! match ) {
		return null;
	}
	const [ year = 0, month = 0, day = 0, hour = 0, minute = 0 ] = match
		.slice( 1 )
		.map( Number );
	return { year, month, day, hour, minute };
}

/**
 * The date block's month and day: `Nov` and `6`.
 *
 * @param iso As in EventItem's `starts`.
 */
export function dateBlock( iso: string ): { month: string; day: string } {
	const parts = partsOf( iso );
	return parts
		? {
				month: SHORT_MONTHS[ parts.month - 1 ] ?? '',
				day: String( parts.day ),
			}
		: { month: '', day: '' };
}

/**
 * AP style time: `11 a.m.`, `5:30 p.m.`, `noon`, `midnight`.
 *
 * @param hour   0 to 23.
 * @param minute 0 to 59.
 */
export function apTime( hour: number, minute: number ): string {
	if ( minute === 0 && hour === 12 ) {
		return 'noon';
	}
	if ( minute === 0 && hour === 0 ) {
		return 'midnight';
	}
	const clock = hour % 12 || 12;
	const minutes = minute ? `:${ String( minute ).padStart( 2, '0' ) }` : '';
	return `${ clock }${ minutes } ${ hour < 12 ? 'a.m.' : 'p.m.' }`;
}

/**
 * When an event starts, in words: `Nov. 6, 2026, 11 a.m.`
 *
 * @param iso As in EventItem's `starts`.
 */
export function whenText( iso: string ): string {
	const parts = partsOf( iso );
	if ( ! parts ) {
		return '';
	}
	return `${ AP_MONTHS[ parts.month - 1 ] } ${ parts.day }, ${
		parts.year
	}, ${ apTime( parts.hour, parts.minute ) }`;
}
