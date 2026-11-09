/**
 * CONTEXT: the photo every story with an image shows: Knightro in a rubber duck float in the
 * Reflecting Pond, a crowd behind.
 *
 * WHY only stories: the components' example.json keep a small drawn sample (a data URI). The
 * WordPress inserter preview, the markup tests and the Puck templates read it, and the Puck
 * templates ship in the npm package, where a separate file wouldn't be found.
 * WHY imported, not a public/ path: Vite gives an import a URL that works in Storybook, its
 * static build and the story tests alike.
 */
import url from './assets/placeholder.jpg';

export const PLACEHOLDER_IMAGE = url;

/** What it shows, for a story where the image carries meaning. */
export const PLACEHOLDER_ALT =
	'Knightro, UCF’s mascot, in a rubber duck float in the Reflecting Pond, with a crowd of students behind';
