/** CONTEXT: the Section Nav on a page of Sections, with behavior.ts running. */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { argTypesOf } from '@/core/hosts/storybook/props-to-controls';
import { COMPOSITIONS, type Composition } from '@/core/design/compositions';
import type { Link } from '@/core/hosts/prop-definitions';
import Section from '@/components/content/section/Section';
import Heading from '@/components/primitives/heading/Heading';
import Paragraph from '@/components/primitives/paragraph/Paragraph';
import '@/components/primitives/heading/style.css';
import '@/components/primitives/paragraph/style.css';
import { enhanceSectionNav } from '../../behavior.ts';
import SectionNav from '../../SectionNav.tsx';
import { PROPS } from '../../props.ts';
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
	linkLayout?: 'left' | 'spread';
	composition: string;
	script: boolean;
};

// Each link's Section takes the next composition, so the bar is seen over every one.
const sectionOf = ( index: number ): Composition =>
	COMPOSITIONS[ index % COMPOSITIONS.length ]?.value ?? 'light';

/**
 * A page: an opening Section, the Section Nav, then a Section per link.
 * WHY build the Sections here: the bar sits between Sections, not inside one.
 *
 * @param props             Props.
 * @param props.links       The links; each `#anchor` gets a Section.
 * @param props.linkLayout  Left or spread.
 * @param props.composition The opening Section's, from the toolbar.
 * @param props.script      Whether behavior.ts runs.
 */
function Page( { links, linkLayout, composition, script }: PageProps ) {
	const page = useRef< HTMLDivElement >( null );
	useEffect( () => {
		const nav =
			page.current?.querySelector< HTMLElement >( '.ucf-c-section-nav' );
		return script && nav ? enhanceSectionNav( nav ) : undefined;
	}, [ script, links ] );
	// WHY one wrapper: the bar only sticks within its parent.
	return (
		<div ref={ page }>
			{ /* WHY the toolbar's: each test run must render in its own composition
			     (.storybook/vitest.setup.ts). */ }
			<Section composition={ composition as Composition }>
				<Heading level={ 1 } content="Nursing, BSN" />
				<Paragraph content="Jump to a section of this page from the gold bar below." />
			</Section>
			<SectionNav links={ links } linkLayout={ linkLayout } />
			{ links
				.filter( ( link ) => link.href.startsWith( '#' ) )
				.map( ( link, index ) => (
					<Section
						key={ link.href }
						id={ link.href.slice( 1 ) }
						composition={ sectionOf( index ) }
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
	// WHY links: the default is empty.
	args: { links: LINKS },
	argTypes: argTypesOf( PROPS ),
	render: ( args, { globals } ) => (
		<Page
			links={ [ ...( args.links ?? [] ) ] }
			linkLayout={ args.linkLayout }
			composition={ String( globals.composition ?? 'light' ) }
			script
		/>
	),
} satisfies Meta< typeof SectionNav >;

export default meta;

type Story = StoryObj< typeof meta >;

/** A program page. Below 992px the links are behind "Skip to Section". */
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

		if ( narrow && toggle && list ) {
			// Even space: right of the bars equals left of the text.
			const button = toggle.getBoundingClientRect();
			const text = toggle
				.querySelector( '.ucf-c-section-nav__toggle-text' )
				?.getBoundingClientRect();
			const iconElement = toggle.querySelector(
				'.ucf-c-section-nav__toggle-icon'
			);
			const icon = iconElement?.getBoundingClientRect();
			// The drawn bars' right edge (glyph is 448×512, centered).
			const [ , drawn = 0 ] = getComputedStyle( iconElement as Element )
				.maskSize.split( ' ' )
				.map( parseFloat );
			const barsRight =
				( icon?.left ?? 0 ) +
				( ( icon?.width ?? 0 ) + ( drawn * 448 ) / 512 ) / 2;
			await expect(
				button.right - barsRight - ( ( text?.left ?? 0 ) - button.left )
			).toBeCloseTo( 0, 0 );

			// Opening must not move the page under the bar.
			const under = nav?.nextElementSibling;
			const underTop = under?.getBoundingClientRect().top;
			await userEvent.click( toggle );
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
			await expect( list.checkVisibility() ).toBe( true );
			// It slides open.
			const [ opening ] = list.getAnimations();
			await expect( opening ).toBeDefined();
			// From 0 (just its 2px of borders), with no jump.
			opening?.pause();
			if ( opening ) {
				opening.currentTime = 0;
			}
			await expect(
				list.getBoundingClientRect().height
			).toBeLessThanOrEqual( 2 );
			opening?.play();
			await opening?.finished;
			await expect( list.clientHeight ).toBe( list.scrollHeight );
			await expect( under?.getBoundingClientRect().top ).toBe( underTop );
			// A full-width line above the links, in the active link's tint.
			const line = getComputedStyle( list );
			const current = list.querySelector( '[aria-current]' );
			await expect( current ).not.toBeNull();
			await expect( line.borderTopWidth ).toBe( '1px' );
			await expect( line.borderTopColor ).toBe(
				getComputedStyle( current as Element ).backgroundColor
			);
			await expect( list.getBoundingClientRect().width ).toBe(
				nav?.clientWidth
			);

			await userEvent.keyboard( '{Escape}' );
			await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
			await expect( toggle ).toHaveFocus();
			// It slides shut, links visible until done.
			const [ closing ] = list.getAnimations();
			await expect( closing ).toBeDefined();
			await expect( list.checkVisibility() ).toBe( true );
			// The button un-blacks immediately, not after the slide.
			await expect( getComputedStyle( toggle ).backgroundColor ).toBe(
				'rgba(0, 0, 0, 0)'
			);
			await closing?.finished;
			await waitFor( () =>
				expect( list.checkVisibility() ).toBe( false )
			);
		}

		// Scrolling to a section marks its link.
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

/** Links spread across the bar, as on the ucf.edu home page. */
export const Spread: Story = {
	args: { linkLayout: 'spread' },
	play: async ( { canvasElement } ) => {
		if ( window.innerWidth < 992 ) {
			return;
		}
		const list = canvasElement.querySelector< HTMLElement >(
			'.ucf-c-section-nav__list'
		);
		const items = [
			...( list?.querySelectorAll( '.ucf-c-section-nav__item' ) ?? [] ),
		];
		const end = list
			? list.getBoundingClientRect().right -
				parseFloat( getComputedStyle( list ).paddingRight )
			: 0;
		await expect(
			items.at( -1 )?.getBoundingClientRect().right
		).toBeCloseTo( end, 0 );
	},
};

/** More links than fit: labels wrap and the bar grows taller, as on ucf.edu/robotics/. */
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
	play: async ( { canvasElement } ) => {
		if ( window.innerWidth < 992 ) {
			return;
		}
		const nav =
			canvasElement.querySelector< HTMLElement >( '.ucf-c-section-nav' );
		const list = nav?.querySelector( '.ucf-c-section-nav__list' );
		// Nothing scrolled out of sight.
		await expect( list?.scrollWidth ).toBe( list?.clientWidth );
		// Every link fills the bar's height, so its tint reaches top to bottom.
		const rowHeight = list?.getBoundingClientRect().height ?? 0;
		for ( const link of list?.querySelectorAll(
			'.ucf-c-section-nav__link'
		) ?? [] ) {
			await expect( link.getBoundingClientRect().height ).toBeCloseTo(
				rowHeight,
				1
			);
		}

		// The taller bar still marks the right section.
		canvasElement.ownerDocument
			.getElementById( 'research' )
			?.scrollIntoView( { behavior: 'instant' } );
		await waitFor( () =>
			expect(
				nav?.querySelector( '[aria-current="location"]' )
			).toHaveTextContent( 'Research' )
		);
	},
};

/** Without the script: links stay in the bar at every width, scrolling across on a phone. */
export const WithoutScript: Story = {
	render: ( args, { globals } ) => (
		<Page
			links={ [ ...( args.links ?? [] ) ] }
			composition={ String( globals.composition ?? 'light' ) }
			script={ false }
		/>
	),
};

/** No links: a blank bar at full height, so editors can select it. */
export const Empty: Story = {
	args: { links: [] },
	play: async ( { canvasElement } ) => {
		const nav =
			canvasElement.querySelector< HTMLElement >( '.ucf-c-section-nav' );
		await expect( nav?.checkVisibility() ).toBe( true );
		// SYNC: the bar's height in style.css.
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
