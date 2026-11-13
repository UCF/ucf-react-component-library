/**
 * WordPress: a framed component as a block, read through its port.
 *
 * A block keeps WordPress's usual files, each a one-line call:
 *
 *   edit.tsx    export default blockEdit( Card );
 *   save.tsx    export default blockSave( Card );
 *   index.tsx   registerBlockType( metadata, { ...blockSettings( Card ), edit, save } );
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
import { createContext, useContext, type ComponentType } from 'react';

import { SAMPLE as IMAGE_SAMPLE } from '@/components/primitives/image/Image.props';
import ImageEdit, {
	type ImageValue,
} from '@/components/primitives/image/integrations/wp/edit';
import type { Areas, Ported } from '../react/frame.tsx';
import { resolveParts, type PartDefinitions } from '../schema/parts.ts';
import {
	mediaProps,
	panelsOf,
	type PropDefinitions,
	type TextProp,
} from '../schema/props.ts';
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

/**
 * The component's markup, taking a block's attributes as they are.
 * WHY loosely typed: attributes are stored values; ownProps() keeps only the component's own.
 *
 * @param component The component, from frame().
 */
type HasFrame = { port: { Frame: unknown } };
const looseFrame = ( component: HasFrame ) =>
	component.port.Frame as ComponentType< Record< string, unknown > >;

/**
 * A block's attributes that are the component's props.
 * FIX: WordPress's own (`className`, `anchor`, `align`) would replace useBlockProps()'s class or
 * reach the markup as stray attributes.
 *
 * @param attributes  The block's attributes.
 * @param definitions The component's prop definitions.
 */
const ownProps = (
	attributes: Attributes,
	definitions: PropDefinitions
): Attributes =>
	Object.fromEntries(
		Object.entries( attributes ).filter( ( [ key ] ) => key in definitions )
	);

/** The block being edited, for an area's element (the Hero's image picker). */
const BlockContext = createContext< BlockEditProps< Attributes > | null >(
	null
);

/**
 * The block an area's element sits in: its attributes, and setAttributes().
 * WHY context: an area's element must be the same component every render, or WordPress would
 * remount it; so it can't close over the attributes.
 */
export function useBlock(): BlockEditProps< Attributes > {
	const block = useContext( BlockContext );
	if ( ! block ) {
		throw new Error( 'useBlock() is for an area inside blockEdit().' );
	}
	return block;
}

// ── edit() ─────────────────────────────────────────────────────────────────────────────────────
//
// The editor view.

/**
 * A block's edit(): the markup, its content editable as inner blocks, its props' fields in the
 * sidebar by panel.
 *
 * @param component     The component, from frame().
 * @param options       What a block adds, from its own edit.tsx.
 * @param options.areas Its other areas on the canvas (the Hero's image picker). They read the
 *                      block through useBlock().
 */
export function blockEdit<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>( component: Ported< Props, Parts >, { areas = {} }: { areas?: Areas } = {} ) {
	const { props: definitions, parts, defaultPreset } = component.port;
	const Frame = looseFrame( component );
	const panels = panelsOf( definitions );
	// What a block inserted without picking a preset starts with: a start, not a lock.
	const template = toBlocks( resolveParts( parts, defaultPreset.parts ) );

	// WHY the content area itself: the inner blocks sit in the frame's own element, no wrapper.
	const InnerBlocksArea = ( props: object ) => (
		<div { ...useInnerBlocksProps( props, { template } ) } />
	);

	return function Edit( props: BlockEditProps< Attributes > ) {
		const { attributes, setAttributes } = props;
		return (
			<BlockContext.Provider value={ props }>
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
										value={ attributes[ key ] }
										onChange={ ( value ) =>
											setAttributes( { [ key ]: value } )
										}
									/>
								);
							} ) }
						</PanelBody>
					) ) }
				</InspectorControls>

				<Frame
					{ ...useBlockProps() }
					{ ...ownProps( attributes, definitions ) }
					areas={ { ...areas, content: InnerBlocksArea } }
				/>
			</BlockContext.Provider>
		);
	};
}

// ── save() ─────────────────────────────────────────────────────────────────────────────────────
//
// What a post stores.

/**
 * A block's save(): the markup, its attributes as props, its inner blocks inside.
 * SYNC: what this returns is stored in every post; the markup snapshots check it.
 *
 * @param component The component, from frame().
 */
export function blockSave<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>( component: Ported< Props, Parts > ) {
	const { props: definitions } = component.port;
	const Frame = looseFrame( component );

	const InnerBlocksContent = ( props: Record< string, unknown > ) => (
		<div { ...useInnerBlocksProps.save( props ) } />
	);

	return function save( { attributes }: BlockSaveProps< Attributes > ) {
		return (
			<Frame
				{ ...useBlockProps.save() }
				{ ...ownProps( attributes, definitions ) }
				areas={ { content: InnerBlocksContent } }
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
 * @param component The component, from frame().
 */
export function blockSettings<
	Props extends PropDefinitions,
	Parts extends PartDefinitions,
>(
	component: Ported< Props, Parts >
): Pick< BlockConfiguration< Attributes >, 'icon' | 'example' | 'variations' > {
	const { props, parts, presets, defaultPreset, wpIcon } = component.port;
	const [ backgroundProp ] = mediaProps( props );
	// UPSTREAM: @wordpress/blocks types `example` and variations' inner blocks loosely.
	return {
		icon: ICONS[ wpIcon ],
		example: {
			attributes: {
				...defaultPreset.props,
				// A sample background, never saved: the preview shows what the block is for.
				...( defaultPreset.background &&
					backgroundProp && {
						[ backgroundProp ]: IMAGE_SAMPLE.url,
					} ),
			},
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
