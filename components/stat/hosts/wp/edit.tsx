import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	PlainText as UntypedPlainText,
	useBlockProps,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { PanelBody, TextControl } from '@wordpress/components';
import type { ComponentType } from 'react';

import Stat from '../../Stat.tsx';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

// SYNC: the attributes in block.json.
export type Attributes = {
	statement: string;
	detail: string;
	source: string;
	sourceUrl: string;
	asOf: string;
};

/**
 * The editor view: the core component, with fields in its slots.
 *
 * WHY the statement and detail are typed in place but the source is in the sidebar: those two
 * are whole paragraphs, so a field fills each exactly. The source line is one sentence built
 * from three values; a field per value inline would split it into rows that look nothing
 * like what saves. It shows here as it will render, less its link.
 *
 * WHY PlainText rather than RichText: the attributes stay plain strings, which every host
 * can render without trusting stored HTML.
 *
 * @param props               The block's edit props.
 * @param props.attributes    Its attributes.
 * @param props.setAttributes Updates them.
 */
export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< Attributes > ) {
	const { statement, detail, source, sourceUrl, asOf } = attributes;
	const set = ( key: keyof Attributes ) => ( value: string ) =>
		setAttributes( { [ key ]: value } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Source', 'ucf-content' ) }>
					<TextControl
						__next40pxDefaultSize
						label={ __( 'Published by', 'ucf-content' ) }
						value={ source }
						onChange={ set( 'source' ) }
					/>
					<TextControl
						__next40pxDefaultSize
						label={ __( 'Link', 'ucf-content' ) }
						type="url"
						value={ sourceUrl }
						onChange={ set( 'sourceUrl' ) }
					/>
					<TextControl
						__next40pxDefaultSize
						label={ __( 'As of', 'ucf-content' ) }
						help={ __(
							'When the number was true, e.g. “fall 2025”.',
							'ucf-content'
						) }
						value={ asOf }
						onChange={ set( 'asOf' ) }
					/>
				</PanelBody>
			</InspectorControls>

			<Stat
				{ ...useBlockProps() }
				statement={
					<PlainText
						value={ statement }
						onChange={ set( 'statement' ) }
						placeholder={ __(
							'The fact, as a complete statement',
							'ucf-content'
						) }
						aria-label={ __( 'Statement', 'ucf-content' ) }
					/>
				}
				detail={
					<PlainText
						value={ detail }
						onChange={ set( 'detail' ) }
						placeholder={ __(
							'One sentence saying why the number matters',
							'ucf-content'
						) }
						aria-label={ __(
							'Supporting sentence',
							'ucf-content'
						) }
					/>
				}
				source={
					source ||
					__( 'add one in the block settings', 'ucf-content' )
				}
				asOf={ asOf }
			/>
		</>
	);
}
