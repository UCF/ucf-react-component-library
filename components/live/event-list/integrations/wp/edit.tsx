import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { Disabled, Notice, PanelBody, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { panelsOf } from '@/integrations/schema/props.js';
import { FieldControl } from '@/integrations/wp/inspector.js';
import EventList from '../../EventList.tsx';
import { PROPS, type EventListEditableProps } from '../../EventList.props.ts';
import { useEvents } from '../../utils/useEvents.ts';
import { editorSettings } from './settings.ts';

export type Attributes = EventListEditableProps;

/**
 * The editor shows the list from the feed, fetched in the browser, so an editor sees what
 * visitors will. render.php writes the same markup on the page (tests/EventList.php.test.tsx).
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
	const state = useEvents( {
		feedUrl: attributes.feedUrl || editorSettings().feedUrl || '',
		limit: Number( attributes.limit ),
		offset: Number( attributes.offset ),
	} );

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
							'The events feed could not be loaded. Check the Feed URL. Visitors see the message for no events until it loads.',
							'ucf-events'
						) }
					</Notice>
				) : null }
				{ state.status === 'loading' && ! state.events.length ? (
					<Spinner />
				) : (
					// WHY Disabled: WordPress's way to show a preview that can't be used. It makes
					// the list inert, so an event link can't navigate away from the editor or
					// take focus, and a click selects the block. The notice above stays outside:
					// it's for the editor.
					<Disabled>
						<EventList
							events={ state.events }
							title={ attributes.title }
							columns={ attributes.columns }
							dates={ attributes.dates }
							descriptions={ attributes.descriptions }
							emptyMessage={ attributes.emptyMessage }
						/>
					</Disabled>
				) }
			</div>
		</>
	);
}
