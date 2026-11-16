/**
 * CONTEXT: a links prop in the WordPress sidebar: text and target Section per link, with move,
 * remove and add buttons.
 *
 * WHY a select, not an address: links only go to Sections on this page.
 */

import {
	Button,
	Flex,
	FlexBlock,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { createContext, useContext } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import { targetOptions, type Link, type LinksProp } from '../schema/props.ts';

/** The page's Section links a link may target, provided by the block's edit(). */
export const LinkTargets = createContext< readonly Link[] >( [] );

type Props = {
	definition: LinksProp;
	value: readonly Link[];
	onChange: ( value: Link[] ) => void;
};

/**
 * The links control.
 *
 * @param props            Props.
 * @param props.definition A links prop.
 * @param props.value      The links.
 * @param props.onChange   Called with new links.
 */
export function LinksControl( { definition, value, onChange }: Props ) {
	const links = [ ...value ];
	const options = targetOptions( useContext( LinkTargets ), links );
	const change = ( index: number, link: Partial< Link > ) =>
		onChange(
			links.map( ( item, at ) =>
				at === index ? { ...item, ...link } : item
			)
		);
	const move = ( index: number, by: -1 | 1 ) => {
		const next = [ ...links ];
		const [ link ] = next.splice( index, 1 );
		next.splice( index + by, 0, link as Link );
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
			{ links.map( ( link, index ) => (
				// WHY the index as key: two links may share an address while being edited.
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
						value={ link.label }
						onChange={ ( label ) => change( index, { label } ) }
					/>
					<SelectControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Section', 'ucf-content' ) }
						options={ options }
						value={ link.href }
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
							disabled={ index === links.length - 1 }
							onClick={ () => move( index, 1 ) }
						/>
						<FlexBlock />
						<Button
							size="small"
							variant="link"
							isDestructive
							onClick={ () =>
								onChange(
									links.filter( ( _, at ) => at !== index )
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
				onClick={ () =>
					onChange( [ ...links, { label: '', href: '' } ] )
				}
			>
				{ __( 'Add link', 'ucf-content' ) }
			</Button>
		</fieldset>
	);
}
