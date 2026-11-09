import { describe, expect, it } from 'vitest';

import { apTime, dateBlock, whenText } from '../../utils/dates.ts';

describe( 'apTime', () => {
	it.each( [
		[ 11, 0, '11 a.m.' ],
		[ 17, 30, '5:30 p.m.' ],
		[ 12, 0, 'noon' ],
		[ 0, 0, 'midnight' ],
		[ 12, 15, '12:15 p.m.' ],
		[ 0, 5, '12:05 a.m.' ],
	] )( '%i:%i is %s', ( hour, minute, text ) => {
		expect( apTime( hour, minute ) ).toBe( text );
	} );
} );

describe( 'dates', () => {
	it( 'reads the wall-clock time, whatever zone runs it', () => {
		// 11 p.m. in Orlando is the next day in UTC; the list still says the 6th.
		expect( whenText( '2026-11-06T23:00:00-05:00' ) ).toBe(
			'Nov. 6, 2026, 11 p.m.'
		);
		expect( dateBlock( '2026-11-06T23:00:00-05:00' ) ).toEqual( {
			month: 'Nov',
			day: '6',
		} );
	} );

	it( 'spells out the months AP style does not abbreviate', () => {
		expect( whenText( '2026-03-02T09:00:00-05:00' ) ).toBe(
			'March 2, 2026, 9 a.m.'
		);
		expect( whenText( '2026-09-02T09:00:00-04:00' ) ).toBe(
			'Sept. 2, 2026, 9 a.m.'
		);
	} );

	it( 'gives nothing for a date it can’t read', () => {
		expect( whenText( 'soon' ) ).toBe( '' );
		expect( dateBlock( 'soon' ) ).toEqual( { month: '', day: '' } );
	} );
} );
