/**
 * The Image's markup contract: WordPress's serializer and React DOM's give the same HTML, and
 * it matches the snapshot. Our blocks save this markup inside theirs, so a change here is a
 * change to every saved block that uses the Image.
 */
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Image, { type ImageProps } from '../Image.tsx';

const url = 'https://www.ucf.edu/files/2026/01/students.jpg';

const cases: Record< string, ImageProps > = {
	'from the media library, cropped': {
		url,
		alt: 'Students walking past the Student Union',
		id: 1234,
		aspectRatio: '3/2',
	},
	'by URL, its own shape': { url, alt: '' },
	// SYNC: block attributes default to 0 and '', so a saved block passes those.
	'no attachment yet': { url, alt: '', id: 0, aspectRatio: '' },
};

describe( 'Image', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Image { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// UPSTREAM: WordPress adds responsive sizes only to an <img> with this class.
	it( 'carries wp-image-{id} only when it came from the media library', () => {
		expect(
			renderToStaticMarkup( <Image url={ url } alt="" id={ 1234 } /> )
		).toContain( 'wp-image-1234' );
		expect(
			renderToStaticMarkup( <Image url={ url } alt="" id={ 0 } /> )
		).not.toContain( 'wp-image' );
	} );
} );
