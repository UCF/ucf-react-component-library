/**
 * Front end: mounts the Degree Finder in every block on the page.
 *
 * WHY createRoot from `@wordpress/element`: it is WordPress's copy of React, so the page loads
 * React once however many plugins use it.
 */
import { createRoot } from '@wordpress/element';

import DegreeFinder from '../../DegreeFinder.tsx';
import '../../style.css';
import './alignment.css';
import { readSettings } from './settings.ts';

function start() {
	document
		.querySelectorAll< HTMLElement >( '[data-ucf-degree-finder]' )
		.forEach( ( container ) => {
			const settings = readSettings( container.dataset.ucfDegreeFinder );
			createRoot( container ).render( <DegreeFinder { ...settings } /> );
		} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', start );
} else {
	start();
}
