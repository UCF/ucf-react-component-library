/**
 * CONTEXT: a tiles prop in the WordPress sidebar: text, description and address per tile, with
 * move, remove and add buttons.
 */

import {
	Button,
	Flex,
	FlexBlock,
	TextareaControl,
	TextControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import type { Tile, TilesProp } from '../../prop-definitions.ts';

type Props = {
	definition: TilesProp;
	value: readonly Tile[];
	onChange: ( value: Tile[] ) => void;
};

/**
 * The tiles control.
 *
 * @param props            Props.
 * @param props.definition A tiles prop.
 * @param props.value      The tiles.
 * @param props.onChange   Called with new tiles.
 */
export function TilesControl( { definition, value, onChange }: Props ) {
	const tiles = [ ...value ];
	const full = definition.max !== undefined && tiles.length >= definition.max;
	const change = ( index: number, tile: Partial< Tile > ) =>
		onChange(
			tiles.map( ( item, at ) =>
				at === index ? { ...item, ...tile } : item
			)
		);
	const move = ( index: number, by: -1 | 1 ) => {
		const next = [ ...tiles ];
		const [ tile ] = next.splice( index, 1 );
		next.splice( index + by, 0, tile as Tile );
		onChange( next );
	};

	return (
		// WHY a fieldset, not BaseControl: its label names one input, and this is a group of them.
		<fieldset style={ { border: 0, margin: '0 0 24px', padding: 0 } }>
			<legend className="components-base-control__label">
				{ definition.label }
			</legend>
			{ definition.help ? (
				<p className="components-base-control__help">
					{ definition.help }
				</p>
			) : null }
			{ tiles.map( ( tile, index ) => (
				// WHY the index as key: two tiles may share an address while being edited.
				<fieldset
					key={ index }
					style={ {
						border: '1px solid #ddd',
						margin: '0 0 12px',
						padding: '8px',
					} }
				>
					<legend>
						{ sprintf(
							/* translators: %d: the link's position, from 1. */
							__( 'Link %d', 'ucf-content' ),
							index + 1
						) }
					</legend>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Text', 'ucf-content' ) }
						value={ tile.label }
						onChange={ ( label ) => change( index, { label } ) }
					/>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Description', 'ucf-content' ) }
						rows={ 2 }
						value={ tile.description }
						onChange={ ( description ) =>
							change( index, { description } )
						}
					/>
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						type="url"
						label={ __( 'Address', 'ucf-content' ) }
						value={ tile.href }
						onChange={ ( href ) => change( index, { href } ) }
					/>
					<Flex justify="flex-start">
						<Button
							size="small"
							icon="arrow-up-alt2"
							label={ __( 'Move up', 'ucf-content' ) }
							disabled={ index === 0 }
							onClick={ () => move( index, -1 ) }
						/>
						<Button
							size="small"
							icon="arrow-down-alt2"
							label={ __( 'Move down', 'ucf-content' ) }
							disabled={ index === tiles.length - 1 }
							onClick={ () => move( index, 1 ) }
						/>
						<FlexBlock />
						<Button
							size="small"
							variant="link"
							isDestructive
							onClick={ () =>
								onChange(
									tiles.filter( ( _, at ) => at !== index )
								)
							}
						>
							{ __( 'Remove', 'ucf-content' ) }
						</Button>
					</Flex>
				</fieldset>
			) ) }
			<Button
				variant="secondary"
				disabled={ full }
				onClick={ () =>
					onChange( [
						...tiles,
						{ label: '', description: '', href: '' },
					] )
				}
			>
				{ __( 'Add link', 'ucf-content' ) }
			</Button>
		</fieldset>
	);
}
