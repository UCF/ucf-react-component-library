/**
 * CONTEXT: the Quote, a primitive: a testimonial inside running text (docs/architecture.md,
 * "Primitives"). Puck editors place it on its own; in WordPress, editors use core Quote, which the
 * theme styles from this primitive's CSS. The large one is the Pullquote.
 *
 * Content rules apply: plain React, no runtime imports, no state.
 * SPEC: core Quote's markup: paragraphs, then the citation, in a `<blockquote>`.
 * SYNC: a block that uses it saves this markup inside its own; changing it needs a deprecation.
 */
import type { ComponentPropsWithoutRef } from 'react';

import type { QuoteEditableProps } from './Quote.props.ts';

export type QuoteProps = Partial< QuoteEditableProps > &
	Omit< ComponentPropsWithoutRef< 'blockquote' >, 'children' >;

/**
 * The quote's paragraphs: a blank line starts a new one.
 *
 * @param value The quote as written.
 */
export const paragraphsOf = ( value: string ) =>
	value
		.split( /\n\s*\n/ )
		.map( ( paragraph ) => paragraph.trim() )
		.filter( Boolean );

export default function Quote( {
	value = '',
	citation = '',
	className,
	...props
}: QuoteProps ) {
	return (
		<blockquote
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-quote' ]
				.filter( Boolean )
				.join( ' ' ) }
		>
			{ paragraphsOf( value ).map( ( paragraph, index ) => (
				<p key={ index }>{ paragraph }</p>
			) ) }
			{ citation ? <cite>{ citation }</cite> : null }
		</blockquote>
	);
}
