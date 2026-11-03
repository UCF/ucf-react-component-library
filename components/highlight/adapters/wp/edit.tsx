import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, RadioControl, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import Highlight, { type HighlightProps } from '../../Highlight.tsx';
import { CHOICES, type ChoiceKey } from '../../options.ts';
import { VARIATIONS } from '../../variations.ts';
import { toBlocks } from './blocks.ts';
import { ownAttributes } from '../../../_config/wp.ts';
import metadata from './block.json';

// SYNC: the attributes in block.json.
export type Attributes = {
	[ Key in ChoiceKey ]: NonNullable< HighlightProps[ Key ] >;
};

/**
 * What a Highlight inserted without a design starts with: the statement's parts.
 *
 * WHY classes on core blocks: they are the part's name (Highlight.tsx, PARTS). The Highlight's
 * CSS styles them, and an editor sees them under Advanced, "Additional CSS class(es)".
 * WHY a starting point, not a lock: the frame's content is open; editors may change, move or
 * remove any of it. The other designs are block variations (index.tsx).
 */
const TEMPLATE = toBlocks( VARIATIONS[ 0 ]?.content ?? [] );

/**
 * The Highlight's inner element, holding the blocks placed inside it.
 *
 * WHY passed as `innerAs`: the inner-blocks area is then the Highlight's own inner element, as
 * in save() and in Puck, with no wrapper of WordPress's own in between.
 *
 * @param props The inner element's props from Highlight.
 */
function InnerBlocksArea( props: object ) {
	return <div { ...useInnerBlocksProps( props, { template: TEMPLATE } ) } />;
}

/**
 * The editor view: the Highlight, with its blocks editable inside it and its rule and
 * alignment in the sidebar.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const control = ( key: ChoiceKey ) => {
		const { label, control: type, options } = CHOICES[ key ];
		const props = {
			label,
			options: options.map( ( option ) => ( {
				value: option.value as string,
				label: option.label as string,
			} ) ),
			onChange: ( value: string ) => setAttributes( { [ key ]: value } ),
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
				<PanelBody title={ __( 'Highlight', 'ucf-content' ) }>
					{ ( Object.keys( CHOICES ) as ChoiceKey[] ).map( control ) }
				</PanelBody>
			</InspectorControls>

			<Highlight
				{ ...useBlockProps() }
				{ ...ownAttributes< HighlightProps >( attributes, metadata ) }
				innerAs={ InnerBlocksArea }
			/>
		</>
	);
}
