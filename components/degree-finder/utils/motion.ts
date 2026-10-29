import type { CSSProperties } from 'react';

/**
 * How long exit animations run. Elements stay mounted this long so they can fade out.
 *
 * SYNC: --udf-exit-duration in style.css.
 */
export const EXIT_MS = 160;

/**
 * The delay to wait before removing an element.
 *
 * A11Y: 0 when the visitor prefers reduced motion (or there is no browser to ask).
 *
 * @return Milliseconds.
 */
export function exitDuration(): number {
	if (
		typeof window === 'undefined' ||
		typeof window.matchMedia !== 'function'
	) {
		return 0;
	}

	return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		? 0
		: EXIT_MS;
}

/**
 * Staggers a group's entrance, 30ms apart, so cards arrive in order rather than all at once.
 *
 * PERF: capped at 180ms so long lists stay snappy: with the 200ms entrance, nothing takes
 * longer than 380ms to appear.
 *
 * @param index The item's position in its group.
 * @return The style that sets its delay.
 */
export function stagger( index: number ): CSSProperties {
	return {
		'--udf-delay': `${ Math.min( index, 6 ) * 30 }ms`,
	} as CSSProperties;
}
