/**
 * The Degree List for Puck: a plain config object, so this library needs no Puck dependency.
 *
 * WHY fetched in the browser here: Puck's editor renders on the client, and `render` can't wait
 * for data. A Puck site rendering a saved page on the server should fetch there instead, as the
 * Event List's config says (docs/todo.md, the Puck playground).
 */
import { defaultsIn } from '@/integrations/schema/props';
import { puckFields } from '@/integrations/puck/config';
import type { PuckComponentConfig } from '@/integrations/puck/types';
import DegreeList from '../../DegreeList.tsx';
import { PROPS, type DegreeListEditableProps } from '../../DegreeList.props.ts';
import { usePrograms } from '../../utils/usePrograms.ts';

/**
 * The list, fetched for the preview.
 *
 * @param props The stored props.
 */
function Preview( props: DegreeListEditableProps ) {
	const { programs } = usePrograms( {
		colleges: props.colleges,
		departments: props.departments,
		programTypes: props.programTypes,
	} );
	return (
		<DegreeList
			programs={ programs }
			title={ props.title }
			columns={ props.columns }
			emptyMessage={ props.emptyMessage }
		/>
	);
}

const config: PuckComponentConfig< DegreeListEditableProps > = {
	label: 'Degree List',
	fields: puckFields( PROPS ),
	defaultProps: defaultsIn( PROPS, 'puck' ),
	// WHY each prop by name: Puck also passes `id`, `puck` and `editMode`, which aren't ours.
	render: ( {
		colleges,
		departments,
		programTypes,
		title,
		columns,
		emptyMessage,
	} ) => (
		<Preview
			colleges={ colleges }
			departments={ departments }
			programTypes={ programTypes }
			title={ title }
			columns={ columns }
			emptyMessage={ emptyMessage }
		/>
	),
};

export default config;
