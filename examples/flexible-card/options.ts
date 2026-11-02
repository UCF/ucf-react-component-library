/**
 * The Card's looks with their editor labels, read by the Puck config and the WordPress
 * sidebar so the two never disagree.
 *
 * SPEC: the UCF Brand Block Theme's Card looks. SYNC: examples/fixed-card/options.ts.
 */
export const VARIANTS = {
	label: 'Look',
	options: [
		{ value: 'plain', label: 'Plain' },
		{ value: 'boxed', label: 'Boxed' },
		{ value: 'ruled', label: 'Ruled' },
	],
} as const;

export type Variant = ( typeof VARIANTS.options )[ number ][ 'value' ];
