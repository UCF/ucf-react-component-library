/** CONTEXT: front end: runs behavior.ts on every Section Nav on the page. */
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
