/**
 * The List for Puck, where editors place it on its own: Puck has no core blocks. Its fields and
 * defaults are its props (List.props.ts).
 */
import List from '../../List.tsx';
import { puckFields } from '@/integrations/puck/config';
// WHY a type from integrations/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS, type ListEditableProps } from '../../List.props.ts';

const config: PuckComponentConfig< ListEditableProps > = {
	label: 'List',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would
	// reach the markup.
	render: ( { variant, items } ) => (
		<List variant={ variant } items={ items } />
	),
};

export default config;
