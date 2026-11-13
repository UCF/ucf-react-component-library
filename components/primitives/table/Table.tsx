/**
 * CONTEXT: the Table, a primitive: rows of facts under a header (docs/architecture.md,
 * "Primitives"). Puck editors place it on its own; in WordPress, editors use core Table, which the
 * theme styles from this primitive's CSS.
 *
 * Content rules apply: plain React, no runtime imports, no state.
 * SPEC: core Table's markup: a `<figure>` holding the table, then its caption.
 * A11Y: the figure takes keyboard focus, as the theme makes core's on render (includes/tables.php
 * there): a table wider than a phone scrolls, and a scrolling region a keyboard can't reach fails
 * WCAG 2.1.1. A captioned figure is named by its caption and may take no other role; one without
 * is a region named "Table", so focus lands on something announced.
 * SYNC: a block that uses it saves this markup inside its own; changing it needs a deprecation.
 */
import type { ComponentPropsWithoutRef } from 'react';

import type { TableEditableProps } from './Table.props.ts';

export type TableProps = Partial< TableEditableProps > &
	Omit< ComponentPropsWithoutRef< 'figure' >, 'children' >;

/**
 * The table's rows: one per line, cells split at `|`, blank lines skipped. Short rows are filled
 * with empty cells, so every row has as many as the longest.
 *
 * @param rows The rows as written.
 */
export const rowsOf = ( rows: string ) => {
	const cells = rows
		.split( '\n' )
		.filter( ( row ) => row.trim() )
		.map( ( row ) => row.split( '|' ).map( ( cell ) => cell.trim() ) );
	const width = Math.max( 0, ...cells.map( ( row ) => row.length ) );
	return cells.map( ( row ) => [
		...row,
		...Array< string >( width - row.length ).fill( '' ),
	] );
};

export default function Table( {
	variant = 'default',
	caption = '',
	rows = '',
	className,
	...props
}: TableProps ) {
	const [ header = [], ...body ] = rowsOf( rows );
	return (
		<figure
			// WHY before the spread: a host may name or label the figure itself.
			tabIndex={ 0 }
			role={ caption ? undefined : 'region' }
			aria-label={ caption ? undefined : 'Table' }
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-table' ]
				.filter( Boolean )
				.join( ' ' ) }
			// WHY only when not the default: the base table is the default.
			data-variant={ variant === 'default' ? undefined : variant }
		>
			<table>
				{ header.length ? (
					<thead>
						<tr>
							{ header.map( ( cell, index ) => (
								<th key={ index }>{ cell }</th>
							) ) }
						</tr>
					</thead>
				) : null }
				{ body.length ? (
					<tbody>
						{ body.map( ( row, rowIndex ) => (
							<tr key={ rowIndex }>
								{ row.map( ( cell, index ) => (
									<td key={ index }>{ cell }</td>
								) ) }
							</tr>
						) ) }
					</tbody>
				) : null }
			</table>
			{ caption ? <figcaption>{ caption }</figcaption> : null }
		</figure>
	);
}
