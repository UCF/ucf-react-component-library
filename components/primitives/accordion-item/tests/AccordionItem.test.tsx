/**
 * The Accordion Item's markup contract: WordPress's serializer and React DOM's give the same
 * HTML, and it matches the snapshot. Our blocks save this markup inside theirs, so a change here
 * is a change to every saved block that uses it.
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AccordionItem, { type AccordionItemProps } from '../AccordionItem.tsx';

const cases: Record< string, AccordionItemProps > = {
	defaults: {},
	'a question at h2': {
		title: 'Can I change my major after I am admitted?',
		level: '2',
	},
	'with an id and a class': { id: 'majors', className: 'is-featured' },
};

describe( 'AccordionItem', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = (
				<AccordionItem { ...props }>
					<p>Usually yes, through a change-of-major process.</p>
				</AccordionItem>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: Puck's slot is the answer panel, so it must carry the panel's class.
	it( 'renders its content area as the element a host passes for it', () => {
		const Zone = ( props: object ) => <div data-zone="" { ...props } />;
		expect(
			renderToStaticMarkup(
				<AccordionItem.port.Frame areas={ { content: Zone } } />
			)
		).toContain(
			'<div data-zone="" class="ucf-c-accordion-item__panel"></div>'
		);
	} );
} );
