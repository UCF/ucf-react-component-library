/**
 * CONTEXT: what the Card's stories share: the base every story file spreads into its meta,
 * and a preset (Card.presets.ts) as a story, its parts drawn by integrations/storybook/parts.tsx.
 *
 * WHY three story files: Card.stories.tsx shows the props, Card.presets.stories.tsx the
 * presets, Card.checks.stories.tsx the measured checks. They sit under one "Card" group.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import { PLACEHOLDER_IMAGE } from '../../../../../.storybook/placeholder.ts';
import { argTypesOf } from '#integrations/storybook/arg-types.js';
import { defaultsIn } from '#integrations/schema/props.js';
import Card from '../../Card.tsx';
import { presetNamed } from '../../Card.presets.ts';
import { resolveParts } from '#integrations/schema/parts.js';
import { renderParts } from '#integrations/storybook/parts.js';
import { PARTS } from '../../Card.parts.ts';
import { PROPS } from '../../Card.props.ts';
import '../../style.css';

export type Story = StoryObj< typeof Card >;

/** What every Card story file's meta starts with; each adds its own `title`. */
export const base = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	tags: [ 'server' ],
	component: Card,
	// WHY the defaults: what a new Card starts with in WordPress and Puck.
	args: defaultsIn( PROPS, 'puck' ),
	argTypes: argTypesOf( PROPS ),
	// WHY a width: a card sits in a grid column. A story that needs more sets `cardWidth`.
	decorators: [
		( StoryComponent, { parameters } ) => (
			<div style={ { maxWidth: parameters.cardWidth ?? '22rem' } }>
				<StoryComponent />
			</div>
		),
	],
} satisfies Omit< Meta< typeof Card >, 'title' >;

/**
 * A preset as a story: its props over the defaults, as in WordPress and Puck, its parts, and
 * the sample image when it has a background.
 *
 * @param name A preset's name in Card.presets.ts.
 */
export function preset( name: string ): Story {
	const { props, background, parts } = presetNamed( name );
	return {
		args: {
			...defaultsIn( PROPS, 'puck' ),
			...props,
			imageSrc: background ? PLACEHOLDER_IMAGE : '',
		},
		render: ( args ) => (
			<Card { ...args }>
				{ renderParts( resolveParts( PARTS, parts ) ) }
			</Card>
		),
	};
}

/**
 * Several cards side by side, as the UCF pages set them.
 *
 * @param props          The cards.
 * @param props.children The cards.
 * @param props.min      The narrowest a card gets before the row wraps, in rem.
 */
export function Row( {
	children,
	min = 16,
}: {
	children: ReactNode;
	min?: number;
} ) {
	return (
		<div
			style={ {
				display: 'grid',
				gap: '1.5rem',
				gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${ min }rem), 1fr))`,
			} }
		>
			{ children }
		</div>
	);
}

/**
 * The same preset several times in a row.
 *
 * @param name    A preset's name in Card.presets.ts.
 * @param columns How many cards, and so how many to a row on a wide screen.
 */
export function grid( name: string, columns: number ): Story {
	const single = preset( name );
	return {
		...single,
		render: ( args, context ) => (
			<Row min={ columns > 3 ? 12 : 16 }>
				{ Array.from( { length: columns }, ( _, index ) => (
					<div key={ index }>
						{ single.render?.( args, context ) }
					</div>
				) ) }
			</Row>
		),
		parameters: { cardWidth: 'none' },
	};
}
