/**
 * Runs after every story test (vitest.config.mts, the `storybook:*` projects).
 *
 * FIX: an accessibility check on the wrong page passes. If a project's composition never
 * reached the story, every project would quietly test Light and pass. So each story must have
 * rendered inside the composition its project names, with a component in it.
 */
import { afterEach, expect } from 'vitest';

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
} );
