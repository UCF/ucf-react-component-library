/**
 * CONTEXT: the Section Nav's script: the phone menu button, marking the section in view, and
 * flagging when the bar is stuck.
 *
 * WHY on top of the markup: the links work without it (docs/architecture.md, "An accordion is
 * content").
 * WHY plain DOM: WordPress runs it as a viewScript (integrations/wp/view.ts); React calls it
 * from an effect.
 */

// SYNC: the class names in SectionNav.tsx and style.css.
const LIST = '.ucf-c-section-nav__list';
const LINK = '.ucf-c-section-nav__link';
const TOGGLE = 'ucf-c-section-nav__toggle';

let count = 0;

/**
 * Enhances one Section Nav.
 *
 * @param nav           The Section Nav's `<nav>`.
 * @param options       Options.
 * @param options.label The button's text.
 * @return A cleanup function that undoes it.
 */
export function enhanceSectionNav(
	nav: HTMLElement,
	{ label = 'Skip to Section' }: { label?: string } = {}
): () => void {
	const list = nav.querySelector< HTMLElement >( LIST );
	// WHY skip with no links: the button would open nothing. Hosts call again once links exist.
	if ( ! list?.querySelector( LINK ) || nav.dataset.enhanced !== undefined ) {
		return () => {};
	}
	nav.dataset.enhanced = '';
	list.id ||= `ucf-section-nav-${ ++count }`;

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
	// SPEC: Bootstrap's collapse: height slides over 0.35s, ease.
	// WHY the Web Animations API: CSS can't transition height to `auto` in every browser.
	let motion: Animation | undefined;
	const setOpen = ( open: boolean ) => {
		toggle.setAttribute( 'aria-expanded', String( open ) );
		// WHY measure first: a second tap reverses from mid-slide.
		const from = nav.hasAttribute( 'data-open' )
			? list.getBoundingClientRect().height
			: 0;
		motion?.cancel();
		motion = undefined;
		const slides =
			typeof list.animate === 'function' &&
			toggle.checkVisibility?.() &&
			matchMedia( '(prefers-reduced-motion: no-preference)' ).matches;
		if ( ! slides ) {
			nav.toggleAttribute( 'data-open', open );
			return;
		}
		// WHY open while closing: the links stay visible until the slide ends.
		nav.toggleAttribute( 'data-open', true );
		const to = open ? list.getBoundingClientRect().height : 0;
		motion = list.animate(
			[
				{ height: `${ from }px`, overflow: 'hidden' },
				{ height: `${ to }px`, overflow: 'hidden' },
			],
			{ duration: 350, easing: 'ease' }
		);
		motion.onfinish = () => {
			motion = undefined;
			nav.toggleAttribute( 'data-open', open );
		};
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
	// A11Y: Escape closes and refocuses the button (WAI-ARIA disclosure).
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
	// WHY a frame: layout is read at most once per frame while scrolling.
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
		motion?.cancel();
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
