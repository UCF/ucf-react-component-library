/**
 * The Pullquote for Puck, where editors place it on its own: Puck has no core blocks. Its
 * fields and defaults are its props (Pullquote.props.ts).
 */
import Pullquote from '../../Pullquote.tsx';
import { puckFields } from '@/integrations/puck/config';
// WHY a type from integrations/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS, type PullquoteEditableProps } from '../../Pullquote.props.ts';

const config: PuckComponentConfig< PullquoteEditableProps > = {
	label: 'Pullquote',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the primitive's own props; Puck's `id`, `puck` and `editMode` would
	// reach the markup.
	render: ( { value, citation } ) => (
		<Pullquote value={ value } citation={ citation } />
	),
};

export default config;
