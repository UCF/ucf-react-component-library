/**
 * The Heading for Puck, where editors place it on its own: Puck has no core blocks.
 *
 * WHY the level is a string here: Puck's select options are strings; the Heading takes a number,
 * as core stores it.
 */
import Heading, { type HeadingLevel } from '../../Heading.tsx';
// WHY a type from components/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';

type Props = {
	content: string;
	className: string;
	level: `${ HeadingLevel }`;
};

const config: PuckComponentConfig< Props > = {
	label: 'Heading',
	fields: {
		content: { type: 'text', label: 'Text' },
		// WHY: core's "Additional CSS class(es)". A component's template names a part with it
		// (the Highlight's statement, the Hero's title), the same class WordPress's template sets, so
		// the part looks the same in both hosts.
		className: { type: 'text', label: 'CSS class' },
		level: {
			type: 'select',
			label: 'Level',
			options: [ '1', '2', '3', '4', '5', '6' ].map( ( value ) => ( {
				value,
				label: `H${ value }`,
			} ) ),
		},
	},
	defaultProps: { content: 'Heading', level: '2', className: '' },
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup.
	render: ( { content, level, className } ) => (
		<Heading
			content={ content }
			className={ className || undefined }
			level={ Number( level ) as HeadingLevel }
		/>
	),
};

export default config;
