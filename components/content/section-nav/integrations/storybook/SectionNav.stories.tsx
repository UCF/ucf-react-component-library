/**
 * The Section Nav on a page: full width between Sections, sticking as the page scrolls, its
 * behavior (behavior.ts) on as WordPress's viewScript turns it on.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { argTypesOf } from '@/integrations/storybook/arg-types';
import type { Link } from '@/integrations/schema/props';
import Section from '@/components/content/section/Section';
import Heading from '@/components/primitives/heading/Heading';
import Paragraph from '@/components/primitives/paragraph/Paragraph';
import '@/components/primitives/heading/style.css';
import '@/components/primitives/paragraph/style.css';
import { enhanceSectionNav } from '../../behavior.ts';
import SectionNav from '../../SectionNav.tsx';
import { PROPS } from '../../SectionNav.props.ts';
import '../../style.css';

// SPEC: the sections of a UCF program page.
const LINKS: Link[] = [
	{ label: 'Overview', href: '#overview' },
	{ label: 'Admissions', href: '#admissions' },
	{ label: 'Tuition and Aid', href: '#tuition' },
	{ label: 'Careers', href: '#careers' },
	{ label: 'Request Info', href: '#request-info' },
];

type PageProps = {
	links: Link[];
	composition: string;
	script: boolean;
};

/**
 * A page: an opening Section, the Section Nav, then a Section for each link.
 * WHY the Sections in the story, not around it: the bar spans the page between Sections, as it
 * is placed in WordPress; inside a Section it would sit in its padded column.
 *
 * @param props             What the page holds.
 * @param props.links       The Section Nav's links; each `#anchor` gets a Section.
 * @param props.composition The Sections' composition, from the toolbar.
 * @param props.script      Whether behavior.ts runs, as WordPress's viewScript does.
 */
function Page( { links, composition, script }: PageProps ) {
	const page = useRef< HTMLDivElement >( null );
	useEffect( () => {
		const nav =
			page.current?.querySelector< HTMLElement >( '.ucf-c-section-nav' );
		return script && nav ? enhanceSectionNav( nav ) : undefined;
	}, [ script, links ] );
	const sectionOf = composition as 'light';
	// WHY a wrapper as tall as the page: the bar sticks while its parent is on screen.
	return (
		<div ref={ page }>
			<Section composition={ sectionOf }>
				<Heading level={ 1 } content="Nursing, BSN" />
				<Paragraph content="Jump to a section of this page from the gold bar below." />
			</Section>
			<SectionNav links={ links } />
			{ links
				.filter( ( link ) => link.href.startsWith( '#' ) )
				.map( ( link ) => (
					<Section
						key={ link.href }
						id={ link.href.slice( 1 ) }
						composition={ sectionOf }
						style={ { minHeight: '80vh' } }
					>
						<Heading content={ link.label } />
						<Paragraph content="A section of the page, tall enough to scroll past." />
					</Section>
				) ) }
		</div>
	);
}

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Content (Server)/Section Nav',
	tags: [ 'server' ],
	component: SectionNav,
	// WHY its own Sections: see Page.
	parameters: { section: false },
	// WHY links, not the defaults: a new one starts empty, and WordPress fills it from the page.
	args: { links: LINKS },
	argTypes: argTypesOf( PROPS ),
	render: ( args, { globals } ) => (
		<Page
			links={ [ ...( args.links ?? [] ) ] }
			composition={ String( globals.composition ?? 'light' ) }
			script
		/>
	),
} satisfies Meta< typeof SectionNav >;

export default meta;

type Story = StoryObj< typeof meta >;

/**
 * A program page. Below 992px the links are behind "Skip to Section"; the link to the section
 * in view is underlined.
 */
export const Default: Story = {
	play: async ( { canvasElement } ) => {
		const nav = canvasElement.querySelector( '.ucf-c-section-nav' );
		const toggle = canvasElement.querySelector< HTMLButtonElement >(
			'.ucf-c-section-nav__toggle'
		);
		const list = canvasElement.querySelector( '.ucf-c-section-nav__list' );
		await expect( toggle ).not.toBeNull();
		const narrow = window.innerWidth < 992;
		await expect( toggle?.checkVisibility() ).toBe( narrow );
		await expect( list?.checkVisibility() ).toBe( ! narrow );

		if ( narrow && toggle ) {
			await userEvent.click( toggle );
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
			await expect( list?.checkVisibility() ).toBe( true );
			await userEvent.keyboard( '{Escape}' );
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
			await expect( toggle ).toHaveFocus();
		}

		// The section in view is marked once the page scrolls to it.
		canvasElement.ownerDocument
			.getElementById( 'careers' )
			?.scrollIntoView( { behavior: 'instant' } );
		await waitFor( () =>
			expect(
				nav?.querySelector( '[aria-current="location"]' )
			).toHaveTextContent( 'Careers' )
		);
	},
};

/** More links than fit across: on wide screens the row scrolls sideways. */
export const ManyLinks: Story = {
	args: {
		links: [
			...LINKS,
			{ label: 'Faculty', href: '#faculty' },
			{ label: 'Research', href: '#research' },
			{ label: 'Student Organizations', href: '#organizations' },
			{ label: 'Frequently Asked Questions', href: '#faq' },
		],
	},
};

/** Without its script: every link in one row that scrolls across, at every width. */
export const WithoutScript: Story = {
	render: ( args, { globals } ) => (
		<Page
			links={ [ ...( args.links ?? [] ) ] }
			composition={ String( globals.composition ?? 'light' ) }
			script={ false }
		/>
	),
};

/** No links yet: the bar, blank, at its full height, so an editor can see and select it. */
export const Empty: Story = {
	args: { links: [] },
	play: async ( { canvasElement } ) => {
		const nav =
			canvasElement.querySelector< HTMLElement >( '.ucf-c-section-nav' );
		await expect( nav?.checkVisibility() ).toBe( true );
		// SYNC: the bar's height in style.css, 3.9rem and its two 1px borders.
		await expect( nav?.getBoundingClientRect().height ).toBeCloseTo(
			3.9 * 16 + 2,
			0
		);
		// No menu button: it would open nothing.
		await expect(
			canvasElement.querySelector( '.ucf-c-section-nav__toggle' )
		).toBeNull();
	},
};
