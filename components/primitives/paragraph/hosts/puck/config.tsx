/**
 * The Paragraph for Puck, where editors place it on its own: Puck has no core blocks. Its fields
 * and defaults are its props (props.ts).
 */
import Paragraph from '../../Paragraph.tsx';
import { puckFields } from '@/core/hosts/puck/props-to-fields';
// WHY a type from core/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/core/hosts/puck/types';
import { defaultsIn } from '@/core/hosts/read-props';
import { PROPS, type ParagraphEditableProps } from '../../props.ts';

const config: PuckComponentConfig< ParagraphEditableProps > = {
	label: 'Paragraph',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup.
	render: ( { content, className } ) => (
		<Paragraph content={ content } className={ className || undefined } />
	),
};

export default config;
