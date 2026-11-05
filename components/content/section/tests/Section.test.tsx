/**
 * The Section's markup contract. Its list of compositions is checked in
 * integrations/tests/compositions.test.ts.
 *
 * The snapshot is the markup a non-React host copies. WordPress stores the same markup in every
 * post with a Section block (see integrations/tests/__snapshots__/blocks.test.tsx.snap), so a
 * change here
 * needs a major version and a deprecation.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Section, { type SectionProps } from '../Section.tsx';

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
