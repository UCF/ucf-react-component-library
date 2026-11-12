/**
 * The list prop type: any number of values from a list, fixed or loaded (integrations/schema/
 * props.ts), and how each environment shows it. The Degree List's colleges, departments and
 * program types are the first.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { puckFields } from '../puck/config.tsx';
import { loadOptions } from '../react/options.ts';
import { chosenOf, valuesOf } from '../schema/options.ts';
import { defaultsIn, type PropDefinitions } from '../schema/props.ts';
import { argTypesOf } from '../storybook/arg-types.ts';
import { blockAttributes } from '../wp/attributes.ts';

const OPTIONS = [
	{ value: 'sciences', label: 'College of Sciences' },
	{ value: 'nursing', label: 'College of Nursing' },
];

const PROPS = {
	fixed: {
		type: 'list',
		label: 'Fixed',
		options: OPTIONS,
		default: [],
	},
	loaded: {
		type: 'list',
		label: 'Loaded',
		options: async () => OPTIONS,
		default: [ 'sciences' ],
	},
} as const satisfies PropDefinitions;

describe( 'a list prop', () => {
	it( 'is an array attribute of strings in WordPress, with its default', () => {
		expect( blockAttributes( PROPS ) ).toEqual( {
			fixed: { type: 'array', items: { type: 'string' }, default: [] },
			loaded: {
				type: 'array',
				items: { type: 'string' },
				default: [ 'sciences' ],
			},
		} );
		expect( defaultsIn( PROPS, 'puck' ) ).toEqual( {
			fixed: [],
			loaded: [ 'sciences' ],
		} );
	} );

	it( 'is checkboxes in Storybook when fixed, and its values as JSON when loaded', () => {
		expect( argTypesOf( PROPS ) ).toEqual( {
			fixed: { control: 'check', options: [ 'sciences', 'nursing' ] },
			loaded: { control: 'object' },
		} );
	} );

	it( 'is a custom field in Puck: labelled checkboxes, with saved values checked', () => {
		const field = puckFields( PROPS ).fixed;
		expect( field ).toMatchObject( { type: 'custom', label: 'Fixed' } );

		const html = renderToStaticMarkup(
			field.render( {
				field: {},
				name: 'fixed',
				id: 'fixed',
				value: [ 'nursing' ],
				onChange: () => {},
			} )
		);
		expect( html ).toMatch(
			/^<fieldset[^>]*><legend[^>]*>Fixed<\/legend>/
		);
		expect( html ).toMatch(
			/<input id="[^"]*-nursing" type="checkbox" checked=""\/><label for="[^"]*-nursing">College of Nursing<\/label>/
		);
		expect( html ).toMatch(
			/<input id="[^"]*-sciences" type="checkbox"\/>/
		);
	} );
} );

describe( 'a list’s saved values', () => {
	it( 'show by label, and a value no option has shows as a problem once the options load', () => {
		expect( chosenOf( [ 'nursing', 'gone' ], OPTIONS ) ).toEqual( [
			{ value: 'nursing', label: 'College of Nursing', known: true },
			{ value: 'gone', label: 'gone', known: false },
		] );
		// WHY: while the options load, nothing is flagged yet.
		expect( chosenOf( [ 'gone' ], null ) ).toEqual( [
			{ value: 'gone', label: 'gone', known: true },
		] );
	} );

	it( 'are saved from what an editor picked, by label, each once', () => {
		expect(
			valuesOf(
				[ 'College of Nursing', 'gone', 'College of Nursing' ],
				OPTIONS
			)
		).toEqual( [ 'nursing', 'gone' ] );
	} );
} );

describe( 'loading a list’s options', () => {
	it( 'asks once a page, however many fields open', async () => {
		const loader = vi.fn( async () => OPTIONS );
		await Promise.all( [ loadOptions( loader ), loadOptions( loader ) ] );
		await loadOptions( loader );
		expect( loader ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'forgets a failure, so the next field tries again', async () => {
		const loader = vi
			.fn()
			.mockRejectedValueOnce( new Error( 'down' ) )
			.mockResolvedValueOnce( OPTIONS );
		await expect( loadOptions( loader ) ).rejects.toThrow( 'down' );
		await expect( loadOptions( loader ) ).resolves.toEqual( OPTIONS );
		expect( loader ).toHaveBeenCalledTimes( 2 );
	} );
} );
