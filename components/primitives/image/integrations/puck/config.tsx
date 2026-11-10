/**
 * The Image for Puck, where editors place it on its own: Puck has no core blocks. Its fields and
 * defaults are its props (Image.props.ts).
 */
import Image from '../../Image.tsx';
import { puckFields } from '@/integrations/puck/config';
// WHY a type from integrations/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '@/integrations/puck/types';
import { defaultsIn } from '@/integrations/schema/props';
import { PROPS, type ImageEditableProps } from '../../Image.props.ts';

const config: PuckComponentConfig< ImageEditableProps > = {
	label: 'Original',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// FIX: only the Image's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup, and Puck's `id` would even be read as the attachment ID.
	render: ( { url, alt, aspectRatio, className } ) => (
		<Image
			className={ className || undefined }
			url={ url }
			alt={ alt }
			aspectRatio={ aspectRatio }
		/>
	),
};

export default config;
