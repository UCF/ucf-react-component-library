import {
	InspectorControls,
	LinkControl,
	PlainText as UntypedPlainText,
	useBlockProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	Button as WPButton,
	PanelBody,
	RadioControl,
	TextareaControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ComponentType } from 'react';

import ImageEdit from '#primitives/image/integrations/wp/edit.js';
import FixedCard, { type FixedCardProps } from '../../FixedCard.tsx';
import { CHOICES, type ChoiceKey } from '../../options.ts';
import { ownAttributes } from '#integrations/wp/attributes.js';
import metadata from './block.json';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

// SYNC: the attributes in block.json.
export type Attributes = {
	title: string;
	url: string;
	linkTarget: string;
	meta: string;
	description: string;
	imageUrl: string;
	imageAlt: string;
	imageId: number;
	headingLevel: NonNullable< FixedCardProps[ 'headingLevel' ] >;
	variant: NonNullable< FixedCardProps[ 'variant' ] >;
	layout: NonNullable< FixedCardProps[ 'layout' ] >;
};

/**
 * The editor view: the core Card with fields in its slots, and its link, image and look in the
 * sidebar.
 *
 * WHY the link is in the sidebar, not on the title: the title's link stretches over the whole
 * card on the page; in the editor that would cover the fields. So the editor renders the card
 * unlinked, and WordPress's own link picker (core's) sets where it goes.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { url, linkTarget, imageUrl, imageAlt, imageId } = attributes;
	const set = ( key: keyof Attributes ) => ( value: string ) =>
		setAttributes( { [ key ]: value } );

	const inline = ( key: 'title' | 'meta' | 'description', label: string ) => (
		<PlainText
			value={ attributes[ key ] }
			onChange={ set( key ) }
			placeholder={ label }
			aria-label={ label }
		/>
	);

	const radio = ( key: Exclude< ChoiceKey, 'linkTarget' > ) => (
		<RadioControl
			key={ key }
			label={ CHOICES[ key ].label }
			selected={ attributes[ key ] }
			options={ CHOICES[ key ].options.map( ( option ) => ( {
				...option,
			} ) ) }
			onChange={ set( key ) }
		/>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Link', 'ucf-content' ) }>
					<LinkControl
						value={ {
							url,
							opensInNewTab: linkTarget === '_blank',
						} }
						// UPSTREAM: LinkControl may send `url: null` when the link is cleared.
						onChange={ ( next: {
							url?: string | null;
							opensInNewTab?: boolean;
						} ) =>
							setAttributes( {
								url: next.url ?? '',
								linkTarget: next.opensInNewTab ? '_blank' : '',
							} )
						}
						onRemove={ () =>
							setAttributes( { url: '', linkTarget: '' } )
						}
					/>
				</PanelBody>
				<PanelBody title={ __( 'Image', 'ucf-content' ) }>
					<TextareaControl
						label={ __( 'Alternative text', 'ucf-content' ) }
						help={ __(
							'Describe what the image shows. Leave it empty if the image is decoration and the title says it all.',
							'ucf-content'
						) }
						value={ imageAlt }
						onChange={ set( 'imageAlt' ) }
					/>
					{ imageUrl ? (
						<WPButton
							variant="secondary"
							isDestructive
							onClick={ () =>
								setAttributes( {
									imageUrl: '',
									imageAlt: '',
									imageId: 0,
								} )
							}
						>
							{ __( 'Remove image', 'ucf-content' ) }
						</WPButton>
					) : null }
				</PanelBody>
				<PanelBody title={ __( 'Card', 'ucf-content' ) }>
					{ radio( 'variant' ) }
					{ radio( 'layout' ) }
					{ radio( 'headingLevel' ) }
				</PanelBody>
			</InspectorControls>

			<FixedCard
				{ ...useBlockProps() }
				{ ...ownAttributes< FixedCardProps >( attributes, metadata ) }
				// WHY no url here: see the note above.
				url={ undefined }
				title={ inline( 'title', __( 'Title', 'ucf-content' ) ) }
				meta={ inline(
					'meta',
					__( 'Category · date', 'ucf-content' )
				) }
				description={ inline(
					'description',
					__( 'One or two sentences', 'ucf-content' )
				) }
				media={
					<ImageEdit
						id={ imageId }
						url={ imageUrl }
						alt={ imageAlt }
						aspectRatio="3/2"
						label={ __( 'card image', 'ucf-content' ) }
						onChange={ ( image ) =>
							setAttributes( {
								imageId: image.id,
								imageUrl: image.url,
								imageAlt: image.alt,
							} )
						}
					/>
				}
			/>
		</>
	);
}
