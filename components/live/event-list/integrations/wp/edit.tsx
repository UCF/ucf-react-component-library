import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { Notice, PanelBody, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { MouseEvent } from 'react';

import { panelsOf } from '../../../../../integrations/schema/props.ts';
import { FieldControl } from '../../../../../integrations/wp/inspector.tsx';
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

	// WHY: an event link clicked in the canvas would navigate away from the editor.
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
			{ /* A11Y: a click handler on a wrapper, not an interactive control. It only
			     cancels navigation for links inside, which stay keyboard-reachable. */ }
			<div { ...blockProps } onClickCapture={ stopLinks }>
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
					<EventList
						events={ state.events }
						title={ attributes.title }
						columns={ attributes.columns }
						dates={ attributes.dates }
						descriptions={ attributes.descriptions }
						emptyMessage={ attributes.emptyMessage }
					/>
				) }
			</div>
		</>
	);
}
