/**
 * The Event List's editor view: the preview can't be clicked through.
 *
 * WHY: an event link clicked in the editor canvas would navigate away from the editor.
 * WordPress's `<Disabled>` makes the preview inert, so links can't be clicked or focused, and
 * a click selects the block.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';

import { SAMPLE_EVENTS } from '../sample-data.ts';

// WHY stubbed: these need a running block editor, and the test is about the preview only.
vi.mock( '@wordpress/block-editor', () => ( {
	InspectorControls: () => null,
	useBlockProps: () => ( { className: 'wp-block' } ),
} ) );
vi.mock( '../utils/useEvents.ts', () => ( {
	useEvents: () => ( {
		status: 'ready',
		events: SAMPLE_EVENTS.slice( 0, 2 ),
	} ),
} ) );
vi.mock( '../integrations/wp/settings.ts', () => ( {
	editorSettings: () => ( {} ),
} ) );

const { default: Edit } = await import( '../integrations/wp/edit.tsx' );
const { PROPS } = await import( '../EventList.props.ts' );
const { defaultsIn } =
	await import( '../../../../integrations/schema/props.ts' );

describe( 'the Event List in the editor', () => {
	test( 'shows its preview inside an inert wrapper, links and all', () => {
		// WHY a cast: the block editor passes more (clientId, isSelected…), which Edit doesn't read.
		const props = {
			attributes: defaultsIn( PROPS, 'wp' ),
			setAttributes: () => {},
		} as unknown as Parameters< typeof Edit >[ 0 ];
		const html = renderToStaticMarkup( <Edit { ...props } /> );

		const inert = html.search( /<div[^>]*\binert\b/ );
		const list = html.indexOf( 'ucf-c-event-list' );
		const firstLink = html.indexOf( '<a href=' );

		expect( list ).toBeGreaterThan( -1 );
		expect( firstLink ).toBeGreaterThan( -1 );
		expect( inert ).toBeGreaterThan( -1 );
		expect( inert ).toBeLessThan( list );
	} );
} );
