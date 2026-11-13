/**
 * The Heading for Puck, where editors place it on its own: Puck has no core blocks. Its fields and
 * defaults are its props (Heading.props.ts).
 */
import Heading, { type HeadingLevel } from '../../Heading.tsx';
import { puckFields } from '@/core/hosts/puck/fields';
// WHY a type from core/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/core/hosts/puck/types';
import { defaultsIn } from '@/core/define/props';
import { PROPS, type HeadingEditableProps } from '../../Heading.props.ts';

const config: PuckComponentConfig< HeadingEditableProps > = {
	label: 'Heading',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
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
