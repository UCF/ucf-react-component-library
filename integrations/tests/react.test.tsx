/**
 * CONTEXT: every component's presets render on a plain React site, with no CMS: from its
 * package entry and `@ucf/components/react` alone (integrations/react/parts.tsx), as a Next
 * site would.
 */
import type { ComponentType, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import imageExample from '@/components/primitives/image/example.json';
import { Card as CardWithPresets } from '@/components/content/card/index';
import { presetContent } from '../react/index.ts';
import type { PartDefinitions } from '../schema/parts.ts';

type Entry = Record< string, unknown >;
type Preset = {
	name: string;
	props: Record< string, unknown >;
	background?: boolean;
	parts: { part: string }[];
};

const entries = import.meta.glob< Entry >( '../../components/*/*/index.ts', {
	eager: true,
} );

// `../../components/content/card/index.ts` → `card`.
const componentOf = ( file: string ) => file.split( '/' )[ 4 ] ?? file;
const pascal = ( name: string ) =>
	name.replace( /(^|-)(\w)/g, ( _, __, letter: string ) =>
		letter.toUpperCase()
	);
const constant = ( name: string ) => name.toUpperCase().replace( /-/g, '_' );

// Components whose entry exports presets (integrations/tests/exports.test.ts checks which must),
// and has some: the Section and the Hero have none yet.
const withPresets = Object.entries( entries )
	.map( ( [ file, entry ] ) => ( { component: componentOf( file ), entry } ) )
	.filter(
		( { component, entry } ) =>
			(
				entry[ `${ constant( component ) }_PRESETS` ] as
					unknown[] | undefined
			 )?.length
	);

it( 'finds the components with presets', () => {
	expect( withPresets.length ).toBeGreaterThan( 0 );
} );

describe.each( withPresets.map( ( item ) => [ item.component, item ] ) )(
	'%s',
	( component, { entry } ) => {
		const Component = entry[ pascal( component ) ] as ComponentType< {
			children?: ReactNode;
		} >;
		const partDefinitions = entry[
			`${ constant( component ) }_PARTS`
		] as PartDefinitions;
		const presets = entry[
			`${ constant( component ) }_PRESETS`
		] as Preset[];

		describe.each( presets )( 'the $name preset', ( preset ) => {
			const html = renderToStaticMarkup(
				<Component { ...preset.props }>
					{ presetContent( partDefinitions, preset as never, {
						imageUrl: '/photo.jpg',
					} ) }
				</Component>
			);

			it( 'renders each of its parts, with the class that styles it', () => {
				const missing = preset.parts
					.map( ( { part } ) => partDefinitions[ part ]?.className )
					.filter(
						( className ): className is string =>
							className !== undefined &&
							! html.includes( className )
					);
				expect( missing ).toEqual( [] );
			} );

			it( 'shows the site’s image in an image part', () => {
				const images = preset.parts.filter(
					( { part } ) => partDefinitions[ part ]?.kind === 'image'
				);
				expect( html.includes( 'src="/photo.jpg"' ) ).toBe(
					images.length > 0
				);
			} );
		} );
	}
);

// --- Components built with frame(): they take `preset` and `content` (integrations/react/frame.tsx).

type Wrapped = ComponentType< Record< string, unknown > > & {
	port: { presets: Preset[]; parts: PartDefinitions };
};

const wrapped = withPresets.flatMap( ( { component, entry } ) => {
	const Component = entry[ pascal( component ) ] as Partial< Wrapped >;
	return Component.port
		? [ [ component, Component as Wrapped ] as const ]
		: [];
} );

it( 'finds the components that take a preset', () => {
	expect( wrapped.map( ( [ component ] ) => component ) ).toContain( 'card' );
} );

/**
 * Content for a part, of its kind, which no preset's sample text contains: each part's own, so
 * the order of the parts can be checked.
 *
 * @param part Its name.
 * @param kind Its kind.
 */
const contentFor = ( part: string, kind: string | undefined ) =>
	( {
		text: `Site ${ part }`,
		heading: `Site ${ part }`,
		link: { text: `Site ${ part }`, url: `/site-${ part }` },
		button: { text: `Site ${ part }`, url: `/site-${ part }` },
		image: { url: `/site-${ part }.jpg`, alt: '' },
	} )[ kind ?? 'text' ];

/**
 * A preset's sample text that appears in some markup.
 *
 * @param html   The markup.
 * @param preset The preset.
 */
const sampleTextIn = ( html: string, preset: Preset ) =>
	( preset.parts as unknown as { text?: string }[] )
		.flatMap( ( part ) => ( part.text ? [ part.text ] : [] ) )
		.filter( ( text ) => html.includes( text ) );

describe.each( wrapped )( '%s with a preset', ( _, Component ) => {
	const { presets, parts: partDefinitions } = Component.port;
	const render = ( props: Record< string, unknown > ) =>
		renderToStaticMarkup( <Component { ...props } /> );

	describe.each( presets )( 'the $name preset', ( preset ) => {
		const content = Object.fromEntries(
			preset.parts.map( ( { part } ) => [
				part,
				contentFor( part, partDefinitions[ part ]?.kind ),
			] )
		);

		// WHY: the preset prop must give the markup the other environments give: the preset's
		// props, and its parts drawn with the primitives.
		it( 'with `sample`, renders what presetContent() does', () => {
			const Plain = Component as ComponentType<
				Record< string, unknown >
			>;
			expect( render( { preset: preset.name, sample: true } ) ).toBe(
				renderToStaticMarkup(
					<Plain
						{ ...preset.props }
						{ ...( preset.background && {
							imageSrc: imageExample.url,
						} ) }
					>
						{ presetContent( partDefinitions, preset as never, {
							imageUrl: imageExample.url,
						} ) }
					</Plain>
				)
			);
		} );

		it( 'fills each part from `content`, in the preset’s order and looks', () => {
			const html = render( { preset: preset.name, content } );
			const expected = preset.parts.map( ( { part } ) => {
				const value = content[ part ];
				return typeof value === 'string'
					? value
					: ( ( value as { text?: string; url: string } ).text ??
							( value as { url: string } ).url );
			} );
			// Every part's content, in order, each with its look's class.
			const positions = expected.map( ( text ) => html.indexOf( text ) );
			expect( positions.every( ( at ) => at >= 0 ) ).toBe( true );
			expect( [ ...positions ].sort( ( a, b ) => a - b ) ).toEqual(
				positions
			);
			const unstyled = preset.parts
				.map( ( { part } ) => partDefinitions[ part ]?.className )
				.filter(
					( className ): className is string =>
						className !== undefined && ! html.includes( className )
				);
			expect( unstyled ).toEqual( [] );
			// None of the preset's sample text.
			expect( sampleTextIn( html, preset ) ).toEqual( [] );
		} );

		// WHY: a preset's sample copy must not reach a live page because a site left a part out.
		it( 'leaves out a part with no content', () => {
			expect(
				sampleTextIn( render( { preset: preset.name } ), preset )
			).toEqual( [] );
		} );
	} );

	const [ first ] = presets;

	// A prop one preset sets and another sets differently: the override to try.
	const override = presets
		.flatMap( ( preset ) =>
			Object.entries( preset.props ).flatMap( ( [ key, value ] ) =>
				presets
					.filter(
						( other ) =>
							key in other.props && other.props[ key ] !== value
					)
					.map( ( other ) => ( {
						preset,
						key,
						value: other.props[ key ],
					} ) )
			)
		)
		.at( 0 );

	// WHY two or more: the check needs a prop two presets set differently.
	it.runIf( presets.length > 1 )(
		'lets the props passed win over the preset’s',
		() => {
			// WHY a prop two presets set differently: overriding with the preset's own value would
			// pass whichever won.
			const { preset, key, value } = override ?? {
				preset: { name: '', props: {} },
				key: 'missing',
				value: undefined,
			};
			const root = ( html: string ) => html.split( '>' )[ 0 ];
			expect( override ).toBeDefined();
			expect(
				root( render( { preset: preset.name, [ key ]: value } ) )
			).toBe( root( render( { ...preset.props, [ key ]: value } ) ) );
		}
	);

	it( 'puts children in place of the preset’s parts: the frame stays open', () => {
		const html = render( {
			preset: first?.name,
			sample: true,
			children: <p>Anything</p>,
		} );
		expect( html ).toContain( '<p>Anything</p>' );
		expect( first && sampleTextIn( html, first ) ).toEqual( [] );
	} );

	it( 'without a preset, renders as the component itself', () => {
		expect( render( { children: <p>Plain</p> } ) ).toContain(
			'<p>Plain</p>'
		);
	} );
} );

// The props' types follow the presets (checked by `npm run typecheck`, not at run time).
export const typeChecks = [
	<CardWithPresets
		key="ok"
		preset="pathway"
		content={ { eyebrow: 'Transfer', link: { text: 'Go', url: '/' } } }
	/>,
	<CardWithPresets key="plain" variant="boxed">
		<p>Anything</p>
	</CardWithPresets>,
	<CardWithPresets key="attrs" className="x" aria-label="x" data-x="y" />,
	// @ts-expect-error: only a site's attributes (class, id, style, aria-*, data-*); hosts use the port.
	<CardWithPresets key="html" contentEditable />,
	// @ts-expect-error: a preset the Card doesn't have.
	<CardWithPresets key="preset" preset="pathways" />,
	// @ts-expect-error: a part the pathway card doesn't hold (the media tile's tag).
	<CardWithPresets key="part" preset="pathway" content={ { tag: 'x' } } />,
	// @ts-expect-error: a link is its text and its address, not a string.
	<CardWithPresets key="kind" preset="pathway" content={ { link: 'Go' } } />,
	// @ts-expect-error: content with no preset: there are no parts to fill.
	<CardWithPresets key="none" content={ { eyebrow: 'Transfer' } } />,
];
