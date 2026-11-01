/**
 * The props WordPress hands the finder, from the block's attributes and the site's settings
 * (`ucf_degrees_degree_finder_settings()` in plugins/ucf-degrees/ucf-degrees.php). Shared by
 * the editor and the front end.
 */
import type { DegreeFinderProps } from '../../DegreeFinder.tsx';

export type FinderSettings = Pick<
	DegreeFinderProps,
	'apiRoot' | 'searchUrl' | 'programType'
>;

declare global {
	interface Window {
		/** Set for the editor by plugins/ucf-degrees/ucf-degrees.php. */
		ucfDegreeFinderSettings?: FinderSettings;
	}
}

/**
 * Read the settings render.php writes on the container. Bad or missing JSON falls back to the
 * component's own defaults rather than breaking the page.
 *
 * @param json The container's data attribute.
 * @return The props to pass.
 */
export function readSettings( json: string | undefined ): FinderSettings {
	if ( ! json ) {
		return {};
	}

	try {
		const value: unknown = JSON.parse( json );
		return value && typeof value === 'object'
			? ( value as FinderSettings )
			: {};
	} catch {
		return {};
	}
}
