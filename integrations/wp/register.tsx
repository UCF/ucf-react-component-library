/**
 * CONTEXT: the WordPress translator: a component's definition (integrations/schema/definition.ts)
 * as a block. Its props become the sidebar, in their panels; its presets become block
 * variations, the default one the block's template and inserter preview; and edit() and save()
 * render the component as a frame, its content WordPress's inner blocks.
 *
 *   registerComponent( card, metadata );   // a component's integrations/wp/index.tsx
 *
 * WHY save() renders the component itself: what it returns is stored in every post, so it must
 * be the component's markup and nothing else (docs/architecture.md, "Changing a content
 * component's markup"). Its markup snapshot and integrations/tests/blocks.test.tsx check it.
 * WHY inner blocks for the content: an editor changes it there; docs/architecture.md, "How
 * content reaches a frame", says why WordPress binds to the frame, not the content layer, for
 * now.
 */
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	registerBlockType,
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
import { resolveParts, type Looks } from '../schema/parts.ts';
import {
	panelsOf,
	type PropDefinitions,
	type TextProp,
} from '../schema/props.ts';
import { ownAttributes } from './attributes.ts';
import { toBlocks, toExampleBlocks } from './blocks.mapper.ts';
import { ICONS } from './icons.ts';
import { FieldControl } from './inspector.tsx';

type Attributes = Record< string, unknown >;
type SetAttributes = ( attributes: Attributes ) => void;

/**
 * A `control: 'media'` prop's field: the media library picker, which sets the URL and the ID
 * together, and a button to remove the image.
 *
 * WHY in the sidebar only: an image under the content (a card's background) can't be clicked
 * on the canvas.
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
 * Registers a component's block, with its presets as variations.
 *
 * @param definition The component's definition.
 * @param metadata   Its block.json.
 */
export function registerComponent<
	Definitions extends PropDefinitions,
	L extends Looks,
>( definition: ComponentDefinition< Definitions, L >, metadata: object ) {
	const {
		component: Component,
		props: definitions,
		parts,
		presets,
		defaultPreset,
	} = definition;
	const json = metadata as { attributes: Record< string, unknown > };

	// The block's template: what a block inserted without picking a preset starts with.
	// WHY a starting point, not a lock: a frame's content is open; editors may change any of it.
	const template = toBlocks( resolveParts( parts, defaultPreset.parts ) );
	const panels = panelsOf( definitions );

	/**
	 * The frame's inner element in the editor, holding the blocks placed inside it.
	 *
	 * WHY passed as `innerAs`: the inner-blocks area is then the frame's own inner element, as
	 * in save() and in Puck, with no wrapper of WordPress's own in between.
	 *
	 * @param props The inner element's props from the component.
	 */
	function InnerBlocksArea( props: object ) {
		return <div { ...useInnerBlocksProps( props, { template } ) } />;
	}

	/**
	 * The saved inner element, with the blocks placed inside the frame.
	 *
	 * @param props The inner element's props from the component.
	 */
	function InnerBlocksContent( props: Record< string, unknown > ) {
		return <div { ...useInnerBlocksProps.save( props ) } />;
	}

	/**
	 * The editor view: the frame, with its blocks editable inside it and its props' fields in
	 * the sidebar, grouped in panels as the prop definitions say.
	 *
	 * @param props               The block's edit props.
	 * @param props.attributes    Its attributes.
	 * @param props.setAttributes Updates them.
	 */
	function Edit( {
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
								] as Definitions[ string ];
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
	}

	/**
	 * The stored markup: the frame, its attributes as props, its inner blocks inside.
	 *
	 * @param props            The block's save props.
	 * @param props.attributes Its attributes.
	 */
	function save( { attributes }: BlockSaveProps< Attributes > ) {
		return (
			<Component
				{ ...useBlockProps.save() }
				{ ...ownAttributes( attributes, json ) }
				innerAs={ InnerBlocksContent }
			/>
		);
	}

	// UPSTREAM: TypeScript reads block.json values as plain strings, and @wordpress/blocks types
	// `example` and variations' inner blocks loosely, so they need the casts.
	registerBlockType< Attributes >(
		metadata as unknown as BlockConfiguration< Attributes >,
		{
			icon: ICONS[ definition.wpIcon ],
			// The inserter's preview: the default preset, with sample content.
			example: {
				attributes: defaultPreset.props,
				innerBlocks: toExampleBlocks(
					toBlocks( resolveParts( parts, defaultPreset.parts ), {
						sample: true,
					} )
				),
			} as unknown as BlockConfiguration< Attributes >[ 'example' ],
			// Each preset as a variation: its own entry in the inserter ("Card: Pathway"), and
			// still the one block. WHY a default: inserting the block gives the common one.
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
			edit: Edit,
			save,
		}
	);
}
