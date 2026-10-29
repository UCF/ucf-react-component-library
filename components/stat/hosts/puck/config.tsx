/**
 * The Stat for Puck: a plain config object, so this library needs no Puck dependency.
 *
 * WHY only string props: Puck stores what the fields hold, and the same plain strings are
 * what the WordPress block stores, so content can move between the two hosts as-is.
 */
import Stat from '../../Stat.tsx';
// WHY the attribute: the npm package is plain ES modules, and Node will not import JSON
// without it. Bundlers accept it too.
import example from '../../example.json' with { type: 'json' };
import type { PuckComponentConfig } from '../../../shared/puck.ts';

type Props = {
	statement: string;
	detail: string;
	source: string;
	sourceUrl: string;
	asOf: string;
};

const config: PuckComponentConfig< Props > = {
	label: 'Stat',
	fields: {
		statement: { type: 'textarea', label: 'Statement' },
		detail: { type: 'textarea', label: 'Supporting sentence' },
		source: { type: 'text', label: 'Published by' },
		sourceUrl: { type: 'text', label: 'Link' },
		asOf: { type: 'text', label: 'As of' },
	},
	defaultProps: example,
	render: ( props ) => <Stat { ...props } />,
};

export default config;
