/**
 * CONTEXT: the Separator, a primitive: a rule between parts of a page (docs/architecture.md,
 * "Primitives"). Puck editors place it on its own; in WordPress, editors use core Separator, which
 * the theme styles from this primitive's CSS.
 *
 * Content rules apply: plain React, no runtime imports, no state.
 * SYNC: a block that uses it saves this markup inside its own; changing it needs a deprecation.
 */
import type { ComponentPropsWithoutRef } from 'react';

import type { SeparatorEditableProps } from './Separator.props.ts';

export type SeparatorProps = Partial< SeparatorEditableProps > &
	Omit< ComponentPropsWithoutRef< 'hr' >, 'children' >;

export default function Separator( {
	variant = 'default',
	className,
	...props
}: SeparatorProps ) {
	return (
		<hr
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-separator' ]
				.filter( Boolean )
				.join( ' ' ) }
			// WHY only when not the default: the base rule is the default.
			data-variant={ variant === 'default' ? undefined : variant }
		/>
	);
}
