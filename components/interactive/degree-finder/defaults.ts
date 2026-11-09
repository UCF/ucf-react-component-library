/**
 * CONTEXT: the Degree Finder's default props. The component, the WordPress block and the Puck
 * config all read them from here, so the three never disagree.
 */
import type { ProgramTypeOption } from './types.ts';

export const DEFAULTS = Object.freeze( {
	// The WordPress REST API root. The client calls two namespaces under it:
	// ucf-degree-search/v1 and wp/v2.
	// SYNC: ucf_degrees_degree_finder_settings() in plugins/ucf-degrees/ucf-degrees.php
	// passes no apiRoot by default, so this one applies.
	apiRoot: 'https://www.ucf.edu/wp-json/',

	// The degree search page that "Explore our Programs" links to.
	// SYNC: the same default in ucf_degrees_degree_finder_settings(), which render.php needs
	// for its no-JavaScript link.
	searchUrl: 'https://www.ucf.edu/degree-search/',

	// WHY these three: minors and certificates are left out on purpose.
	programTypes: Object.freeze( [
		{ slug: 'bachelor', label: 'Bachelors' },
		{ slug: 'master', label: 'Masters' },
		{ slug: 'doctorate', label: 'Doctorates' },
	] ) as readonly ProgramTypeOption[],
} );
