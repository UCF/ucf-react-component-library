import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { MouseEvent } from 'react';

import DegreeFinder from '../../DegreeFinder.tsx';
import { DEFAULTS } from '../../defaults.ts';

// SYNC: the attributes in block.json.
export type Attributes = {
	/** A program type slug, or '' to ask the visitor. */
	programType: string;
};

/**
 * The editor shows the live finder, so an editor can try it the way a visitor will.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const blockProps = useBlockProps();
	const settings = window.ucfDegreeFinderSettings ?? {};

	// WHY: a result link clicked while trying the finder would navigate away from the editor.
	// FIX: the editor canvas is an iframe with its own Element class, so `instanceof Element`
	// is always false for targets inside it. Check for closest() instead.
	function stopLinks( event: MouseEvent ) {
		const target = event.target as Partial< Element >;
		if ( typeof target.closest === 'function' && target.closest( 'a' ) ) {
			event.preventDefault();
		}
	}

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'ucf-degrees' ) }>
					<SelectControl
						__next40pxDefaultSize
						label={ __( 'Degree type', 'ucf-degrees' ) }
						help={ __(
							'On a page about one degree type, such as a masters page, choose it here and the finder skips that question.',
							'ucf-degrees'
						) }
						value={ attributes.programType }
						options={ [
							{
								value: '',
								label: __( 'Ask the visitor', 'ucf-degrees' ),
							},
							...DEFAULTS.programTypes.map( ( type ) => ( {
								value: type.slug,
								label: type.label,
							} ) ),
						] }
						onChange={ ( programType ) =>
							setAttributes( { programType } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			{ /* A11Y: a click handler on a wrapper, not an interactive control. It only
			     cancels navigation for links inside, which stay keyboard-reachable. */ }
			<div { ...blockProps } onClickCapture={ stopLinks }>
				<DegreeFinder
					apiRoot={ settings.apiRoot }
					searchUrl={ settings.searchUrl }
					programType={ attributes.programType || undefined }
				/>
			</div>
		</>
	);
}
