/**
 * The Table for Puck, where editors place it on its own: Puck has no core blocks. Its fields and
 * defaults are its props (Table.props.ts).
 */
import Table from '../../Table.tsx';
import { puckFields } from '@/integrations/puck/config';
// WHY a type from integrations/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS, type TableEditableProps } from '../../Table.props.ts';

const config: PuckComponentConfig< TableEditableProps > = {
	label: 'Table',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would
	// reach the markup.
	render: ( { variant, caption, rows } ) => (
		<Table variant={ variant } caption={ caption } rows={ rows } />
	),
};

export default config;
