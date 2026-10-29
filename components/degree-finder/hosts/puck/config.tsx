/**
 * The Degree Finder for Puck: a plain config object, so this library needs no Puck dependency.
 *
 * WHY no apiRoot or searchUrl field: those are site settings, not something an editor picks
 * per page. A Puck site that needs other values wraps `render` and passes them.
 */
import DegreeFinder from '../../DegreeFinder.tsx';
import { DEFAULTS } from '../../defaults.ts';
import type { PuckComponentConfig } from '../../../shared/puck.ts';

type Props = {
	/** A program type slug, or '' to ask the visitor. */
	programType: string;
};

const config: PuckComponentConfig< Props > = {
	label: 'Degree Finder',
	fields: {
		programType: {
			type: 'select',
			label: 'Degree type',
			options: [
				{ value: '', label: 'Ask the visitor' },
				...DEFAULTS.programTypes.map( ( type ) => ( {
					value: type.slug,
					label: type.label,
				} ) ),
			],
		},
	},
	defaultProps: { programType: '' },
	render: ( { programType } ) => (
		<DegreeFinder programType={ programType || undefined } />
	),
};

export default config;
