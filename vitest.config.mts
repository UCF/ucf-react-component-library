/**
 * Vitest, through `wp-scripts test-unit-js`. Two kinds of project, each with its own command:
 *
 *   unit          `npm test`. The markup contract, the block round-trips, WordPress and Puck
 *                 parity, the data clients, the Puck configs and the token checks, in Node
 *                 (happy-dom for the files that load the block editor).
 *   storybook:*   `npm run test:stories`. Every story, rendered in headless Chromium by
 *                 @storybook/addon-vitest, once per composition and width. A story passes if it
 *                 renders without error, inside its composition, and, because preview.ts sets
 *                 the a11y add-on's `test: 'error'`, with no accessibility violation.
 *
 * WHY node for unit, not a browser: those tests render to strings or call a client with a fake
 * fetch. Behavior tests (keyboard, focus, announcements) belong in the storybook projects
 * instead, as `play` functions, where a real browser runs them (docs/todo.md).
 *
 * UPSTREAM: the storybook project needs Playwright's Chromium on the machine. `npx storybook add
 * @storybook/addon-vitest` installed it; elsewhere, `npx playwright install chromium`.
 *
 * WHY two commands: the storybook projects start a browser, which slows every test run. Run
 * test:stories when you change a story, a component's markup or its CSS.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import tokens from './tokens/tokens.json' with { type: 'json' };

const dirname = path.dirname( fileURLToPath( import.meta.url ) );

// Every composition in tokens.json, so a new one is tested with no edit here.
const COMPOSITIONS = Object.keys( tokens.composition ).filter(
	( key ) => ! key.startsWith( '$' )
);

// SPEC: the same three widths as the UCF block themes' accessibility suites.
const VIEWPORTS = {
	desktop: { width: 1280, height: 900 },
	tablet: { width: 780, height: 1024 },
	mobile: { width: 360, height: 740 },
};

export default defineConfig( {
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: [
						'components/**/*.test.{ts,tsx}',
						'scripts/**/*.test.mjs',
					],
					environment: 'node',
					// UPSTREAM: @wordpress/blocks imports its own JSON without `with { type: 'json' }`,
					// which Node refuses. Bundling @wordpress/* through Vite, as webpack does for
					// the plugins, lets the block tests load the real block API.
					server: { deps: { inline: [ /@wordpress\// ] } },
				},
			},
			// One project per composition and width: `storybook:dark:mobile` and so on.
			// WHY: a component reads its colors from the section it sits on, so passing on Light
			// proves nothing about Dark or Bold Gold, and a layout can break at one width only.
			// This is the block themes' per-variant tier, run against every story.
			...COMPOSITIONS.flatMap( ( composition ) =>
				Object.entries( VIEWPORTS ).map( ( [ width, viewport ] ) => ( {
					extends: true,
					plugins: [
						// UPSTREAM: reads the stories and preview from the Storybook config.
						// Options: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
						storybookTest( {
							configDir: path.join( dirname, '.storybook' ),
						} ),
					],
					// SYNC: .storybook/preview.ts starts every story on this composition, and
					// .storybook/vitest.setup.ts checks that it did.
					define: {
						'import.meta.env.VITE_UCF_COMPOSITION':
							JSON.stringify( composition ),
					},
					test: {
						name: `storybook:${ composition }:${ width }`,
						setupFiles: [ './.storybook/vitest.setup.ts' ],
						browser: {
							enabled: true,
							headless: true,
							provider: playwright( {} ),
							instances: [ { browser: 'chromium' as const } ],
							viewport,
						},
					},
				} ) )
			),
		],
	},
} );
