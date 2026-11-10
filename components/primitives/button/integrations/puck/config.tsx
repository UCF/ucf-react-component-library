/**
 * The Button for Puck, where editors place it on its own: Puck has no core blocks. Its fields and
 * defaults are its props (Button.props.ts).
 */
import Button from '../../Button.tsx';
import { puckFields } from '@/integrations/puck/config';
// WHY a type from integrations/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS, type ButtonEditableProps } from '../../Button.props.ts';

const config: PuckComponentConfig< ButtonEditableProps > = {
	label: 'Button',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the Button's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup (see PuckRenderProps in integrations/puck/types.ts).
	render: ( { text, url, linkTarget, variant, fontSize, className } ) => (
		<Button
			className={ className || undefined }
			text={ text }
			url={ url }
			linkTarget={ linkTarget }
			variant={ variant }
			fontSize={ fontSize }
		/>
	),
};

export default config;
