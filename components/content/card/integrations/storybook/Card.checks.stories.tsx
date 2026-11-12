/**
 * What the Card's stories measure that axe can't. Each story here fails in `npm run
 * test:stories` when its check does.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import Heading from '@/components/primitives/heading/Heading';
import Paragraph from '@/components/primitives/paragraph/Paragraph';
import { contrast, over } from '@/integrations/storybook/contrast';
import { PLACEHOLDER_IMAGE } from '../../../../../.storybook/placeholder.ts';
import Card from '../../Card.tsx';
import { PARTS } from '../../Card.parts.ts';
import { base, Row } from './shared.tsx';

const meta = {
	...base,
	title: 'Content (Server)/Card/Checks',
} satisfies Meta< typeof Card >;

export default meta;

type Story = StoryObj< typeof meta >;

/**
 * A caption over a photo, at each position, on whatever section the story sits on.
 *
 * A11Y: axe can't measure text over an image, so this does. Whatever the photo, the text must
 * clear 4.5:1 (WCAG 1.4.3): each line of text, over the ground the card gives it, laid over
 * pure black and over pure white, the two photos furthest apart. FIX: a black gradient, clear
 * at the top, left text placed at the top on bare photo, and dark text from a light section on
 * black.
 */
export const CaptionOverPhoto: Story = {
	args: {
		imageSrc: PLACEHOLDER_IMAGE,
		overlay: 'gradient',
		aspectRatio: '4/3',
	},
	parameters: { cardWidth: 'none' },
	render: ( args ) => (
		<Row>
			{ ( [ 'top', 'center', 'bottom' ] as const ).map( ( position ) => (
				<Card key={ position } { ...args } contentPosition={ position }>
					<Paragraph
						content="Engineering"
						className={ PARTS.eyebrow.className }
					/>
					<Heading
						content="A caption long enough to wrap onto a third line on a narrow tile"
						level={ 3 }
						className={ PARTS.title.className }
					/>
					<Paragraph
						content="A materials pour. You do it, nobody demonstrates it at you."
						className={ PARTS.description.className }
					/>
				</Card>
			) ) }
		</Row>
	),
	play: async ( { canvasElement } ) => {
		const failures: string[] = [];
		for ( const content of canvasElement.querySelectorAll< HTMLElement >(
			'.ucf-c-card__content'
		) ) {
			const ground = getComputedStyle( content ).backgroundColor;
			for ( const text of content.querySelectorAll< HTMLElement >(
				'*'
			) ) {
				const own = [ ...text.childNodes ].some(
					( node ) =>
						node.nodeType === Node.TEXT_NODE &&
						node.textContent?.trim()
				);
				if ( ! own ) {
					continue;
				}
				const color = getComputedStyle( text ).color;
				for ( const photo of [ 'black', 'white' ] ) {
					const behind = over( ground, photo );
					const ratio = contrast( over( color, photo ), behind );
					if ( ratio < 4.5 ) {
						failures.push(
							`${ text.className } at ${
								content
									.closest( '[data-position]' )
									?.getAttribute( 'data-position' ) ?? 'top'
							} over a ${ photo } photo: ${ ratio.toFixed( 2 ) }:1`
						);
					}
				}
			}
		}
		await expect( failures ).toEqual( [] );
	},
};
