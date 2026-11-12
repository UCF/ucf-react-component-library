import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { Disabled, Notice, PanelBody, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { panelsOf } from '@/integrations/schema/props';
import { FieldControl } from '@/integrations/wp/inspector';
import DegreeList from '../../DegreeList.tsx';
import { PROPS, type DegreeListEditableProps } from '../../DegreeList.props.ts';
import { usePrograms } from '../../utils/usePrograms.ts';
import { editorSettings } from './settings.ts';

export type Attributes = DegreeListEditableProps;

/**
 * The editor shows the list from the Search Service, fetched in the browser, so an editor sees
 * what visitors will. render.php writes the same markup on the page
 * (tests/DegreeList.php.test.tsx).
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
	const state = usePrograms(
		{
			colleges: attributes.colleges,
			departments: attributes.departments,
			programTypes: attributes.programTypes,
		},
		{ apiRoot: editorSettings().apiRoot }
	);

	return (
		<>
			<InspectorControls>
				{ panelsOf( PROPS ).map( ( panel ) => (
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
			<div { ...blockProps }>
				{ state.status === 'error' ? (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'The programs could not be loaded from the Search Service. Visitors see the last list that loaded, or the message for no programs.',
							'ucf-degrees'
						) }
					</Notice>
				) : null }
				{ state.status === 'loading' && ! state.programs.length ? (
					<Spinner />
				) : (
					// WHY Disabled: WordPress's way to show a preview that can't be used. A link in
					// it can't navigate away from the editor or take focus, and a click selects
					// the block. The notice above stays outside: it's for the editor.
					<Disabled>
						<DegreeList
							programs={ state.programs }
							title={ attributes.title }
							columns={ attributes.columns }
							emptyMessage={ attributes.emptyMessage }
						/>
					</Disabled>
				) }
			</div>
		</>
	);
}
