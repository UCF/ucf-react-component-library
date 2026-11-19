/** CONTEXT: the Accordion, with behavior.ts running, and without it. */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { expect, userEvent } from 'storybook/test';

import AccordionItem from '@/components/primitives/accordion-item/AccordionItem';
import '@/components/primitives/accordion-item/style.css';
import Paragraph from '@/components/primitives/paragraph/Paragraph';
import '@/components/primitives/paragraph/style.css';
import { enhanceAccordion } from '../../behavior.ts';
import Accordion from '../../Accordion.tsx';
import '../../style.css';

// SPEC: the theme's FAQ pattern (patterns/faq.php there).
const FAQ = [
	{
		title: 'Can I change my major after I am admitted?',
		answer: 'Usually yes, through a change-of-major process. Some majors have course requirements that decide whether a change adds a semester.',
	},
	{
		title: 'Do I have to send test scores?',
		answer: 'Check the current requirement on the admission requirements page. That page is the authoritative source, so this answer links to it rather than repeating it.',
	},
	{
		title: 'How much of my associate degree transfers?',
		answer: 'A Florida A.A. transfers as a block toward general education. Course-by-course equivalencies for your major are in the transfer catalog.',
	},
];

/**
 * The FAQ as an Accordion.
 *
 * @param props        Props.
 * @param props.script Whether behavior.ts runs.
 */
function Example( { script }: { script: boolean } ) {
	const ref = useRef< HTMLDivElement >( null );
	useEffect( () => {
		const accordion =
			ref.current?.querySelector< HTMLElement >( '.ucf-c-accordion' );
		return script && accordion ? enhanceAccordion( accordion ) : undefined;
	}, [ script ] );
	return (
		<div ref={ ref }>
			<Accordion>
				{ FAQ.map( ( { title, answer } ) => (
					<AccordionItem key={ title } title={ title }>
						<Paragraph content={ answer } />
					</AccordionItem>
				) ) }
			</Accordion>
		</div>
	);
}

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Accordion',
	tags: [ 'server' ],
	component: Example,
	args: { script: true },
	argTypes: { script: { control: 'boolean' } },
} satisfies Meta< typeof Example >;

export default meta;

type Story = StoryObj< typeof meta >;

/** Closed, opening from a question: the theme's 60px rows, hairlines and marker. */
export const Default: Story = {
	play: async ( { canvasElement } ) => {
		const toggles = [
			...canvasElement.querySelectorAll< HTMLButtonElement >(
				'.ucf-c-accordion-item__toggle'
			),
		];
		const [ toggle ] = toggles;
		const panel = canvasElement.querySelector< HTMLElement >(
			'.ucf-c-accordion-item__panel'
		);
		const icon = canvasElement.querySelector< HTMLElement >(
			'.ucf-c-accordion-item__icon'
		);
		// WHY the answer, not the panel: `until-found` hides what is inside the panel's box.
		const answer = () => panel?.firstElementChild?.checkVisibility();
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
		await expect( answer() ).toBe( false );
		// SPEC: a row at least 60px, and a 32px square marker (28px and its border).
		for ( const each of toggles ) {
			await expect(
				each.getBoundingClientRect().height
			).toBeGreaterThanOrEqual( 60 );
		}
		await expect( icon?.getBoundingClientRect().width ).toBe( 32 );
		// A closed answer takes no space.
		await expect( panel?.getBoundingClientRect().height ).toBe( 0 );
		const plus = icon ? getComputedStyle( icon ).backgroundImage : '';

		await userEvent.click( toggle! );
		await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
		await expect( answer() ).toBe( true );
		// Plus becomes minus: one bar, not two.
		const minus = icon ? getComputedStyle( icon ).backgroundImage : '';
		await expect( plus.split( 'linear-gradient' ).length ).toBe( 3 );
		await expect( minus.split( 'linear-gradient' ).length ).toBe( 2 );

		await userEvent.click( toggle! );
		await expect( answer() ).toBe( false );
	},
};

/** Without the script: every answer shows, as on a page with JavaScript off. */
export const WithoutScript: Story = {
	args: { script: false },
	play: async ( { canvasElement } ) => {
		for ( const panel of canvasElement.querySelectorAll< HTMLElement >(
			'.ucf-c-accordion-item__panel'
		) ) {
			await expect( panel.checkVisibility() ).toBe( true );
		}
	},
};
