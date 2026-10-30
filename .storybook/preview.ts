/**
 * What every story loads: the token values and the compositions, as a React host would.
 *
 * SYNC: `npm run storybook` runs build:tokens first, which writes dist/tokens/base.css.
 */
import type { Decorator, Preview } from '@storybook/react-vite';
import { createElement } from 'react';

import tokens from '../tokens/tokens.json';
// WHY base.css, not the package's ucf.css: stories import their component's source style.css,
// so a CSS edit shows without rebuilding the package.
import '../dist/tokens/base.css';

// WHY read from tokens.json: a composition added there shows up in the toolbar with no
// second edit.
const compositions = Object.entries( tokens.composition )
	.filter( ( [ key ] ) => ! key.startsWith( '$' ) )
	.map( ( [ value, c ] ) => ( {
		value,
		title:
			typeof c === 'object' && '$extensions' in c
				? c.$extensions[ 'edu.ucf' ].name
				: value,
	} ) );

// WHY a wrapper, not the story's own markup: this is how a host places a component, inside a
// section that sets the composition. Every role in the component re-resolves from it.
const withComposition: Decorator = ( Story, context ) =>
	createElement(
		'div',
		{
			className: `ucf-composition-${ String(
				context.globals.composition ?? 'light'
			) }`,
			style: { padding: 'var(--ucf-spacing-60)' },
		},
		createElement( Story )
	);

const preview: Preview = {
	globalTypes: {
		composition: {
			description: 'The section background the component sits on',
			toolbar: {
				title: 'Composition',
				icon: 'paintbrush',
				items: compositions,
				dynamicTitle: true,
			},
		},
	},
	// WHY from the environment: the story tests run once per composition (vitest.config.mts).
	// In Storybook itself it is unset, so stories open on Light.
	initialGlobals: {
		composition: import.meta.env.VITE_UCF_COMPOSITION ?? 'light',
	},
	decorators: [ withComposition ],
	parameters: {
		// WHY: content before interactive, the order the architecture doc explains them in.
		// Each group says where its components render (docs/architecture.md, "Two kinds of
		// component"): Content (Server) works without JavaScript; Interactive (Client) needs
		// it. Each component's meta also carries a `server` or `client` tag, so the sidebar's
		// tag filter can show one kind.
		options: {
			storySort: {
				order: [ 'Content (Server)', 'Interactive (Client)' ],
			},
		},
		a11y: {
			// WHY 'error': an accessibility violation fails the story, the way a test would.
			test: 'error',
		},
	},
};

export default preview;
