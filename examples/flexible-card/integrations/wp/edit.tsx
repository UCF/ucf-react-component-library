import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import FlexibleCard from '../../FlexibleCard.tsx';
import { VARIANTS, type Variant } from '../../options.ts';

// SYNC: the attributes in block.json.
export type Attributes = {
	variant: Variant;
};

/**
 * What a new Card starts with: the theme Card pattern's pieces, as core blocks.
 *
 * WHY a starting point, not a lock: a card's content varies, so editors may change,
 * move or remove any of it.
 */
const TEMPLATE: [ string, Record< string, unknown > ][] = [
	[ 'core/image', { aspectRatio: '3/2', scale: 'cover' } ],
	[ 'core/heading', { level: 3, placeholder: __( 'Title', 'ucf-content' ) } ],
	[
		'core/paragraph',
		{ placeholder: __( 'One or two sentences', 'ucf-content' ) },
	],
];

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

/**
 * The editor view: the frame, with its blocks editable inside it and its look in the sidebar.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Card', 'ucf-content' ) }>
					<RadioControl
						label={ VARIANTS.label }
						selected={ attributes.variant }
						options={ VARIANTS.options.map( ( option ) => ( {
							...option,
						} ) ) }
						onChange={ ( value ) =>
							setAttributes( { variant: value as Variant } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<FlexibleCard
				{ ...useBlockProps() }
				variant={ attributes.variant }
				innerAs={ InnerBlocksArea }
			/>
		</>
	);
}
