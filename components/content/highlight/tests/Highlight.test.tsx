/**
 * The markup contract.
 *
 * Two checks per case:
 *   1. WordPress's serializer (what `save()` stores and validates against) and React DOM's
 *      (what every other React host renders) produce the same HTML. If they ever differ, the
 *      hosts no longer show the same thing.
 *   2. That HTML matches the committed snapshot. A change here is a change to every saved
 *      post: update the snapshot only alongside a major version and a block deprecation.
 *
 * The snapshot is also the markup a non-React host copies to render a stat itself.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderToString } from '@wordpress/element';

import Highlight, { type HighlightProps } from '../Highlight.tsx';
import { PARTS } from '../Highlight.parts.ts';
import { PRESETS } from '../Highlight.presets.ts';

// What `useBlockProps.save()` adds for this block.
// SYNC: the block name in wp/block.json.
const WP_WRAPPER = { className: 'wp-block-ucf-content-highlight' };

const cases: Record< string, HighlightProps > = {
	empty: {},
	// Each preset's props.
	...Object.fromEntries(
		PRESETS.map( ( preset ) => [
			`the ${ preset.name } preset`,
			preset.props,
		] )
	),
	'the template’s parts': {
		children: (
			<>
				<p className={ PARTS.statement.className }>
					Two million square feet of research space
				</p>
				<p className={ PARTS.source.className }>Source: UCF Research</p>
			</>
		),
	},
};

describe( 'Highlight', () => {
	for ( const [ name, props ] of Object.entries( cases ) ) {
		it( `renders the same in WordPress and React: ${ name }`, () => {
			const element = <Highlight { ...WP_WRAPPER } { ...props } />;
			const html = renderToStaticMarkup( element );

			expect( renderToString( element ) ).toBe( html );
			expect( html ).toMatchSnapshot();
		} );
	}

	// WHY: WordPress and Puck each edit the content through their own element. If the Highlight
	// rendered its children anywhere else, blocks dropped in would land outside the frame.
	it( 'renders its content area as the element a host passes for it', () => {
		const Zone = ( props: object ) => (
			<div data-zone="" { ...props }>
				<p>Dropped in</p>
			</div>
		);
		expect(
			renderToStaticMarkup(
				<Highlight.port.Frame areas={ { content: Zone } } />
			)
		).toContain(
			'<div data-zone="" class="ucf-c-highlight__content"><p>Dropped in</p></div>'
		);
	} );
} );

// WHY: a part class with no rule does nothing; an editor who picks it sees no change.
it( 'styles every part class', () => {
	const css = readFileSync(
		new URL( '../style.css', import.meta.url ),
		'utf8'
	);
	const partDefinitions: { kind: string; className?: string }[] =
		Object.values( PARTS );
	const unstyled = partDefinitions
		.map( ( definition ) => definition.className )
		.filter(
			( className ): className is string =>
				Boolean( className ) && ! css.includes( `.${ className }` )
		);
	expect( unstyled ).toEqual( [] );
} );
