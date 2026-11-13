/**
 * The Separator for Puck, where editors place it on its own: Puck has no core blocks. Its
 * fields and defaults are its props (Separator.props.ts).
 */
import Separator from '../../Separator.tsx';
import { puckFields } from '@/integrations/puck/config';
// WHY a type from integrations/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS, type SeparatorEditableProps } from '../../Separator.props.ts';

const config: PuckComponentConfig< SeparatorEditableProps > = {
	label: 'Separator',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would
	// reach the markup.
	render: ( { variant } ) => <Separator variant={ variant } />,
};

export default config;
