/**
 * The Section Nav's behavior, added on top of its saved markup, as the old Section Menus
 * plugin's was: a "Skip to Section" button that opens the links on narrow screens, the link to
 * the section in view marked, and a shadow while the bar is stuck to the top of the window.
 *
 * WHY a script on top, not state in the component: the links must be in the saved HTML and work
 * without it (docs/architecture.md, "An accordion is content"). Without this script every link
 * still works, in a row that scrolls across.
 * WHY plain DOM, no React: WordPress runs it as the block's viewScript (integrations/wp/view.ts),
 * and a React site calls it from an effect: `useEffect( () => enhanceSectionNav( nav ), [] )`.
 */

// SYNC: the class names in SectionNav.tsx and style.css.
const LIST = '.ucf-c-section-nav__list';
const LINK = '.ucf-c-section-nav__link';
const TOGGLE = 'ucf-c-section-nav__toggle';

let count = 0;

/**
 * Adds the menu button and the marking of the section in view to one Section Nav.
 *
 * @param nav           The Section Nav's `<nav>`.
 * @param options       What it shows.
 * @param options.label The button's text.
 * @return Undoes it: removes the button and stops watching the page.
 */
export function enhanceSectionNav(
	nav: HTMLElement,
	{ label = 'Skip to Section' }: { label?: string } = {}
): () => void {
	const list = nav.querySelector< HTMLElement >( LIST );
	// WHY not with no links: the menu button would open nothing. A host that adds links later
	// calls this again (as the Puck demo's effect does when its links change).
	if ( ! list?.querySelector( LINK ) || nav.dataset.enhanced !== undefined ) {
		return () => {};
	}
	nav.dataset.enhanced = '';
	list.id ||= `ucf-section-nav-${ ++count }`;

	// The menu button: its text, and a menu icon. CSS shows it on narrow screens only.
	const toggle = document.createElement( 'button' );
	toggle.type = 'button';
	toggle.className = TOGGLE;
	const text = document.createElement( 'span' );
	text.className = `${ TOGGLE }-text`;
	text.textContent = label;
	const icon = document.createElement( 'span' );
	icon.className = `${ TOGGLE }-icon`;
	icon.setAttribute( 'aria-hidden', 'true' );
	toggle.append( text, icon );
	toggle.setAttribute( 'aria-controls', list.id );
	toggle.setAttribute( 'aria-expanded', 'false' );
	const setOpen = ( open: boolean ) => {
		toggle.setAttribute( 'aria-expanded', String( open ) );
		nav.toggleAttribute( 'data-open', open );
	};
	toggle.addEventListener( 'click', () =>
		setOpen( toggle.getAttribute( 'aria-expanded' ) !== 'true' )
	);
	// WHY close on a link: the menu covers the section it jumps to.
	const onClick = ( event: Event ) => {
		if ( ( event.target as Element ).closest( LINK ) ) {
			setOpen( false );
		}
	};
	// A11Y: Escape closes it and returns focus to the button (WAI-ARIA disclosure pattern).
	const onKey = ( event: KeyboardEvent ) => {
		if ( event.key === 'Escape' && nav.hasAttribute( 'data-open' ) ) {
			setOpen( false );
			toggle.focus();
		}
	};
	list.addEventListener( 'click', onClick );
	nav.addEventListener( 'keydown', onKey );
	list.before( toggle );

	// The section in view: the last one whose top has passed under the bar.
	const links = [ ...list.querySelectorAll< HTMLAnchorElement >( LINK ) ];
	const targets = links
		.map( ( link ) => {
			const hash = link.getAttribute( 'href' ) ?? '';
			const target = hash.startsWith( '#' )
				? document.getElementById(
						decodeURIComponent( hash.slice( 1 ) )
					)
				: null;
			return target ? { link, target } : null;
		} )
		.filter( ( item ) => item !== null );
	const mark = () => {
		const bar = nav.getBoundingClientRect();
		// Stuck: held at the top of the window, with page under it. CSS gives it a shadow then.
		nav.toggleAttribute( 'data-stuck', bar.top <= 0 && window.scrollY > 0 );
		const line = bar.bottom + 1;
		let current: HTMLAnchorElement | null = null;
		for ( const { link, target } of targets ) {
			if ( target.getBoundingClientRect().top <= line ) {
				current = link;
			}
		}
		for ( const link of links ) {
			if ( link === current ) {
				link.setAttribute( 'aria-current', 'location' );
			} else {
				link.removeAttribute( 'aria-current' );
			}
		}
	};
	// WHY a frame: the page's layout is read once per frame at most, however fast it scrolls.
	let frame = 0;
	const onScroll = () => {
		if ( ! frame ) {
			frame = requestAnimationFrame( () => {
				frame = 0;
				mark();
			} );
		}
	};
	window.addEventListener( 'scroll', onScroll, { passive: true } );
	window.addEventListener( 'resize', onScroll );
	mark();

	return () => {
		cancelAnimationFrame( frame );
		window.removeEventListener( 'scroll', onScroll );
		window.removeEventListener( 'resize', onScroll );
		list.removeEventListener( 'click', onClick );
		nav.removeEventListener( 'keydown', onKey );
		toggle.remove();
		nav.removeAttribute( 'data-open' );
		nav.removeAttribute( 'data-stuck' );
		delete nav.dataset.enhanced;
		for ( const link of links ) {
			link.removeAttribute( 'aria-current' );
		}
	};
}
