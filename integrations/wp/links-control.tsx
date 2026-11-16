/**
 * WordPress: a links prop as a sidebar field: each link's text and address, with buttons to move
 * it, remove it, and add one.
 *
 * WHY text fields, not LinkControl: most links here are `#anchors` on the same page, which
 * LinkControl's search can't find; a typed address is what the anchor field shows.
 */

import { Button, Flex, FlexBlock, TextControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import type { Link, LinksProp } from '../schema/props.ts';

type Props = {
	definition: LinksProp;
	value: readonly Link[];
	onChange: ( value: Link[] ) => void;
};

/**
 * The links in order, each editable, movable and removable, and a button to add one.
 *
 * @param props            The prop's definition, its links, and what to call when they change.
 * @param props.definition A links prop.
 * @param props.value      Its links.
 * @param props.onChange   Called with the new links.
 */
export function LinksControl( { definition, value, onChange }: Props ) {
	const links = [ ...value ];
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
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ __( 'Address', 'ucf-content' ) }
						help={ __(
							'#anchor for a section on this page',
							'ucf-content'
						) }
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
