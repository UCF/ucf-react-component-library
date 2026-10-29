/**
 * Storybook: the component catalog. Every `*.stories.tsx` under components/ is a page.
 *
 * WHY React from the React-Vite framework rather than wp-scripts: stories render the core
 * component the way any React host does. The WordPress block is checked in WordPress itself.
 */
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
	stories: [ '../components/**/*.stories.@(ts|tsx)' ],
	addons: [ '@storybook/addon-a11y', '@storybook/addon-vitest' ],
	// WHY: serves .storybook/public/ at the root, so the logo and favicon load by name.
	staticDirs: [ './public' ],
	framework: '@storybook/react-vite',
};

export default config;
