/**
 * Front end: adds the Section Nav's behavior (behavior.ts) to every one on the page.
 * WHY no React: the links are already in the saved HTML; this only adds the menu button and
 * the marking of the section in view.
 */
import { __ } from '@wordpress/i18n';

import { enhanceSectionNav } from '../../behavior.ts';

function start() {
	document
		.querySelectorAll< HTMLElement >( '.ucf-c-section-nav' )
		.forEach( ( nav ) =>
			enhanceSectionNav( nav, {
				label: __( 'Skip to Section', 'ucf-content' ),
			} )
		);
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}
