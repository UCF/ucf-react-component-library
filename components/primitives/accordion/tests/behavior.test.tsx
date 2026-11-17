// @vitest-environment happy-dom
// WHY happy-dom: the script reads and changes the DOM.
/** CONTEXT: behavior.ts, on the Accordion's real markup. */
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import AccordionItem from '../../accordion-item/AccordionItem.tsx';
import Accordion from '../Accordion.tsx';
import { enhanceAccordion } from '../behavior.ts';

let cleanup = () => {};
afterEach( () => {
	cleanup();
	document.body.innerHTML = '';
	history.replaceState( null, '', '#' );
} );

/**
 * An Accordion of two items on the page, the second with a nested Accordion in its answer.
 *
 * @return The outer Accordion and its parts.
 */
const page = () => {
	document.body.innerHTML = renderToStaticMarkup(
		<Accordion>
			<AccordionItem title="One">
				<p id="fees">Fees are due in August.</p>
			</AccordionItem>
			<AccordionItem title="Two">
				<Accordion>
					<AccordionItem title="Inner">
						<p>Inside.</p>
					</AccordionItem>
				</Accordion>
			</AccordionItem>
		</Accordion>
	);
	const accordion =
		document.querySelector< HTMLElement >( '.ucf-c-accordion' )!;
	// One, Two, and Inner, in the Accordion in Two's answer.
	type Three< T > = [ T, T, T ];
	const items = [
		...document.querySelectorAll< HTMLElement >( '.ucf-c-accordion-item' ),
	] as Three< HTMLElement >;
	const toggles = items.map( ( item ) =>
		item.querySelector< HTMLButtonElement >( 'button' )!
	) as Three< HTMLButtonElement >;
	const panels = items.map( ( item ) =>
		item.querySelector< HTMLElement >( '.ucf-c-accordion-item__panel' )!
	) as Three< HTMLElement >;
	return { accordion, items, toggles, panels };
};

const enhance = ( accordion: HTMLElement ) => {
	cleanup = enhanceAccordion( accordion );
	return cleanup;
};

describe( 'enhanceAccordion', () => {
	it( 'closes each answer, and ties each question to its answer', () => {
		const { accordion, toggles, panels } = page();
		enhance( accordion );
		const pairs = [
			[ toggles[ 0 ], panels[ 0 ] ],
			[ toggles[ 1 ], panels[ 1 ] ],
		] as const;
		for ( const [ toggle, panel ] of pairs ) {
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
			expect( panel.getAttribute( 'hidden' ) ).toBe( 'until-found' );
			expect( toggle.getAttribute( 'aria-controls' ) ).toBe( panel.id );
			expect( panel.getAttribute( 'role' ) ).toBe( 'region' );
			expect( panel.getAttribute( 'aria-labelledby' ) ).toBe( toggle.id );
		}
		expect( toggles[ 0 ].id ).not.toBe( toggles[ 1 ].id );
	} );

	it( 'opens and closes an answer from its question', () => {
		const { accordion, items, toggles, panels } = page();
		enhance( accordion );
		toggles[ 0 ].click();
		expect( toggles[ 0 ].getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		expect( panels[ 0 ].hasAttribute( 'hidden' ) ).toBe( false );
		expect( items[ 0 ].hasAttribute( 'data-open' ) ).toBe( true );
		// Each opens on its own.
		expect( items[ 1 ].hasAttribute( 'data-open' ) ).toBe( false );

		toggles[ 0 ].click();
		expect( toggles[ 0 ].getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		expect( panels[ 0 ].getAttribute( 'hidden' ) ).toBe( 'until-found' );
		expect( items[ 0 ].hasAttribute( 'data-open' ) ).toBe( false );
	} );

	// A11Y: find in page fires beforematch on a closed answer it found text in.
	it( 'opens an answer the browser’s find in page reaches', () => {
		const { accordion, toggles, panels } = page();
		enhance( accordion );
		panels[ 1 ].dispatchEvent( new Event( 'beforematch' ) );
		expect( toggles[ 1 ].getAttribute( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'opens the answer a link on the page points into', () => {
		history.replaceState( null, '', '#fees' );
		const { accordion, toggles } = page();
		enhance( accordion );
		expect( toggles[ 0 ].getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		expect( toggles[ 1 ].getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );

	it( 'ignores a link it can’t decode', () => {
		history.replaceState( null, '', '#100%' );
		const { accordion, toggles } = page();
		expect( () => enhance( accordion ) ).not.toThrow();
		expect( toggles[ 0 ].getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		window.dispatchEvent( new HashChangeEvent( 'hashchange' ) );
	} );

	it( 'leaves an Accordion in an answer to its own call', () => {
		const { accordion, toggles } = page();
		enhance( accordion );
		expect( toggles[ 2 ].hasAttribute( 'aria-expanded' ) ).toBe( false );
	} );

	it( 'puts the markup back as it was when cleaned up, and runs once', () => {
		const { accordion, toggles } = page();
		const before = document.body.innerHTML;
		const undo = enhance( accordion );
		expect( enhanceAccordion( accordion )() ).toBeUndefined();
		toggles[ 0 ].click();
		undo();
		cleanup = () => {};
		expect( document.body.innerHTML ).toBe( before );
		toggles[ 0 ].click();
		expect( toggles[ 0 ].hasAttribute( 'aria-expanded' ) ).toBe( false );
	} );
} );
