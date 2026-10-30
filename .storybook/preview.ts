/**
 * What every story loads: the token values and the compositions, as a React host would.
 *
 * SYNC: `npm run storybook` runs build:tokens first, which writes dist/tokens/base.css.
 */
import type { Decorator, Preview } from '@storybook/react-vite';
import { createElement } from 'react';

import Section from '../components/section/Section.tsx';
import type { SectionProps } from '../components/section/Section.tsx';
import type { Composition } from '../components/section/compositions.ts';
import '../components/section/style.css';
import tokens from '../tokens/tokens.json';
// WHY base.css, not the package's ucf.css: stories import their component's source style.css,
// so a CSS edit shows without rebuilding the package.
import '../dist/tokens/base.css';
// WHY: headings and copy in a story look as they do on a UCF page, as in the block theme.
import '../styles/elements.css';

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

// WHY every story inside the real Section: that is how a page places a component, in a band
// that sets the composition, so a story shows the component as it will look. Every role in it
// re-resolves from the Section, and the element styles apply inside it.
// A story that is a Section itself (Section.stories.tsx) sets `parameters.section: false`.
const withSection: Decorator = ( Story, context ) =>
	context.parameters.section === false
		? createElement( Story )
		: createElement(
				Section,
				{
					composition: ( context.globals.composition ??
						'light' ) as Composition,
					width: ( context.globals.width ??
						'default' ) as SectionProps[ 'width' ],
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
		// The width of the Section around each story: its Default (the theme's wide size) or
		// Constrained (the reading width), to see a component at either.
		width: {
			description:
				'The content width of the Section the component sits in',
			toolbar: {
				title: 'Width',
				icon: 'expandalt',
				items: [
					{ value: 'default', title: 'Default' },
					{ value: 'constrained', title: 'Constrained' },
				],
				dynamicTitle: true,
			},
		},
	},
	// WHY from the environment: the story tests run once per composition (vitest.config.mts).
	// In Storybook itself it is unset, so stories open on Light.
	initialGlobals: {
		composition: import.meta.env.VITE_UCF_COMPOSITION ?? 'light',
		width: 'default',
	},
	decorators: [ withSection ],
	parameters: {
		// WHY fullscreen: the Section is a full-width band with its own padding.
		layout: 'fullscreen',
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
