/**
 * Vitest, through `wp-scripts test-unit-js`. Two projects, each with its own command:
 *
 *   unit        `npm test`. The markup contract, the data clients, the Puck configs and the
 *               token checks, in Node.
 *   storybook   `npm run test:stories`. Every story, rendered in headless Chromium by @storybook/addon-vitest. A story
 *               passes if it renders without error and, because preview.ts sets the a11y
 *               add-on's `test: 'error'`, with no accessibility violation.
 *
 * WHY node for unit, not jsdom: those tests render to strings or call a client with a fake
 * fetch, and need no DOM. Behavior tests (keyboard, focus, announcements) belong in the
 * storybook project instead, as `play` functions, where a real browser runs them (docs/todo.md).
 *
 * UPSTREAM: the storybook project needs Playwright's Chromium on the machine. `npx storybook add
 * @storybook/addon-vitest` installed it; elsewhere, `npx playwright install chromium`.
 *
 * WHY two commands: the storybook project downloads and starts a browser, which slows every
 * test run and catches only structural accessibility problems (docs/todo.md). CI runs both;
 * locally, run test:stories when you change a story or a component's markup.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname( fileURLToPath( import.meta.url ) );

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
				},
			},
			{
				extends: true,
				plugins: [
					// UPSTREAM: reads the stories and preview from the Storybook config.
					// Options: https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
					storybookTest( {
						configDir: path.join( dirname, '.storybook' ),
					} ),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						// FIX: reduced motion, so the finder's entrance animations are off. Mid-fade text
						// has near-zero opacity, and the accessibility check skips text it cannot see:
						// a story checked before its fade finished passed with unreadable colors.
						provider: playwright( {} ),
						instances: [ { browser: 'chromium' } ],
					},
				},
			},
		],
	},
} );
