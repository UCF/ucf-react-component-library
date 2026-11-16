// @vitest-environment happy-dom
// WHY happy-dom: the links field is rendered and clicked.
/**
 * The Section Nav in Puck: the page's Sections read from Puck's data
 * (integrations/puck/section-links.ts), and the links field that fills from them
 * (integrations/puck/links-field.tsx, through withPageSections()).
 */
import type { ComponentConfig } from '@puckeditor/core';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import type { Link } from '@/integrations/schema/props';
import config, { withPageSections } from '../integrations/puck/config.tsx';
import { LinksField } from '../integrations/puck/links-field.tsx';
import {
	puckSectionLinks,
	type PuckPage,
} from '../integrations/puck/section-links.ts';

const KEYS = { section: 'Section', heading: 'Heading' };
const item = ( type: string, props: Record< string, unknown > = {} ) => ( {
	type,
	props: { id: `${ type }-${ Math.random() }`, ...props },
} );
const section = ( anchor: string, blocks: unknown[] = [] ) =>
	item( 'Section', { anchor, blocks } );
const heading = ( content: string ) => item( 'Heading', { content } );

// The type check: withPageSections() gives a config Puck takes.
withPageSections( () => ( { content: [] } ) ) satisfies ComponentConfig<
	typeof config.defaultProps
>;

describe( 'puckSectionLinks', () => {
	it( 'links each Section with an anchor, by its first heading, in page order', () => {
		const page = {
			content: [
				section( 'overview', [
					heading( 'Overview' ),
					heading( 'Not this one' ),
				] ),
				section( '', [ heading( 'No anchor' ) ] ),
				// A Section inside Columns.
				item( 'Columns', {
					columns: [
						item( 'Column', {
							blocks: [
								section( 'apply', [ heading( 'Apply' ) ] ),
							],
						} ),
					],
				} ),
			],
		} as PuckPage;
		expect( puckSectionLinks( page, KEYS ) ).toEqual( [
			{ label: 'Overview', href: '#overview' },
			{ label: 'Apply', href: '#apply' },
		] );
	} );

	it( 'takes a heading inside other components, but not inside another Section', () => {
		const page = {
			content: [
				section( 'outer', [
					section( 'inner', [ heading( 'Inner' ) ] ),
					item( 'Card', { blocks: [ heading( 'Outer' ) ] } ),
				] ),
			],
		} as PuckPage;
		expect( puckSectionLinks( page, KEYS ) ).toEqual( [
			{ label: 'Outer', href: '#outer' },
			{ label: 'Inner', href: '#inner' },
		] );
	} );

	it( 'reads Puck’s drop zones, a Section with no heading by its anchor, and a site’s keys', () => {
		const page = {
			content: [],
			zones: {
				'Grid-1:items': [
					item( 'UCFSection', {
						anchor: 'faq',
						blocks: [ item( 'Title', { content: 'Questions' } ) ],
					} ),
					item( 'UCFSection', { anchor: 'contact' } ),
				],
			},
		} as PuckPage;
		expect(
			puckSectionLinks( page, {
				section: 'UCFSection',
				heading: 'Title',
			} )
		).toEqual( [
			{ label: 'Questions', href: '#faq' },
			{ label: 'contact', href: '#contact' },
		] );
	} );
} );

describe( 'the links field', () => {
	let container: HTMLDivElement;
	afterEach( () => {
		container?.remove();
	} );

	/**
	 * Renders the field as Puck would, keeping the links it was last given.
	 *
	 * @param value    Its links.
	 * @param sections The page's Section links.
	 * @param readOnly Whether Puck has locked it.
	 */
	const render = async (
		value: Link[],
		sections: Link[],
		readOnly = false
	) => {
		const changes: Link[][] = [];
		container = document.createElement( 'div' );
		document.body.append( container );
		await act( async () =>
			createRoot( container ).render(
				<LinksField
					label="Links"
					value={ value }
					onChange={ ( links ) => changes.push( links ) }
					readOnly={ readOnly }
					useSections={ () => sections }
				/>
			)
		);
		return changes;
	};
	const SECTIONS = [
		{ label: 'Overview', href: '#overview' },
		{ label: 'Tuition and Aid', href: '#tuition' },
	];

	it( 'fills an empty Section Nav from the page', async () => {
		expect( await render( [], SECTIONS ) ).toEqual( [ SECTIONS ] );
	} );

	it( 'leaves links an editor has alone until they update', async () => {
		const mine = [
			{ label: 'Costs', href: '#tuition' },
			{ label: 'Apply', href: 'https://www.ucf.edu/apply/' },
		];
		const changes = await render( mine, SECTIONS );
		expect( changes ).toEqual( [] );

		const update = [ ...container.querySelectorAll( 'button' ) ].find(
			( button ) => button.textContent === 'Update from sections'
		);
		await act( async () => update?.click() );
		expect( changes ).toEqual( [
			[
				{ label: 'Overview', href: '#overview' },
				{ label: 'Costs', href: '#tuition' },
				{ label: 'Apply', href: 'https://www.ucf.edu/apply/' },
			],
		] );
	} );

	it( 'changes nothing while Puck has it locked', async () => {
		expect( await render( [], SECTIONS, true ) ).toEqual( [] );
	} );
} );
