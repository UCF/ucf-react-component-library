/**
 * CONTEXT: the compositions (a section's colors: Light, Dark, Bold Gold…), with their editor
 * labels: a choice any component's props can offer. The Section applies one to its band; the
 * Card offers one as its own colors.
 *
 * WHY here, not in the Section: the list is the tokens', not the Section's, and a component
 * imports shared code, never another component.
 * SYNC: tokens/tokens.json `composition`. integrations/tests/compositions.test.ts fails when
 * the two differ.
 * WHY a copy, not read from tokens.json: the npm package ships integrations/schema but not
 * tokens.json, and a content component may import only its own files and this shared code at
 * runtime.
 */
export const COMPOSITIONS = [
	{ value: 'light', label: 'Light - Default' },
	{ value: 'alt', label: 'Light Alt' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'dark-alt', label: 'Dark Alt' },
	{ value: 'gold', label: 'Bold Gold' },
] as const;

export type Composition = ( typeof COMPOSITIONS )[ number ][ 'value' ];
