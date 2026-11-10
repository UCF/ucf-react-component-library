/**
 * CONTEXT: the Code, a primitive: a block of code, as written (docs/architecture.md,
 * "Primitives"). Puck editors place it on its own; in WordPress, editors use core Code, which the
 * theme styles from this primitive's CSS.
 *
 * Content rules apply: plain React, no runtime imports, no state.
 * SPEC: core Code's markup, `<pre><code>`.
 * SYNC: a block that uses it saves this markup inside its own; changing it needs a deprecation.
 */
import type { ComponentPropsWithoutRef } from 'react';

import type { CodeEditableProps } from './Code.props.ts';

export type CodeProps = Partial< CodeEditableProps > &
	Omit< ComponentPropsWithoutRef< 'pre' >, 'children' >;

export default function Code( {
	content = '',
	className,
	...props
}: CodeProps ) {
	return (
		<pre
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-code' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<code>{ content }</code>
		</pre>
	);
}
