/**
 * The Section's markup contract, and its list of compositions.
 *
 * The snapshot is the markup a non-React host copies. WordPress stores the same markup in every
 * post with a Section block (see shared/__snapshots__/blocks.test.tsx.snap), so a change here
 * needs a major version and a deprecation.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import tokens from '../../tokens/tokens.json';
import Section, { type SectionProps } from './Section.tsx';
import { COMPOSITIONS } from './compositions.ts';

const cases: Record< string, SectionProps > = {
	defaults: {},
	'dark, constrained, cozy': {
		composition: 'dark',
		width: 'constrained',
		spacing: 'cozy',
	},
	compact: { spacing: 'compact' },
	'with an id and a class': { id: 'programs', className: 'is-featured' },
};

describe( 'Section', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders its markup: ${ name }`, () => {
			expect(
				renderToStaticMarkup(
					<Section { ...props }>
						<p>Content</p>
					</Section>
				)
			).toMatchSnapshot();
		} );
	}

	it( 'renders its content in the element a host passes as innerAs', () => {
		const Zone = ( props: object ) => <div data-zone="" { ...props } />;
		expect(
			renderToStaticMarkup( <Section innerAs={ Zone } /> )
		).toContain(
			'<div data-zone="" class="ucf-section__inner ucf-section__inner--default">'
		);
	} );
} );

// SYNC: compositions.ts copies this list, because the package can't read tokens.json.
it( 'offers exactly the compositions tokens.json defines, with their names', () => {
	const fromTokens = Object.entries( tokens.composition )
		.filter( ( [ key ] ) => ! key.startsWith( '$' ) )
		.map( ( [ value, composition ] ) => ( {
			value,
			label: (
				composition as { $extensions: { 'edu.ucf': { name: string } } }
			 ).$extensions[ 'edu.ucf' ].name,
		} ) );

	expect( COMPOSITIONS ).toEqual( fromTokens );
} );
