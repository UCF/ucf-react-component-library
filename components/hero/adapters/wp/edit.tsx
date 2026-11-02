import { __ } from '@wordpress/i18n';
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

import ImageEdit, {
	type ImageValue,
} from '../../../../primitives/image/adapters/wp/edit.tsx';
import Hero, { PARTS, type HeroProps } from '../../Hero.tsx';
import example from '../../example.json';
import { CHOICES, TEXTS, type ChoiceKey, type TextKey } from '../../options.ts';

// SYNC: the attributes in block.json: example.json's, and `imageId`, which only WordPress has.
export type Attributes = {
	[ Key in keyof typeof example ]: ( typeof example )[ Key ];
} & { imageId: number };

// The sidebar, grouped as an editor thinks about a hero. The copy is edited on the block.
const PANELS: { title: string; fields: ( ChoiceKey | TextKey )[] }[] = [
	{ title: 'Layout', fields: [ 'layout', 'tone', 'height', 'contentAlign' ] },
	{
		title: 'Image',
		fields: [
			'imageAlt',
			'imageSide',
			'imageFill',
			'splitRatio',
			'overlay',
			'overlayStrength',
		],
	},
];

// A block template: a block's name, its attributes, and the blocks inside it.
type Template = [ string, Record< string, unknown >?, Template? ][];

/**
 * What a new Hero's copy starts with: P1's eyebrow, title, description and two buttons, as
 * core blocks. Each text part carries the class that styles it (Hero.tsx, PARTS).
 *
 * WHY the title is an h1: a Hero opens the page. An editor who places it lower changes it.
 * WHY core Buttons: editors get core's Button everywhere, with its link picker and styles; the
 * second is core's Outline style, the theme's secondary button.
 * WHY a starting point, not a lock: editors may change, move or remove any of it.
 * SYNC: TEMPLATE in adapters/puck/config.tsx, the same parts with the library's primitives.
 */
const TEMPLATE: Template = [
	[
		'core/paragraph',
		{
			className: PARTS.eyebrow,
			placeholder: __( 'Eyebrow', 'ucf-content' ),
		},
	],
	[
		'core/heading',
		{
			level: 1,
			className: PARTS.title,
			placeholder: __( 'Title', 'ucf-content' ),
		},
	],
	[
		'core/paragraph',
		{
			className: PARTS.description,
			placeholder: __( 'One or two sentences', 'ucf-content' ),
		},
	],
	[
		'core/buttons',
		{},
		[
			[ 'core/button', { placeholder: __( 'Primary', 'ucf-content' ) } ],
			[
				'core/button',
				{
					className: 'is-style-outline',
					placeholder: __( 'Secondary', 'ucf-content' ),
				},
			],
		],
	],
];

/**
 * The Hero's copy element, holding the blocks placed inside it.
 *
 * WHY passed as `innerAs`: the inner-blocks area is then the Hero's own copy element, as in
 * save() and in Puck, with no wrapper of WordPress's own in between.
 *
 * @param props The copy element's props from Hero.
 */
function InnerBlocksArea( props: object ) {
	return <div { ...useInnerBlocksProps( props, { template: TEMPLATE } ) } />;
}

/**
 * The editor view: the Hero, with its copy editable inside it and its settings in the sidebar.
 *
 * WHY the image is picked in two places: on the block, the image itself opens the media
 * library (as core Image's does); in the sidebar, the same picker as a thumbnail. A full-image
 * Hero's backdrop sits under its overlay and copy, so the sidebar is the only way to it there.
 * WHY the labels are untranslated: this is a trial block; translate them before it ships.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const set = ( key: keyof Attributes ) => ( value: string ) =>
		setAttributes( { [ key ]: value } );

	const { imageSrc, imageAlt, imageId } = attributes;
	const chooseImage = ( image: ImageValue ) =>
		setAttributes( {
			imageId: image.id,
			imageSrc: image.url,
			// WHY keep a typed alt: the library's alt describes the file, not this use of it.
			imageAlt: imageAlt || image.alt,
		} );
	const imagePicker = ( className?: string ) => (
		<ImageEdit
			className={ className }
			id={ imageId }
			url={ imageSrc }
			alt={ imageAlt }
			label={ __( 'hero image', 'ucf-content' ) }
			onChange={ chooseImage }
		/>
	);

	const control = ( key: ChoiceKey | TextKey ) => {
		if ( key in TEXTS ) {
			return (
				<TextControl
					key={ key }
					__next40pxDefaultSize
					label={ TEXTS[ key as TextKey ] }
					value={ attributes[ key ] as string }
					onChange={ set( key ) }
				/>
			);
		}
		const { label, control: type, options } = CHOICES[ key as ChoiceKey ];
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
				selected={ attributes[ key ] as string }
			/>
		) : (
			<SelectControl
				key={ key }
				__next40pxDefaultSize
				{ ...props }
				value={ attributes[ key ] as string }
			/>
		);
	};

	return (
		<>
			<InspectorControls>
				{ PANELS.map( ( panel ) => (
					<PanelBody key={ panel.title } title={ panel.title }>
						{ panel.title === 'Image' ? (
							<div style={ { marginBottom: '16px' } }>
								{ imagePicker() }
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
							</div>
						) : null }
						{ panel.fields.map( control ) }
					</PanelBody>
				) ) }
			</InspectorControls>

			<Hero
				{ ...useBlockProps() }
				{ ...( attributes as HeroProps ) }
				media={ imagePicker( 'ucf-c-hero__image' ) }
				innerAs={ InnerBlocksArea }
			/>
		</>
	);
}
