import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button as WPButton,
	PanelBody,
	RadioControl,
	SelectControl,
	TextControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import ImageEdit, {
	type ImageValue,
} from '../../../../primitives/image/adapters/wp/edit.tsx';
import Card, { type CardProps } from '../../Card.tsx';
import { CHOICES, type ChoiceKey } from '../../options.ts';
import { VARIATIONS } from '../../variations.ts';
import { toBlocks } from './blocks.ts';

// SYNC: the attributes in block.json.
export type Attributes = {
	[ Key in ChoiceKey ]: NonNullable< CardProps[ Key ] >;
} & { imageSrc: string; imageAlt: string; imageId: number };

/**
 * What a Card inserted without a design starts with: the story card's parts.
 *
 * WHY a starting point, not a lock: a card's content varies, so editors may change, move or
 * remove any of it. The other designs are block variations (index.tsx).
 */
const TEMPLATE = toBlocks( VARIATIONS[ 0 ]?.content ?? [] );

/**
 * The frame's inner element, holding the blocks placed inside it.
 *
 * WHY passed as `innerAs`: the inner-blocks area is then the frame's own inner element, as in
 * save() and in Puck, with no wrapper of WordPress's own in between.
 *
 * @param props The inner element's props from Card.
 */
function InnerBlocksArea( props: object ) {
	return <div { ...useInnerBlocksProps( props, { template: TEMPLATE } ) } />;
}

// The sidebar, grouped as an editor thinks about a card.
const PANELS: { title: string; fields: ChoiceKey[] }[] = [
	{
		title: __( 'Card', 'ucf-content' ),
		fields: [ 'variant', 'composition' ],
	},
	{
		title: __( 'Layout', 'ucf-content' ),
		fields: [ 'contentAlign', 'contentPosition', 'aspectRatio' ],
	},
	{ title: __( 'Background image', 'ucf-content' ), fields: [ 'overlay' ] },
];

/**
 * The editor view: the frame, with its blocks editable inside it and its settings in the
 * sidebar.
 *
 * WHY the background image is picked in the sidebar only: it sits under the content and the
 * overlay, so it can't be clicked on the canvas.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { imageSrc, imageAlt, imageId } = attributes;
	const set = ( key: keyof Attributes ) => ( value: string ) =>
		setAttributes( { [ key ]: value } );

	const control = ( key: ChoiceKey ) => {
		const { label, control: type, options } = CHOICES[ key ];
		const props = {
			label,
			options: options.map( ( option ) => ( {
				value: option.value as string,
				label: option.label as string,
			} ) ),
			onChange: set( key ),
		};
		return type === 'radio' ? (
			<RadioControl
				key={ key }
				{ ...props }
				selected={ attributes[ key ] }
			/>
		) : (
			<SelectControl
				key={ key }
				__next40pxDefaultSize
				{ ...props }
				value={ attributes[ key ] }
			/>
		);
	};

	return (
		<>
			<InspectorControls>
				{ PANELS.map( ( panel ) => (
					<PanelBody key={ panel.title } title={ panel.title }>
						{ panel.fields === PANELS[ 2 ]?.fields ? (
							<div style={ { marginBottom: '16px' } }>
								<ImageEdit
									id={ imageId }
									url={ imageSrc }
									alt={ imageAlt }
									label={ __(
										'background image',
										'ucf-content'
									) }
									onChange={ ( image: ImageValue ) =>
										setAttributes( {
											imageId: image.id,
											imageSrc: image.url,
											imageAlt: '',
										} )
									}
								/>
								{ imageSrc ? (
									<WPButton
										variant="link"
										isDestructive
										onClick={ () =>
											setAttributes( {
												imageSrc: '',
												imageAlt: '',
												imageId: 0,
											} )
										}
									>
										{ __( 'Remove image', 'ucf-content' ) }
									</WPButton>
								) : null }
								<TextControl
									__next40pxDefaultSize
									label={ __(
										'Alternative text',
										'ucf-content'
									) }
									help={ __(
										'Usually empty: under a tint or gradient the image is decoration.',
										'ucf-content'
									) }
									value={ imageAlt }
									onChange={ set( 'imageAlt' ) }
								/>
							</div>
						) : null }
						{ panel.fields.map( control ) }
					</PanelBody>
				) ) }
			</InspectorControls>

			<Card
				{ ...useBlockProps() }
				{ ...( attributes as CardProps ) }
				innerAs={ InnerBlocksArea }
			/>
		</>
	);
}
