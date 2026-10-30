/**
 * The compositions a Section can apply, with their editor labels.
 *
 * SYNC: tokens/tokens.json `composition`. Section.test.tsx fails when the two differ.
 * WHY a copy, not read from tokens.json: the package is built from components/ only, and the
 * core may not import anything at runtime that isn't in its own folder.
 */
export const COMPOSITIONS = [
	{ value: 'light', label: 'Light - Default' },
	{ value: 'alt', label: 'Light Alt' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'dark-alt', label: 'Dark Alt' },
	{ value: 'gold', label: 'Bold Gold' },
] as const;

export type Composition = ( typeof COMPOSITIONS )[ number ][ 'value' ];
