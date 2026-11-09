/**
 * The Paragraph for Puck, where editors place it on its own: Puck has no core blocks.
 */
import Paragraph from '../../Paragraph.tsx';
import example from '../../example.json' with { type: 'json' };
// WHY a type from components/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '#integrations/puck/types.js';

type Props = {
	content: string;
	className: string;
};

const config: PuckComponentConfig< Props > = {
	label: 'Paragraph',
	fields: {
		content: { type: 'textarea', label: 'Text' },
		// WHY: core's "Additional CSS class(es)". A component's template names a part with it
		// (the Highlight's statement, the Hero's title), the same class WordPress's template sets, so
		// the part looks the same in both hosts.
		className: { type: 'text', label: 'CSS class' },
	},
	defaultProps: { ...example, className: '' },
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup.
	render: ( { content, className } ) => (
		<Paragraph content={ content } className={ className || undefined } />
	),
};

export default config;
