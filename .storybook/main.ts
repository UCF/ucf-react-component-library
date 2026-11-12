/**
 * Storybook: the component catalog. Every `*.stories.tsx` under components/ is a page.
 *
 * WHY React from the React-Vite framework rather than wp-scripts: stories render the core
 * component the way any React host does. The WordPress block is checked in WordPress itself.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';

const root = path.resolve(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'..'
);

const config: StorybookConfig = {
	stories: [ '../components/**/*.stories.@(ts|tsx)' ],
	addons: [ '@storybook/addon-a11y', '@storybook/addon-vitest' ],
	// WHY: serves .storybook/public/ at the root, so the logo and favicon load by name.
	staticDirs: [ './public' ],
	framework: '@storybook/react-vite',
	// SYNC: `@/`, the repo root, as tsconfig.json `paths` defines it.
	viteFinal: ( vite ) => ( {
		...vite,
		resolve: {
			...vite.resolve,
			alias: [
				...( Array.isArray( vite.resolve?.alias )
					? vite.resolve.alias
					: [] ),
				{ find: /^@\//, replacement: `${ root }/` },
			],
		},
	} ),
};

export default config;
