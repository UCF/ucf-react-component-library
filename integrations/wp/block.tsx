/**
 * WordPress: a component's definition as a block.
 *
 * A block keeps WordPress's usual files, each a one-line call:
 *
 *   edit.tsx    export default blockEdit( card, metadata );
 *   save.tsx    export default blockSave( card, metadata );
 *   index.tsx   registerBlockType( metadata, { ...blockSettings( card ), edit, save } );
 *
 * A block that needs something of its own wraps or replaces the call in its file.
 */

import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	type BlockConfiguration,
	type BlockEditProps,
	type BlockSaveProps,
	type BlockVariation,
} from '@wordpress/blocks';
import { Button, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import ImageEdit, {
	type ImageValue,
} from '../../components/primitives/image/integrations/wp/edit.tsx';
import type { ComponentDefinition } from '../schema/definition.ts';
import { resolveParts, type PartDefinitions } from '../schema/parts.ts';
import {
	panelsOf,
	type PropDefinitions,
	type TextProp,
} from '../schema/props.ts';
import { ownAttributes } from './attributes.ts';
import { toBlocks, toExampleBlocks } from './parts.ts';
import { ICONS } from './icons.ts';
import { FieldControl } from './inspector.tsx';

// ── Sidebar fields ─────────────────────────────────────────────────────────────────────────────

type Attributes = Record< string, unknown >;
type SetAttributes = ( attributes: Attributes ) => void;

/**
 * A `control: 'media'` prop's field: the media library picker, which sets the URL and the ID
 * together, and a button to remove the image.
 * WHY in the sidebar only: an image under the content (a card's background) can't be clicked on the
 * canvas.
 *
 * @param props               The prop's key and definition, and the block's attributes.
 * @param props.name          The prop's key: the image's URL.
 * @param props.definition    Its definition, with `media`.
 * @param props.attributes    The block's attributes.
 * @param props.setAttributes Updates them.
 */
function MediaField( {
	name,
	definition,
	attributes,
	setAttributes,
}: {
	name: string;
	definition: TextProp;
	attributes: Attributes;
	setAttributes: SetAttributes;
} ) {
	const { what = 'image', id = '', alt = '' } = definition.media ?? {};
	const url = attributes[ name ] as string;
	return (
		<div style={ { marginBottom: '16px' } }>
			<ImageEdit
				id={ attributes[ id ] as number }
				url={ url }
				alt={ attributes[ alt ] as string }
				label={ what }
				onChange={ ( image: ImageValue ) =>
					setAttributes( {
						[ id ]: image.id,
						[ name ]: image.url,
						[ alt ]: '',
					} )
				}
			/>
			{ url ? (
				<Button
					variant="link"
					isDestructive
					onClick={ () =>
						setAttributes( {
							[ name ]: '',
							[ alt ]: '',
							[ id ]: 0,
						} )
					}
				>
					{ __( 'Remove image', 'ucf-content' ) }
				</Button>
			) : null }
		</div>
	);
}

const attributesOf = ( metadata: object ) =>
	metadata as { attributes: Record< string, unknown > };

// ── edit() ─────────────────────────────────────────────────────────────────────────────────────
//
// The editor view.

/**
 * A block's edit(): the frame, its content editable as inner blocks, its props' fields in the
 * sidebar by panel.
 *
 * @param definition The component's definition.
 * @param metadata   Its block.json.
 */
export function blockEdit<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>( definition: ComponentDefinition< Props, Parts >, metadata: object ) {
	const { component: Component, props: definitions } = definition;
	const json = attributesOf( metadata );
	const panels = panelsOf( definitions );
	// What a block inserted without picking a preset starts with: a start, not a lock.
	const template = toBlocks(
		resolveParts( definition.parts, definition.defaultPreset.parts )
	);

	// WHY passed as `innerAs`: the inner-blocks area is the frame's own element, no wrapper.
	const InnerBlocksArea = ( props: object ) => (
		<div { ...useInnerBlocksProps( props, { template } ) } />
	);

	return function Edit( {
		attributes,
		setAttributes,
	}: BlockEditProps< Attributes > ) {
		return (
			<>
				<InspectorControls>
					{ panels.map( ( panel ) => (
						<PanelBody key={ panel.title } title={ panel.title }>
							{ panel.keys.map( ( key ) => {
								const prop = definitions[
									key
								] as Props[ string ];
								return 'control' in prop &&
									prop.control === 'media' ? (
									<MediaField
										key={ key }
										name={ key }
										definition={ prop as TextProp }
										attributes={ attributes }
										setAttributes={ setAttributes }
									/>
								) : (
									<FieldControl
										key={ key }
										definition={ prop }
										value={ String( attributes[ key ] ) }
										onChange={ ( value ) =>
											setAttributes( { [ key ]: value } )
										}
									/>
								);
							} ) }
						</PanelBody>
					) ) }
				</InspectorControls>

				<Component
					{ ...useBlockProps() }
					{ ...ownAttributes( attributes, json ) }
					innerAs={ InnerBlocksArea }
				/>
			</>
		);
	};
}

// ── save() ─────────────────────────────────────────────────────────────────────────────────────
//
// What a post stores.

/**
 * A block's save(): the frame, its attributes as props, its inner blocks inside.
 * SYNC: what this returns is stored in every post; the markup snapshots check it.
 *
 * @param definition The component's definition.
 * @param metadata   Its block.json.
 */
export function blockSave<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>( definition: ComponentDefinition< Props, Parts >, metadata: object ) {
	const { component: Component } = definition;
	const json = attributesOf( metadata );

	const InnerBlocksContent = ( props: Record< string, unknown > ) => (
		<div { ...useInnerBlocksProps.save( props ) } />
	);

	return function save( { attributes }: BlockSaveProps< Attributes > ) {
		return (
			<Component
				{ ...useBlockProps.save() }
				{ ...ownAttributes( attributes, json ) }
				innerAs={ InnerBlocksContent }
			/>
		);
	};
}

// ── Settings ───────────────────────────────────────────────────────────────────────────────────
//
// Icon, inserter preview, variations.

/**
 * A block's settings besides edit() and save(): its icon, its inserter preview (the default preset
 * with sample content), and its presets as variations.
 *
 * @param definition The component's definition.
 */
export function blockSettings<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>(
	definition: ComponentDefinition< Props, Parts >
): Pick< BlockConfiguration< Attributes >, 'icon' | 'example' | 'variations' > {
	const { parts, presets, defaultPreset } = definition;
	// UPSTREAM: @wordpress/blocks types `example` and variations' inner blocks loosely.
	return {
		icon: ICONS[ definition.wpIcon ],
		example: {
			attributes: defaultPreset.props,
			innerBlocks: toExampleBlocks(
				toBlocks( resolveParts( parts, defaultPreset.parts ), {
					sample: true,
				} )
			),
		} as unknown as BlockConfiguration< Attributes >[ 'example' ],
		// WHY a default: inserting the block gives the common one.
		variations: presets.map( ( preset ) => ( {
			name: preset.name,
			title: preset.title,
			description: preset.description,
			icon: ICONS[ preset.wpIcon ],
			attributes: preset.props,
			innerBlocks: toBlocks( resolveParts( parts, preset.parts ) ),
			isDefault: preset === defaultPreset,
			scope: [ 'inserter' ],
		} ) ) as unknown as BlockVariation< Attributes >[],
	};
}
