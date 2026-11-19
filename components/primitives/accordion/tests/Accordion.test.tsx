/**
 * The Accordion's markup contract: WordPress's serializer and React DOM's give the same HTML, and
 * it matches the snapshot. Our blocks save this markup inside theirs, so a change here is a change
 * to every saved block that uses it.
 */
import { renderToString } from '@wordpress/element';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import AccordionItem from '../../accordion-item/AccordionItem.tsx';
import Accordion, { type AccordionProps } from '../Accordion.tsx';

const cases: Record< string, AccordionProps > = {
	defaults: {},
	'with an id and a class': { id: 'faq', className: 'is-featured' },
};

describe( 'Accordion', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = (
				<Accordion { ...props }>
					<AccordionItem title="Do I have to send test scores?">
						<p>Check the current requirement.</p>
					</AccordionItem>
					<AccordionItem title="How much transfers?" level="4">
						<p>A Florida A.A. transfers as a block.</p>
					</AccordionItem>
				</Accordion>
			);
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: a Puck slot holds the items, so it must be inside the group.
	it( 'renders its content area as the element a host passes for it', () => {
		const Zone = ( props: object ) => <div data-zone="" { ...props } />;
		expect(
			renderToStaticMarkup(
				<Accordion.port.Frame areas={ { content: Zone } } />
			)
		).toBe(
			'<div role="group" class="ucf-c ucf-c-accordion"><div data-zone="" class="ucf-c-accordion__items"></div></div>'
		);
	} );
} );
