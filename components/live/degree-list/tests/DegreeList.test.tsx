/**
 * The Degree List's markup, the record of it (docs/architecture.md, "The three layers").
 *
 * Nothing stores a live block's markup, so a change here breaks no saved post. It still changes
 * what every site shows, and integrations/wp/render.php must change with it
 * (tests/DegreeList.php.test.tsx).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import DegreeList, { type DegreeListProps } from '../DegreeList.tsx';
import { SAMPLE_PROGRAMS } from '../sample-data.ts';

const cases: Record< string, DegreeListProps > = {
	'three programs': { programs: SAMPLE_PROGRAMS.slice( 0, 3 ) },
	'a heading': {
		programs: SAMPLE_PROGRAMS.slice( 0, 2 ),
		title: 'Business programs',
	},
	'two columns': { programs: SAMPLE_PROGRAMS.slice( 0, 2 ), columns: '2' },
	'three columns': { programs: SAMPLE_PROGRAMS.slice( 0, 2 ), columns: '3' },
	'no programs, with a message': {
		programs: [],
		emptyMessage: 'No programs found.',
	},
};

describe( 'DegreeList', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders: ${ name }`, () => {
			expect(
				renderToStaticMarkup( <DegreeList { ...props } /> )
			).toMatchSnapshot();
		} );
	}

	it( 'writes each program as a link in a list', () => {
		const html = renderToStaticMarkup(
			<DegreeList programs={ SAMPLE_PROGRAMS.slice( 0, 1 ) } />
		);
		expect( html ).toBe(
			'<div class="ucf-c ucf-c-degree-list"><ul class="ucf-c-degree-list__items"><li class="ucf-c-degree-list__item"><a href="https://www.ucf.edu/degree/accounting-bsba/">Accounting (BSBA)</a></li></ul></div>'
		);
	} );

	it( 'leaves out a blank heading, and writes nothing else with no programs and no message', () => {
		expect( renderToStaticMarkup( <DegreeList title={ ' \n ' } /> ) ).toBe(
			'<div class="ucf-c ucf-c-degree-list"></div>'
		);
	} );

	it( 'writes only one, two or three columns', () => {
		const html = renderToStaticMarkup(
			<DegreeList
				programs={ SAMPLE_PROGRAMS.slice( 0, 1 ) }
				columns={ '4' as '1' }
			/>
		);
		expect( html ).not.toContain( 'data-columns' );
	} );
} );
