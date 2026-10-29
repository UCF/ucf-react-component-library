/**
 * The Storybook interface itself: the sidebar, toolbar and panels, not the stories.
 *
 * WHY colors from tokens.json, not typed here: the interface is themed with the same values
 * the components use, so a token change reaches the catalog too.
 * UPSTREAM: Storybook's theme takes plain color strings, not CSS custom properties, because
 * the interface is a separate page from the stories and never loads the library's CSS.
 *
 * SPEC: dark, like the black band of the UCF header. Gold only behind black text, or as an
 * accent on black (the brand rule the components follow), so gold marks the selected toolbar
 * tab on the black toolbar and nothing puts white text on it.
 *
 * UPSTREAM: in a dark theme Storybook paints the selected sidebar item with `colorSecondary`
 * darkened by 18%, under white text. Gold there would be white on dark gold, about 3:1 and
 * against the brand rule. Horizon Blue darkened is about 6.9:1 under white, and Horizon Blue is
 * the brand's color for links on dark backgrounds.
 */
import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

import tokens from '../tokens/tokens.json';

const c = ( slug: keyof typeof tokens.color ) => {
	const token = tokens.color[ slug ];
	return typeof token === 'object' ? token.$value : String( token );
};
const family = ( slug: 'display' | 'body' | 'mono' ) =>
	tokens[ 'font-family' ][ slug ].$value;

// SPEC: the name in the display face, as UCF headings are; the tagline in the body face, in
// Bold Gold, which the brand allows as text on black. Fonts and color are read from
// tokens.json here because manager-head.html can't.
// A11Y: gold is 11.46:1 on the black sidebar.
// SYNC: the layout is `.ucf-brand` in manager-head.html; the name is NAME there too.
const brand = `<span class="ucf-brand">
	<img src="./ucf-logo.png" width="30" height="30" alt="" />
	<span class="ucf-brand__text">
		<span class="ucf-brand__name" style="font-family: ${ family(
			'display'
		) }">UCF Storybook</span>
		<span class="ucf-brand__tag" style="color: ${ c(
			'gold'
		) }">Component Library</span>
	</span>
</span>`;

addons.setConfig( {
	theme: create( {
		base: 'dark',

		// UPSTREAM: Storybook shows either `brandImage` or `brandTitle`, never both. With no
		// brandImage it renders brandTitle as HTML, which is how the logo and the name sit side
		// by side. The alt is empty because the name follows it.
		// SYNC: the image is in .storybook/public/, served at the root by `staticDirs` in
		// main.ts; its size and the layout are in manager-head.html (`.ucf-brand`).
		brandTitle: brand,
		// WHY './' and not '/': the logo returns to the catalog's start page, and a relative URL
		// keeps working when the static build is hosted under a subpath.
		brandUrl: './',
		brandTarget: '_self',

		colorPrimary: c( 'gold' ),
		colorSecondary: c( 'horizon' ),

		// SPEC: black throughout, sidebar included, like the UCF header. Areas are told apart by
		// the gray-800 dividers (appBorderColor) rather than by shade.
		appBg: c( 'black' ),
		appContentBg: c( 'black' ),
		// WHY white: the canvas behind a story. The Composition toolbar paints the section
		// itself, so the default (Light) shows a component as it sits on most pages.
		appPreviewBg: c( 'white' ),
		appBorderColor: c( 'gray-800' ),
		appBorderRadius: 0,

		textColor: c( 'white' ),
		textInverseColor: c( 'black' ),
		// A11Y: gray-300 is 10.02:1 on black and 8.13:1 on gray-900.
		textMutedColor: c( 'gray-300' ),

		barBg: c( 'black' ),
		barTextColor: c( 'white' ),
		barSelectedColor: c( 'gold' ),
		barHoverColor: c( 'gold' ),

		inputBg: c( 'black' ),
		// A11Y: control boundaries need 3:1; gray-400 is 6.25:1 on black, 5.07:1 on gray-900.
		inputBorder: c( 'gray-400' ),
		inputTextColor: c( 'white' ),
		inputBorderRadius: 0,

		buttonBg: c( 'gray-900' ),
		buttonBorder: c( 'gray-400' ),
		booleanBg: c( 'gray-800' ),
		// A11Y: white on horizon-deep is 5.86:1.
		booleanSelectedBg: c( 'horizon-deep' ),

		// SYNC: manager-head.html loads Montserrat and Roboto Mono for this page.
		fontBase: family( 'body' ),
		fontCode: family( 'mono' ),
	} ),
} );
