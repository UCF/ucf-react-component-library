import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	PlainText as UntypedPlainText,
	useBlockProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import {
	PanelBody,
	RadioControl,
	SelectControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import type { ComponentType } from 'react';

import ButtonEdit, {
	type ButtonValue,
} from '../../../../primitives/button/adapters/wp/edit.tsx';
import Hero, { type HeroBadge, type HeroProps } from '../../Hero.tsx';
import example from '../../example.json';
import { CHOICES, TEXTS, type ChoiceKey, type TextKey } from '../../options.ts';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

// SYNC: the attributes in block.json, generated from example.json.
export type Attributes = {
	[ Key in keyof typeof example ]: ( typeof example )[ Key ];
};

// The sidebar, grouped as an editor thinks about a hero. Title, eyebrow, description and the
// buttons are edited on the block itself.
const PANELS: { title: string; fields: ( ChoiceKey | TextKey )[] }[] = [
	{ title: 'Layout', fields: [ 'layout', 'tone', 'height', 'contentAlign' ] },
	{
		title: 'Image',
		fields: [
			'imageSrc',
			'imageAlt',
			'imageSide',
			'imageFill',
			'splitRatio',
			'overlay',
			'overlayStrength',
		],
	},
	{ title: 'Badges', fields: [ 'badges' ] },
];

/**
 * The editor view: the core Hero, with fields for its copy and its settings in the sidebar.
 *
 * WHY the buttons are edited in place: they are the Button primitive's editing version, with
 * core Button's tools (label typed in place, WordPress's link picker), so they work as core's
 * Button does anywhere else on the page. An empty label hides that button on the page.
 *
 * WHY the image is a URL field, not the media library: P1's is a URL. A real UCF Hero would use
 * the Image primitive (docs/todo.md), with `MediaUpload` here and the attachment ID saved.
 * WHY badges are one per line: WordPress has no list control for an attribute; Puck does.
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

	// The Hero's two buttons, as the Button primitive names its value.
	const button = ( which: 'primary' | 'secondary' ) => (
		<ButtonEdit
			key={ which }
			label={
				which === 'primary' ? 'Primary button' : 'Secondary button'
			}
			variant={ which === 'primary' ? 'fill' : 'outline' }
			text={ attributes[ `${ which }Label` ] }
			url={ attributes[ `${ which }Href` ] }
			linkTarget={ attributes[ `${ which }Target` ] }
			onChange={ ( change: Partial< ButtonValue > ) =>
				setAttributes( {
					...( change.text !== undefined && {
						[ `${ which }Label` ]: change.text,
					} ),
					...( change.url !== undefined && {
						[ `${ which }Href` ]: change.url,
					} ),
					// SYNC: the Hero stores `_self` where core's Button stores ''.
					...( change.linkTarget !== undefined && {
						[ `${ which }Target` ]:
							change.linkTarget === '_blank' ? '_blank' : '_self',
					} ),
				} )
			}
		/>
	);

	const inline = ( key: 'eyebrow' | 'title' | 'description' ) => (
		<PlainText
			value={ attributes[ key ] }
			onChange={ set( key ) }
			placeholder={ TEXTS[ key ] }
			aria-label={ TEXTS[ key ] }
		/>
	);

	return (
		<>
			<InspectorControls>
				{ PANELS.map( ( panel ) => (
					<PanelBody key={ panel.title } title={ panel.title }>
						{ panel.fields.map( control ) }
						{ panel.title === 'Badges' ? (
							<TextareaControl
								label={ __(
									'Badge items, one per line',
									'ucf-content'
								) }
								value={ ( attributes.badgeItems as HeroBadge[] )
									.map( ( badge ) => badge.text )
									.join( '\n' ) }
								onChange={ ( value ) =>
									setAttributes( {
										badgeItems: value
											.split( '\n' )
											.filter( Boolean )
											.map( ( text ) => ( { text } ) ),
									} )
								}
							/>
						) : null }
					</PanelBody>
				) ) }
			</InspectorControls>

			<Hero
				{ ...useBlockProps() }
				{ ...( attributes as HeroProps ) }
				eyebrow={ inline( 'eyebrow' ) }
				title={ inline( 'title' ) }
				description={ inline( 'description' ) }
				actions={ [ button( 'primary' ), button( 'secondary' ) ] }
			/>
		</>
	);
}
