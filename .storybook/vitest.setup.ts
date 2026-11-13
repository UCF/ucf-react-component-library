/**
 * Runs after every story test (vitest.config.mts, the `storybook:*` projects).
 *
 * FIX: an accessibility check on the wrong page passes. If a project's composition never
 * reached the story, every project would quietly test Light and pass. So each story must have
 * rendered inside the composition its project names, with a component in it, at its width.
 */
import { afterEach, expect } from 'vitest';

import { VIEWPORTS, type Viewport } from './viewports.mts';

afterEach( () => {
	const composition = import.meta.env.VITE_UCF_COMPOSITION;
	const section = document.querySelector(
		`.ucf-composition-${ composition }`
	);

	expect(
		section,
		`the story did not render on ${ composition }`
	).not.toBeNull();
	expect(
		section?.querySelector( '[class*="ucf-c-"]' ),
		'no component rendered inside the section'
	).not.toBeNull();

	// FIX: the same for the width. Storybook sized every story to 1200px whatever the project
	// said, so the narrow widths were never tested (.storybook/viewports.mts).
	const viewport = import.meta.env.VITE_UCF_VIEWPORT as Viewport;
	expect(
		window.innerWidth,
		`the story did not render at the ${ viewport } width`
	).toBe( VIEWPORTS[ viewport ].width );
} );
