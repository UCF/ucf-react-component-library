/**
 * The Button's markup contract: WordPress's serializer and React DOM's give the same HTML, and
 * it matches the snapshot. Our blocks save this markup inside theirs, so a change here is a
 * change to every saved block that uses the Button.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Button, { type ButtonProps } from '../Button.tsx';
import example from '../example.json';

const cases: Record< string, ButtonProps > = {
	example: example as ButtonProps,
	outline: { text: 'Visit campus', url: '/visit/', variant: 'outline' },
	'new tab': {
		text: 'Apply',
		url: 'https://apply.ucf.edu/',
		linkTarget: '_blank',
	},
	text: { text: 'See all programs', url: '/programs/', variant: 'text' },
	small: { text: 'Apply', url: '/apply/', fontSize: 'small' },
	large: { text: 'Apply', url: '/apply/', fontSize: 'body' },
	// SYNC: block attributes default to '', so a saved block passes empty strings.
	'no link yet': { text: 'Apply now', url: '', linkTarget: '' },
};

describe( 'Button', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Button { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// FIX: a new tab without `noopener` lets the opened page reach back into this one.
	it( 'protects the page when it opens a new tab', () => {
		expect(
			renderToStaticMarkup(
				<Button text="Apply" url="/apply/" linkTarget="_blank" />
			)
		).toContain( 'rel="noopener noreferrer"' );
	} );

	// WHY: as core's Button, no link means no address, not `href=""`, which links to the page.
	it( 'has no address until it has a link', () => {
		expect(
			renderToStaticMarkup( <Button text="Apply" url="" /> )
		).not.toContain( 'href' );
	} );
} );
