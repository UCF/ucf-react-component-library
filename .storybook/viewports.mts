/**
 * The widths every story is tested at, one story-test project each (vitest.config.mts), and the
 * same three in Storybook's viewport menu.
 *
 * SPEC: the same three widths as the UCF block themes' accessibility suites.
 * FIX: Storybook's test plugin sizes the page before each story, to its own 1200 × 900 unless the
 * story's `viewport` global names one of its viewports. Vitest's own `browser.viewport` is
 * overridden, so every project rendered at 1200px. preview.ts selects the project's width here
 * instead, and vitest.setup.ts checks the story rendered at it.
 */
export const VIEWPORTS = {
	desktop: { width: 1280, height: 900 },
	tablet: { width: 780, height: 1024 },
	mobile: { width: 360, height: 740 },
} as const;

export type Viewport = keyof typeof VIEWPORTS;

/** The widths as Storybook viewports (`parameters.viewport.options`), named `ucf-desktop` and so on. */
export const STORYBOOK_VIEWPORTS = Object.fromEntries(
	Object.entries( VIEWPORTS ).map( ( [ name, { width, height } ] ) => [
		`ucf-${ name }`,
		{
			name: `UCF ${ name } (${ width }px)`,
			styles: { width: `${ width }px`, height: `${ height }px` },
			type: name === 'desktop' ? 'desktop' : name,
		},
	] )
);
