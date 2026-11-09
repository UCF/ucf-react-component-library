/**
 * Compositions: a section's colors, a choice any component's props can offer.
 *
 * SYNC: tokens/tokens.json `composition`; integrations/tests/compositions.test.ts checks.
 * WHY a copy: the npm package ships this folder but not tokens.json.
 */

export const COMPOSITIONS = [
	{ value: 'light', label: 'Light - Default' },
	{ value: 'alt', label: 'Light Alt' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'dark-alt', label: 'Dark Alt' },
	{ value: 'gold', label: 'Bold Gold' },
] as const;

export type Composition = ( typeof COMPOSITIONS )[ number ][ 'value' ];
