/**
 * The Columns: each distribution, and a check of the 12-column layout at every story width.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import Column from '@/components/primitives/column/Column';
import '@/components/primitives/column/style.css';
import { defaultsIn } from '@/integrations/schema/props';
import { argTypesOf } from '@/integrations/storybook/arg-types';
import Columns, { type ColumnsProps } from '../../Columns.tsx';
import { PROPS } from '../../Columns.props.ts';
import '../../style.css';

const defaults = defaultsIn( PROPS, 'puck' );

// How many columns each distribution names.
const COUNT: Record< string, number > = {
	'1:1': 2,
	'2:1': 2,
	'1:2': 2,
	'1:1:1': 3,
	'1:1:1:1': 4,
};

/**
 * Columns with numbered columns, as many as the distribution names.
 *
 * @param props The Columns's props.
 */
const Example = ( props: ColumnsProps ) => (
	<Columns { ...props }>
		{ Array.from(
			{ length: COUNT[ props.distribution ?? '1:1' ] ?? 2 },
			( _, index ) => (
				<Column key={ index }>
					<h3>Column { index + 1 }</h3>
					<p>
						Body copy in a column, long enough to wrap onto a second
						line at most widths.
					</p>
				</Column>
			)
		) }
	</Columns>
);

const meta = {
	// SYNC: the group names and tags are explained in .storybook/preview.ts.
	title: 'Primitives/Columns',
	tags: [ 'server' ],
	component: Columns,
	argTypes: argTypesOf( PROPS ),
	args: defaults,
	render: ( args ) => <Example { ...args } />,
} satisfies Meta< typeof Columns >;

export default meta;

type Story = StoryObj< typeof meta >;

export const Default: Story = {};

export const LeftWider: Story = { args: { distribution: '2:1' } };

export const RightWider: Story = { args: { distribution: '1:2' } };

export const Three: Story = { args: { distribution: '1:1:1' } };

export const Four: Story = { args: { distribution: '1:1:1:1' } };

/**
 * Every distribution, measured: below 36rem of Columns one column; from 36rem two (three and four
 * two to a row); from 48rem all, on the 12-column grid (style.css says why).
 */
export const Layout: Story = {
	render: () => (
		<div style={ { display: 'grid', gap: '3rem' } }>
			{ Object.keys( COUNT ).map( ( distribution ) => (
				<div key={ distribution } data-check={ distribution }>
					<Example
						distribution={
							distribution as ColumnsProps[ 'distribution' ]
						}
					/>
				</div>
			) ) }
		</div>
	),
	play: async ( { canvasElement } ) => {
		const rem = parseFloat(
			getComputedStyle( document.documentElement ).fontSize
		);
		const failures: string[] = [];
		for ( const check of canvasElement.querySelectorAll< HTMLElement >(
			'[data-check]'
		) ) {
			const name = check.dataset.check ?? '';
			const grid = check.querySelector< HTMLElement >(
				'.ucf-c-columns__grid'
			);
			const cells = [ ...( grid?.children ?? [] ) ].map( ( cell ) =>
				cell.getBoundingClientRect()
			);
			const width = grid?.getBoundingClientRect().width ?? 0;
			const gap = parseFloat( getComputedStyle( grid! ).columnGap );
			// The width of `span` tracks of 12, with their gaps.
			const span = ( n: number ) =>
				( ( width - 11 * gap ) / 12 ) * n + gap * ( n - 1 );
			const expected =
				width < 36 * rem
					? cells.map( () => width )
					: {
							'1:1': [ 6, 6 ],
							'2:1': [ 8, 4 ],
							'1:2': [ 4, 8 ],
							'1:1:1':
								width < 48 * rem ? [ 6, 6, 6 ] : [ 4, 4, 4 ],
							'1:1:1:1':
								width < 48 * rem
									? [ 6, 6, 6, 6 ]
									: [ 3, 3, 3, 3 ],
						}[ name ]!.map( span );
			cells.forEach( ( cell, index ) => {
				const want = expected[ index ] ?? Number.NaN;
				if ( ! ( Math.abs( cell.width - want ) <= 1 ) ) {
					failures.push(
						`${ name }, column ${ index + 1 } at ${ Math.round(
							width
						) }px: ${ cell.width.toFixed( 1 ) }px, not ${ want.toFixed( 1 ) }px`
					);
				}
			} );
		}
		await expect( failures ).toEqual( [] );
	},
};
