/**
 * The Paragraph for Puck, where editors place it on its own: Puck has no core blocks. Its fields
 * and defaults are its props (Paragraph.props.ts).
 */
import Paragraph from '../../Paragraph.tsx';
import { puckFields } from '@/core/hosts/puck/fields';
// WHY a type from core/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/core/hosts/puck/types';
import { defaultsIn } from '@/core/define/props';
import { PROPS, type ParagraphEditableProps } from '../../Paragraph.props.ts';

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
