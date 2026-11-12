/**
 * CONTEXT: the Degree List, a live component: programs from the UCF Search Service, each linking
 * to its profile page, written into the page on the server (docs/architecture.md, "Three kinds
 * of component").
 *
 * Content rules apply to this core: props in, markup out, no state, no effects, no fetching.
 * Whoever renders it fetches first and passes `programs`: a Next Server Component through
 * client.ts; WordPress in PHP (integrations/wp/render.php).
 *
 * SYNC: integrations/wp/render.php writes this same markup in PHP. tests/DegreeList.php.test.tsx
 * fails when the two differ; change both together. Nothing stores it, so a change needs no
 * block deprecation.
 * SPEC: the `[degree-list]` shortcode's classic layout: a list of links, one per program.
 */
import Heading from '@/components/primitives/heading/Heading';
import type { DegreeListEditableProps } from './DegreeList.props.ts';
import type { Program } from './types.ts';

export type DegreeListProps = Partial<
	Pick< DegreeListEditableProps, 'title' | 'columns' | 'emptyMessage' >
> & {
	/** The programs to show, already fetched and in order (client.ts). */
	programs?: readonly Program[];
	/** Extra classes for the root, as a host adds its own. */
	className?: string;
};

/**
 * The heading as written, trimmed. SYNC: render.php trims the same four characters.
 * WHY not trim(): JavaScript's and PHP's differ in which spaces they remove.
 *
 * @param title The heading an editor set.
 */
const headingOf = ( title: string ) =>
	title.replace( /^[ \t\n\r]+|[ \t\n\r]+$/g, '' );

export default function DegreeList( {
	programs = [],
	title = '',
	columns = '1',
	emptyMessage = '',
	className,
}: DegreeListProps ) {
	const heading = headingOf( title );
	return (
		<div
			className={ [ className, 'ucf-c', 'ucf-c-degree-list' ]
				.filter( Boolean )
				.join( ' ' ) }
			// WHY only when not the default: the default has no attribute to style.
			data-columns={
				columns === '2' || columns === '3' ? columns : undefined
			}
		>
			{ heading ? (
				<Heading
					level={ 2 }
					className="ucf-c-degree-list__heading"
					content={ heading }
				/>
			) : null }
			{ programs.length ? (
				<ul className="ucf-c-degree-list__items">
					{ programs.map( ( program ) => (
						<li
							className="ucf-c-degree-list__item"
							key={ program.url }
						>
							<a href={ program.url }>{ program.name }</a>
						</li>
					) ) }
				</ul>
			) : null }
			{ ! programs.length && emptyMessage ? (
				<p className="ucf-c-degree-list__empty">{ emptyMessage }</p>
			) : null }
		</div>
	);
}
