/**
 * Storybook: color contrast measured in the browser, for checks axe can't make.
 */

/**
 * A color as it shows over a solid ground, read back as pixels. WHY a canvas: Chromium reports
 * `color-mix()` as `color(srgb …)`, which a canvas reads and parsing doesn't.
 *
 * @param color  A CSS color, perhaps translucent.
 * @param ground The opaque color under it.
 */
export function over( color: string, ground: string ) {
	const context = document
		.createElement( 'canvas' )
		.getContext( '2d', { willReadFrequently: true } );
	if ( ! context ) {
		throw new Error( 'no canvas' );
	}
	context.fillStyle = ground;
	context.fillRect( 0, 0, 1, 1 );
	context.fillStyle = color;
	context.fillRect( 0, 0, 1, 1 );
	return [ ...context.getImageData( 0, 0, 1, 1 ).data.slice( 0, 3 ) ];
}

/**
 * WCAG 2's contrast ratio of two opaque colors.
 *
 * @param a One color's red, green and blue, 0 to 255.
 * @param b The other's.
 */
export function contrast( a: number[], b: number[] ) {
	const luminance = ( rgb: number[] ) => {
		const [ r = 0, g = 0, b2 = 0 ] = rgb.map( ( value ) => {
			const c = value / 255;
			return c <= 0.04045 ? c / 12.92 : ( ( c + 0.055 ) / 1.055 ) ** 2.4;
		} );
		return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
	};
	const [ light, dark ] = [ luminance( a ), luminance( b ) ].sort(
		( x, y ) => y - x
	);
	return ( ( light ?? 0 ) + 0.05 ) / ( ( dark ?? 0 ) + 0.05 );
}
