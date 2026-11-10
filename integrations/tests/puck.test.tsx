/**
 * CONTEXT: checks every Puck config against the real Puck, which the library itself never
 * imports (integrations/puck/types.ts).
 *
 *   - Types: each config must be assignable to Puck's own `ComponentConfig`. This is checked by
 *     `npm run typecheck`, not by the test run: a config that no longer fits Puck's shape is a
 *     type error here.
 *   - Render: Puck calls `render` with its own props (`id`, `puck`, `editMode`) beside the
 *     component's. None of them may reach the markup.
 *
 * SYNC: add each new `puck/config.tsx` to CONFIGS.
 * UPSTREAM: `@puckeditor/core` is a dev dependency only, for this file.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import button from '@/components/primitives/button/integrations/puck/config';
import heading from '@/components/primitives/heading/integrations/puck/config';
import image from '@/components/primitives/image/integrations/puck/config';
import paragraph from '@/components/primitives/paragraph/integrations/puck/config';
import card, {
	withTemplate as cardWithTemplate,
	withPreset as cardWithPreset,
} from '@/components/content/card/integrations/puck/config';
import {
	DEFAULT_PRESET as DEFAULT_CARD_PRESET,
	PRESETS as CARD_PRESETS,
} from '@/components/content/card/Card.presets';
import degreeFinder from '@/components/interactive/degree-finder/integrations/puck/config';
import eventList from '@/components/live/event-list/integrations/puck/config';
import hero, {
	withTemplate as heroWithTemplate,
} from '@/components/content/hero/integrations/puck/config';
import section, {
	withTemplate as sectionWithTemplate,
} from '@/components/content/section/integrations/puck/config';
import highlight, {
	withTemplate as highlightWithTemplate,
	withPreset as highlightWithPreset,
} from '@/components/content/highlight/integrations/puck/config';
import { PRESETS as HIGHLIGHT_PRESETS } from '@/components/content/highlight/Highlight.presets';
import imageExample from '@/components/primitives/image/example.json';
import type { PuckComponentConfig } from '../puck/types.ts';

type PropsOf< Config > =
	Config extends PuckComponentConfig< infer Props > ? Props : never;

const CONFIGS = {
	Highlight: highlight,
	'Degree Finder': degreeFinder,
	'Event List': eventList,
	Section: section,
	Hero: hero,
	Button: button,
	Image: image,
	Card: card,
	Heading: heading,
	Paragraph: paragraph,
};

// The type check. WHY one line per config: each is its own Props, and a mismatch then names
// the config that broke.
highlight satisfies ComponentConfig< PropsOf< typeof highlight > >;
degreeFinder satisfies ComponentConfig< PropsOf< typeof degreeFinder > >;
eventList satisfies ComponentConfig< PropsOf< typeof eventList > >;
section satisfies ComponentConfig< PropsOf< typeof section > >;
hero satisfies ComponentConfig< PropsOf< typeof hero > >;
button satisfies ComponentConfig< PropsOf< typeof button > >;
image satisfies ComponentConfig< PropsOf< typeof image > >;
card satisfies ComponentConfig< PropsOf< typeof card > >;
heading satisfies ComponentConfig< PropsOf< typeof heading > >;
paragraph satisfies ComponentConfig< PropsOf< typeof paragraph > >;

// What Puck adds to every render call (PuckComponent in @puckeditor/core).
const puckProps = {
	id: 'Highlight-1234',
	editMode: true,
	puck: {
		isEditing: true,
		metadata: {},
		dragRef: null,
		renderDropZone: () => null,
	},
};

describe.each( Object.entries( CONFIGS ) )(
	'the %s Puck config',
	( _, config ) => {
		it( 'renders the same markup with or without Puck’s own props', () => {
			// UPSTREAM: Puck hands `render` a component for each slot prop, not the stored list.
			const Slot = ( slotProps: object ) => <div { ...slotProps } />;
			const props = Object.fromEntries(
				Object.entries( config.defaultProps ).map(
					( [ key, value ] ) => [
						key,
						( config.fields as Record< string, { type: string } > )[
							key
						]?.type === 'slot'
							? Slot
							: value,
					]
				)
			);
			const plain = renderToStaticMarkup(
				config.render( props as never )
			);
			// WHY published (`isEditing: false`): in the editor a component may show more on
			// purpose (a Card's empty parts show its preset's sample text); what must never
			// differ is Puck's own props reaching the markup.
			const inPuck = renderToStaticMarkup(
				config.render( {
					...props,
					...puckProps,
					puck: { ...puckProps.puck, isEditing: false },
				} as never )
			);

			expect( inPuck ).toBe( plain );
		} );
	}
);

// WHY: the host names the components a new Card starts with (withTemplate's comment).
// The template must reach the slot's default, and must not change the plain config, which
// other hosts use as it is.
describe( 'the Card with a template', () => {
	const template = [
		{ type: 'Image', props: { url: '/photo.jpg', alt: '' } },
		{ type: 'Heading', props: { text: 'Title' } },
	];

	it( 'is the open frame, its slot starting with the template’s components', () => {
		const { defaultProps } = cardWithTemplate( template );
		expect( defaultProps.preset ).toBe( '' );
		expect( defaultProps.blocks ).toEqual( template );
	} );

	it( 'keeps everything else, and leaves the plain config’s slot empty', () => {
		const { defaultProps, ...rest } = cardWithTemplate( template );
		const { defaultProps: plainDefaults, ...plainRest } = card;

		expect( rest ).toEqual( plainRest );
		expect( defaultProps.variant ).toBe( plainDefaults.variant );
		expect( plainDefaults.blocks ).toEqual( [] );
	} );
} );

// WHY: each default template names primitives by the keys the README tells hosts to use. If
// one of those keys stopped matching a primitive here, a host following the README would get
// items Puck can't draw.
const PRIMITIVES: Record< string, { defaultProps: object } > = {
	Button: button,
	Image: image,
	Heading: heading,
	Paragraph: paragraph,
};

// A component's name, how Puck builds it with its template, and the primitives expected.
type TemplateCase = [ string, () => unknown, string[] ];

describe.each< TemplateCase >( [
	[
		'Card',
		cardWithTemplate,
		[ 'Image', 'Paragraph', 'Heading', 'Paragraph' ],
	],
	[
		'Highlight',
		highlightWithTemplate,
		[ 'Paragraph', 'Paragraph', 'Paragraph' ],
	],
	[ 'Section', sectionWithTemplate, [ 'Heading', 'Paragraph' ] ],
	[
		'Hero',
		heroWithTemplate,
		[ 'Paragraph', 'Heading', 'Paragraph', 'Button', 'Button' ],
	],
] )( 'the %s’s default template', ( _, withTemplate, types ) => {
	const content =
		(
			withTemplate as () => {
				defaultProps: Record<
					string,
					{ type: string; props: object }[]
				>;
			}
		 )().defaultProps.blocks ?? [];

	it( 'starts with the primitives WordPress’s template has, in order', () => {
		expect( content.map( ( item ) => item.type ) ).toEqual( types );
	} );

	// WHY: Puck has no placeholders, so a template's text is published if an editor misses it.
	// A part's name ("Title") is plainly unfinished; sample copy and its facts are not.
	it( 'holds each part’s name only: no sample copy, address or image', () => {
		for ( const item of content ) {
			const props = item.props as Record< string, string >;
			expect( [
				item.type,
				props.content ?? props.text ?? '',
				props.url ?? '',
			] ).toEqual( [
				item.type,
				expect.stringMatching( /^([A-Z][a-z]*( [a-z]+)*)?$/ ),
				'',
			] );
		}
	} );

	it( 'sets every prop of each primitive, and only props it has', () => {
		for ( const item of content ) {
			// WHY every prop: Puck doesn't merge a template item with the component's defaults.
			expect( Object.keys( item.props ).sort() ).toEqual(
				Object.keys(
					PRIMITIVES[ item.type ]?.defaultProps ?? {}
				).sort()
			);
		}
	} );
} );

// WHY: in Puck the Card stores its design and its content as data (integrations/puck/presets.ts),
// and renders through the Card a React site uses.
describe( 'the Card’s presets in Puck', () => {
	const editing = ( isEditing: boolean ) => ( {
		...puckProps,
		puck: { ...puckProps.puck, isEditing },
	} );

	it.each( CARD_PRESETS.map( ( preset ) => [ preset.name, preset ] ) )(
		'starts on the %s preset: its name, its props, no content yet',
		( name, preset ) => {
			const { defaultProps } = cardWithPreset( name );
			expect( defaultProps.preset ).toBe( name );
			expect( defaultProps ).toMatchObject( preset.props );
			expect( defaultProps.content ).toEqual( {} );
			expect( defaultProps.blocks ).toEqual( [] );
		}
	);

	it( 'starts a plain Card on the default preset', () => {
		expect( card.defaultProps.preset ).toBe( DEFAULT_CARD_PRESET.name );
	} );

	// WHY: an empty part must not publish the preset's sample copy, but the editor needs to
	// see what goes where.
	it( 'shows an empty part’s sample text in the editor only', () => {
		const sample = 'One or two sentences that help someone decide';
		const render = ( isEditing: boolean ) =>
			renderToStaticMarkup(
				card.render( {
					...card.defaultProps,
					blocks: () => null,
					...editing( isEditing ),
				} as never )
			);
		expect( render( true ) ).toContain( sample );
		expect( render( false ) ).not.toContain( sample );
	} );

	it( 'fills a part from its content field', () => {
		const html = renderToStaticMarkup(
			card.render( {
				...card.defaultProps,
				content: { title: 'From the field' },
				blocks: () => null,
				...editing( false ),
			} as never )
		);
		expect( html ).toContain( 'From the field' );
	} );

	it( 'applies a preset’s props when the editor picks it, and keeps the content', () => {
		const pathway = CARD_PRESETS.find(
			( preset ) => preset.name === 'pathway'
		);
		const { props } = card.resolveData?.(
			{
				props: {
					...card.defaultProps,
					preset: 'pathway',
					content: { title: 'Kept' },
				},
			},
			{ changed: { preset: true } }
		) ?? { props: {} };
		expect( props ).toMatchObject( pathway?.props ?? {} );
		expect( props.content ).toEqual( { title: 'Kept' } );
	} );

	it( 'shows only the preset’s parts, or for the open frame its slot', () => {
		const fieldsFor = ( preset: string ) =>
			card.resolveFields?.(
				{ props: { ...card.defaultProps, preset } },
				{ fields: {} }
			) as Record< string, { objectFields?: object } >;
		const pathway = CARD_PRESETS.find(
			( preset ) => preset.name === 'pathway'
		);
		expect(
			Object.keys( fieldsFor( 'pathway' ).content?.objectFields ?? {} )
		).toEqual( pathway?.parts.map( ( { part } ) => part ) );
		expect( fieldsFor( 'pathway' ).blocks ).toBeUndefined();
		expect( fieldsFor( '' ).content ).toBeUndefined();
		expect( fieldsFor( '' ).blocks ).toBeDefined();
	} );
} );

// WHY: the Highlight's designs are data in Puck too, as the Card's are (above).
describe( 'the Highlight’s presets in Puck', () => {
	it.each( HIGHLIGHT_PRESETS.map( ( preset ) => [ preset.name, preset ] ) )(
		'starts on the %s preset: its name, its props, no content yet',
		( name, preset ) => {
			const { defaultProps } = highlightWithPreset( name );
			expect( defaultProps.preset ).toBe( name );
			expect( defaultProps ).toMatchObject( preset.props );
			expect( defaultProps.content ).toEqual( {} );
		}
	);

	it( 'shows only the preset’s parts', () => {
		const [ first ] = HIGHLIGHT_PRESETS;
		const fields = highlight.resolveFields?.(
			{ props: { ...highlight.defaultProps, preset: first.name } },
			{ fields: {} }
		) as Record< string, { objectFields?: object } >;
		expect( Object.keys( fields.content?.objectFields ?? {} ) ).toEqual( [
			...new Set( first.parts.map( ( { part } ) => part ) ),
		] );
	} );
} );

// FIX: a preset's sample background was in its default props, and Puck saves those into the page.
describe( 'a preset with a background in Puck', () => {
	const render = ( isEditing: boolean ) =>
		renderToStaticMarkup(
			card.render( {
				...cardWithPreset( 'audience' ).defaultProps,
				blocks: () => null,
				...puckProps,
				puck: { ...puckProps.puck, isEditing },
			} as never )
		);

	it( 'saves no sample image', () => {
		expect(
			CARD_PRESETS.find( ( preset ) => preset.name === 'audience' )
				?.background
		).toBe( true );
		expect( cardWithPreset( 'audience' ).defaultProps.imageSrc ).toBe( '' );
	} );

	it( 'shows the sample in the editor only', () => {
		expect( render( true ) ).toContain( imageExample.url );
		expect( render( false ) ).not.toContain( imageExample.url );
	} );
} );
