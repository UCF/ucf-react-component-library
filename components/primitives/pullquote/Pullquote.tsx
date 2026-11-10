/**
 * CONTEXT: the Pullquote, a primitive: one line pulled out large, the page's quotation moment
 * (docs/architecture.md, "Primitives"). Puck editors place it on its own; in WordPress, editors
 * use core Pullquote, which the theme styles from this primitive's CSS. The quieter one is the
 * Quote.
 *
 * Content rules apply: plain React, no runtime imports, no state.
 * SPEC: core Pullquote's markup: a `<figure>` around the `<blockquote>`.
 * SYNC: a block that uses it saves this markup inside its own; changing it needs a deprecation.
 */
import type { ComponentPropsWithoutRef } from 'react';

import type { PullquoteEditableProps } from './Pullquote.props.ts';

export type PullquoteProps = Partial< PullquoteEditableProps > &
	Omit< ComponentPropsWithoutRef< 'figure' >, 'children' >;

/**
 * The quote's paragraphs: a blank line starts a new one.
 * SYNC: paragraphsOf() in the Quote (primitives import no other primitive's code).
 *
 * @param value The quote as written.
 */
const paragraphsOf = ( value: string ) =>
	value
		.split( /\n\s*\n/ )
		.map( ( paragraph ) => paragraph.trim() )
		.filter( Boolean );

export default function Pullquote( {
	value = '',
	citation = '',
	className,
	...props
}: PullquoteProps ) {
	return (
		<figure
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-pullquote' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			<blockquote>
				{ paragraphsOf( value ).map( ( paragraph, index ) => (
					<p key={ index }>{ paragraph }</p>
				) ) }
				{ citation ? <cite>{ citation }</cite> : null }
			</blockquote>
		</figure>
	);
}
