/**
 * CONTEXT: the Accordion's script: closes each answer and opens it from its question, a link to
 * something inside it, or the browser's find in page.
 *
 * WHY on top of the markup: every answer is readable without it (docs/architecture.md, "An
 * accordion is content").
 * WHY plain DOM: React calls it from an effect. WordPress needs none: there, editors place core
 * Accordion, which runs its own.
 * SPEC: WAI-ARIA's accordion: a button in a heading, with `aria-expanded`, controlling a region
 * it labels. Each item opens on its own, as core's do by default.
 */

// SYNC: the class names in AccordionItem.tsx and its style.css.
const ITEM = '.ucf-c-accordion-item';
const TOGGLE = '.ucf-c-accordion-item__toggle';
const PANEL = '.ucf-c-accordion-item__panel';

let count = 0;

/**
 * Enhances one Accordion.
 *
 * @param accordion The Accordion's element.
 * @return A cleanup function that undoes it.
 */
export function enhanceAccordion( accordion: HTMLElement ): () => void {
	if ( accordion.dataset.enhanced !== undefined ) {
		return () => {};
	}
	accordion.dataset.enhanced = '';

	// WHY closest(): an Accordion in an answer enhances its own items.
	const items = [ ...accordion.querySelectorAll< HTMLElement >( ITEM ) ]
		.filter(
			( item ) =>
				item.parentElement?.closest( '.ucf-c-accordion' ) === accordion
		)
		.map( ( item ) => ( {
			item,
			toggle: item.querySelector< HTMLButtonElement >( TOGGLE ),
			panel: item.querySelector< HTMLElement >( PANEL ),
		} ) )
		.filter(
			(
				parts
			): parts is {
				item: HTMLElement;
				toggle: HTMLButtonElement;
				panel: HTMLElement;
			} => Boolean( parts.toggle && parts.panel )
		);

	const added: Element[] = [];
	const setOpen = (
		{ item, toggle, panel }: ( typeof items )[ number ],
		open: boolean
	) => {
		item.toggleAttribute( 'data-open', open );
		toggle.setAttribute( 'aria-expanded', String( open ) );
		// A11Y: `until-found`, so find in page still reaches a closed answer (beforematch).
		if ( open ) {
			panel.removeAttribute( 'hidden' );
		} else {
			panel.setAttribute( 'hidden', 'until-found' );
		}
	};

	const cleanups = items.map( ( parts ) => {
		const { toggle, panel } = parts;
		const id = `ucf-accordion-${ ++count }`;
		if ( ! toggle.id ) {
			toggle.id = id;
			added.push( toggle );
		}
		if ( ! panel.id ) {
			panel.id = `${ id }-panel`;
			added.push( panel );
		}
		toggle.setAttribute( 'aria-controls', panel.id );
		panel.setAttribute( 'role', 'region' );
		panel.setAttribute( 'aria-labelledby', toggle.id );
		setOpen( parts, false );

		const onClick = () =>
			setOpen( parts, toggle.getAttribute( 'aria-expanded' ) !== 'true' );
		const onMatch = () => setOpen( parts, true );
		toggle.addEventListener( 'click', onClick );
		panel.addEventListener( 'beforematch', onMatch );
		return () => {
			toggle.removeEventListener( 'click', onClick );
			panel.removeEventListener( 'beforematch', onMatch );
		};
	} );

	// SPEC: as core's: a link to something in a closed answer opens it.
	const openTarget = () => {
		let hash: string;
		try {
			hash = decodeURIComponent( location.hash.slice( 1 ) );
		} catch {
			// FIX: a malformed fragment (`#100%`) throws, which would stop the enhancing.
			return;
		}
		const target = hash ? document.getElementById( hash ) : null;
		for ( const parts of items ) {
			if ( target && parts.panel.contains( target ) ) {
				setOpen( parts, true );
			}
		}
	};
	window.addEventListener( 'hashchange', openTarget );
	openTarget();

	return () => {
		window.removeEventListener( 'hashchange', openTarget );
		for ( const cleanup of cleanups ) {
			cleanup();
		}
		for ( const { item, toggle, panel } of items ) {
			item.removeAttribute( 'data-open' );
			toggle.removeAttribute( 'aria-expanded' );
			toggle.removeAttribute( 'aria-controls' );
			panel.removeAttribute( 'role' );
			panel.removeAttribute( 'aria-labelledby' );
			panel.removeAttribute( 'hidden' );
		}
		for ( const element of added ) {
			element.removeAttribute( 'id' );
		}
		delete accordion.dataset.enhanced;
	};
}
