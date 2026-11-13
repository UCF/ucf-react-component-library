/**
 * CONTEXT: the List, a primitive: a bulleted, numbered or styled list (docs/architecture.md,
 * "Primitives"). Puck editors place it on its own; in WordPress, editors use core List, which the
 * theme styles from this primitive's CSS.
 *
 * Content rules apply: plain React, no runtime imports, no state.
 * SPEC: core List's markup: a `<ul>`, or an `<ol>` when numbered, of `<li>`s. A definition is
 * "<strong>Term</strong> value", as an editor writes it in core List.
 * SYNC: a block that uses it saves this markup inside its own; changing it needs a deprecation.
 */
import type { ComponentPropsWithoutRef } from 'react';

import type { ListEditableProps } from './List.props.ts';

export type ListProps = Partial< ListEditableProps > &
	Omit< ComponentPropsWithoutRef< 'ul' >, 'children' >;

/**
 * The list's items: one per line, blank lines skipped.
 *
 * @param items The items as written.
 */
export const itemsOf = ( items: string ) =>
	items
		.split( '\n' )
		.map( ( item ) => item.trim() )
		.filter( Boolean );

/**
 * A definition's term and value, split at the first colon, or null when the item has no term.
 *
 * @param item One item, as "Term: value".
 */
export const definitionOf = ( item: string ) => {
	const colon = item.indexOf( ':' );
	const term = item.slice( 0, colon ).trim();
	return colon > 0 && term
		? { term, value: item.slice( colon + 1 ).trim() }
		: null;
};

export default function List( {
	variant = 'default',
	items = '',
	className,
	...props
}: ListProps ) {
	const Tag = variant === 'numbered' ? 'ol' : 'ul';
	return (
		<Tag
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-list' ]
				.filter( Boolean )
				.join( ' ' ) }
			// WHY none for numbered: the `<ol>` says it, as in core.
			data-variant={
				variant === 'default' || variant === 'numbered'
					? undefined
					: variant
			}
		>
			{ itemsOf( items ).map( ( item, index ) => {
				const definition =
					variant === 'definitions' ? definitionOf( item ) : null;
				return (
					<li key={ index }>
						{ definition ? (
							<>
								<strong>{ definition.term }</strong>
								{ ` ${ definition.value }` }
							</>
						) : (
							item
						) }
					</li>
				);
			} ) }
		</Tag>
	);
}
