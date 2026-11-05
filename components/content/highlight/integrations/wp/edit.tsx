import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody } from '@wordpress/components';

import Highlight, { type HighlightProps } from '../../Highlight.tsx';
import { PARTS } from '../../Highlight.parts.ts';
import { DEFAULT_PRESET } from '../../Highlight.presets.ts';
import { PROPS, type HighlightEditableProps } from '../../Highlight.props.ts';
import { resolveParts } from '../../../../../integrations/schema/parts.ts';
import { panelsOf } from '../../../../../integrations/schema/props.ts';
import { ownAttributes } from '../../../../../integrations/wp/attributes.ts';
import { toBlocks } from '../../../../../integrations/wp/blocks.mapper.ts';
import { FieldControl } from '../../../../../integrations/wp/inspector.tsx';
import metadata from './block.json';

// SYNC: block.json's attributes, which parity.test.tsx checks against the prop definitions.
export type Attributes = HighlightEditableProps;

/**
 * The block's template: what a Highlight inserted without picking a preset starts with
 * (DEFAULT_PRESET in Highlight.presets.ts), as core blocks. The presets are block variations
 * (index.tsx).
 *
 * WHY classes on core blocks: they are the part's look (Highlight.parts.ts). The Highlight's
 * CSS styles them, and an editor sees them under Advanced, "Additional CSS class(es)".
 * WHY a starting point, not a lock: the frame's content is open; editors may change, move or
 * remove any of it.
 */
const DEFAULT_BLOCKS = toBlocks( resolveParts( PARTS, DEFAULT_PRESET.parts ) );

// The sidebar's panels, from the prop definitions (each prop's `panel`).
const PANELS = panelsOf( PROPS );

/**
 * The Highlight's inner element, holding the blocks placed inside it.
 *
 * WHY passed as `innerAs`: the inner-blocks area is then the Highlight's own inner element, as
 * in save() and in Puck, with no wrapper of WordPress's own in between.
 *
 * @param props The inner element's props from Highlight.
 */
function InnerBlocksArea( props: object ) {
	return (
		<div
			{ ...useInnerBlocksProps( props, { template: DEFAULT_BLOCKS } ) }
		/>
	);
}

/**
 * The editor view: the Highlight, with its blocks editable inside it and its props' fields in
 * the sidebar, grouped in panels as the prop definitions say.
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
				{ PANELS.map( ( panel ) => (
					<PanelBody key={ panel.title } title={ panel.title }>
						{ panel.keys.map( ( key ) => (
							<FieldControl
								key={ key }
								definition={ PROPS[ key ] }
								value={ attributes[ key ] }
								onChange={ ( value ) =>
									setAttributes( { [ key ]: value } )
								}
							/>
						) ) }
					</PanelBody>
				) ) }
			</InspectorControls>

			<Highlight
				{ ...useBlockProps() }
				{ ...ownAttributes< HighlightProps >( attributes, metadata ) }
				innerAs={ InnerBlocksArea }
			/>
		</>
	);
}
