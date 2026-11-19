/**
 * Step 2 · every component · compositions as a Colors prop's choices: a layer over the design
 * tokens.
 *
 *   tokens/tokens.json        defines each composition: Light, Dark, Bold Gold…
 *     → npm run build:tokens  turns each into a CSS class, `.ucf-composition-dark`
 *       → this file           lists their names and labels, so a Colors setting can offer them
 *
 * A component offers them with `options: [ ...COMPOSITIONS ]` (props.ts). Picking one adds
 * the class; the colors themselves come from the CSS, never from here.
 *
 * WHY a copy, not tokens.json: the npm package ships core/ but not tokens/.
 * core/testing/suites/compositions.test.ts fails while the two differ.
 */

export const COMPOSITIONS = [
	{ value: 'light', label: 'Light - Default' },
	{ value: 'alt', label: 'Light Alt' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'dark-alt', label: 'Dark Alt' },
	{ value: 'gold', label: 'Bold Gold' },
] as const;

export type Composition = ( typeof COMPOSITIONS )[ number ][ 'value' ];
