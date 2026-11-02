/**
 * CONTEXT: checks every Puck config against the real Puck, which the library itself never
 * imports (components/_config/puck.ts).
 *
 *   - Types: each config must be assignable to Puck's own `ComponentConfig`. This is checked by
 *     `npm run typecheck`, not by the test run: a config that no longer fits Puck's shape is a
 *     type error here.
 *   - Render: Puck calls `render` with its own props (`id`, `puck`, `editMode`) beside the
 *     component's. None of them may reach the markup.
 *
 * SYNC: add each new `adapters/puck/config.tsx` to CONFIGS.
 * UPSTREAM: `@puckeditor/core` is a dev dependency only, for this file.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import button from '../../primitives/button/adapters/puck/config.tsx';
import heading from '../../primitives/heading/adapters/puck/config.tsx';
import image from '../../primitives/image/adapters/puck/config.tsx';
import paragraph from '../../primitives/paragraph/adapters/puck/config.tsx';
import card, {
	withTemplate as cardWithTemplate,
	withVariation as cardWithVariation,
} from '../card/adapters/puck/config.tsx';
import { VARIATIONS as CARD_VARIATIONS } from '../card/variations.ts';
import degreeFinder from '../degree-finder/adapters/puck/config.tsx';
import hero, {
	withTemplate as heroWithTemplate,
} from '../hero/adapters/puck/config.tsx';
import section, {
	withTemplate as sectionWithTemplate,
} from '../section/adapters/puck/config.tsx';
import stat, {
	withTemplate as statWithTemplate,
} from '../stat/adapters/puck/config.tsx';
import type { PuckComponentConfig } from './puck.ts';

type PropsOf< Config > =
	Config extends PuckComponentConfig< infer Props > ? Props : never;

const CONFIGS = {
	Stat: stat,
	'Degree Finder': degreeFinder,
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
stat satisfies ComponentConfig< PropsOf< typeof stat > >;
degreeFinder satisfies ComponentConfig< PropsOf< typeof degreeFinder > >;
section satisfies ComponentConfig< PropsOf< typeof section > >;
hero satisfies ComponentConfig< PropsOf< typeof hero > >;
button satisfies ComponentConfig< PropsOf< typeof button > >;
image satisfies ComponentConfig< PropsOf< typeof image > >;
card satisfies ComponentConfig< PropsOf< typeof card > >;
heading satisfies ComponentConfig< PropsOf< typeof heading > >;
paragraph satisfies ComponentConfig< PropsOf< typeof paragraph > >;

// What Puck adds to every render call (PuckComponent in @puckeditor/core).
const puckProps = {
	id: 'Stat-1234',
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
			const inPuck = renderToStaticMarkup(
				config.render( { ...props, ...puckProps } as never )
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

	it( 'starts its slot with the template’s components, in order', () => {
		expect( cardWithTemplate( template ).defaultProps.content ).toEqual(
			template
		);
	} );

	it( 'keeps everything else, and leaves the plain config empty', () => {
		const { defaultProps, ...rest } = cardWithTemplate( template );
		const { defaultProps: plainDefaults, ...plainRest } = card;

		expect( rest ).toEqual( plainRest );
		expect( defaultProps.variant ).toBe( plainDefaults.variant );
		expect( plainDefaults.content ).toEqual( [] );
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
	// Each card design (card/variations.ts), as Puck builds it.
	...CARD_VARIATIONS.map(
		( variation ) =>
			[
				`Card's ${ variation.name } design`,
				() => cardWithVariation( variation.name ),
				variation.content.map(
					( part ) =>
						( {
							image: 'Image',
							heading: 'Heading',
							text: 'Paragraph',
							link: 'Button',
							button: 'Button',
						} )[ part.kind ]
				),
			] as TemplateCase
	),
	[ 'Section', sectionWithTemplate, [ 'Heading', 'Paragraph' ] ],
	[ 'Stat', statWithTemplate, [ 'Paragraph', 'Paragraph', 'Paragraph' ] ],
	[
		'Hero',
		heroWithTemplate,
		[ 'Paragraph', 'Heading', 'Paragraph', 'Button', 'Button' ],
	],
] )( 'the %s’s default template', ( _, withTemplate, types ) => {
	const content = (
		withTemplate as () => {
			defaultProps: { content: { type: string; props: object }[] };
		}
	 )().defaultProps.content;

	it( 'starts with the primitives WordPress’s template has, in order', () => {
		expect( content.map( ( item ) => item.type ) ).toEqual( types );
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
