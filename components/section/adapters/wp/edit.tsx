import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, RadioControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import Section from '../../Section.tsx';
import { COMPOSITIONS, type Composition } from '../../compositions.ts';

// SYNC: the attributes in block.json (and `align`, which block.json defaults to full).
export type Attributes = {
	composition: Composition;
	width: 'default' | 'constrained' | 'wide';
	spacing: 'default' | 'cozy' | 'compact';
	align?: string;
};

/**
 * The Section's inner element, holding the blocks placed inside it.
 *
 * WHY passed to the Section as `innerAs`: the inner-blocks area is then the Section's own inner
 * element, as in save() and in Puck, with no wrapper of WordPress's own in between.
 *
 * @param props The inner element's props from Section.
 */
function InnerBlocksArea( props: object ) {
	return <div { ...useInnerBlocksProps( props ) } />;
}

/**
 * The editor view: the Section itself, with its blocks editable inside it and its settings in
 * the sidebar.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { composition, width, spacing } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Section', 'ucf-content' ) }>
					<SelectControl
						__next40pxDefaultSize
						label={ __( 'Composition', 'ucf-content' ) }
						help={ __(
							'The background, and so the colors of everything inside.',
							'ucf-content'
						) }
						value={ composition }
						options={ COMPOSITIONS.map( ( { value, label } ) => ( {
							value,
							label,
						} ) ) }
						onChange={ ( value ) =>
							setAttributes( {
								composition: value as Composition,
							} )
						}
					/>
					<RadioControl
						label={ __( 'Content width', 'ucf-content' ) }
						selected={ width }
						options={ [
							{
								value: 'default',
								label: __( 'Default', 'ucf-content' ),
							},
							{
								value: 'constrained',
								label: __( 'Constrained', 'ucf-content' ),
							},
							{
								value: 'wide',
								label: __( 'Wide', 'ucf-content' ),
							},
						] }
						onChange={ ( value ) =>
							setAttributes( {
								width: value as Attributes[ 'width' ],
							} )
						}
					/>
					<RadioControl
						label={ __( 'Spacing', 'ucf-content' ) }
						selected={ spacing }
						options={ [
							{
								value: 'default',
								label: __( 'Default', 'ucf-content' ),
							},
							{
								value: 'cozy',
								label: __( 'Cozy', 'ucf-content' ),
							},
							{
								value: 'compact',
								label: __( 'Compact', 'ucf-content' ),
							},
						] }
						onChange={ ( value ) =>
							setAttributes( {
								spacing: value as Attributes[ 'spacing' ],
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<Section
				{ ...useBlockProps() }
				composition={ composition }
				width={ width }
				spacing={ spacing }
				innerAs={ InnerBlocksArea }
			/>
		</>
	);
}
