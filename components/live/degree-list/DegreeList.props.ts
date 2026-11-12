/**
 * The Degree List's props: every prop an editor sets. WordPress's sidebar and block.json
 * attributes, Puck's fields and the stories' controls are built from it
 * (integrations/schema/props.ts).
 *
 * SPEC: the `[degree-list]` (UCF-Degree-CPT-Plugin) and `[ucf-external-degree-list]`
 * (UCF-Degree-Search-Plugin) shortcodes: filters by college, department and program type, a
 * title, and a classic or two-column layout, here one to three columns.
 * SYNC: each prop's key is a block attribute, saved in every post that uses the block, so it is
 * permanent (docs/architecture.md, "Naming"). `npm run sync:blocks` writes them into block.json.
 */
import type { PropDefinitions, PropsOf } from '@/integrations/schema/props';
import { createClient, PROGRAM_TYPES } from './client.ts';

// WHY the live service's, in every editor: the choices are the service's colleges and
// departments, and a site pointed at another API root still files programs under them.
const service = createClient();

export const PROPS = {
	/** The colleges whose programs show, by the Search Service's slugs; none for every college. */
	colleges: {
		type: 'list',
		label: 'Colleges',
		help: 'Show programs in any of these colleges. Leave empty for every college.',
		panel: 'Programs',
		options: ( signal ) => service.getColleges( signal ),
		default: [],
	},
	/** The departments whose programs show, by slug; none for every department. */
	departments: {
		type: 'list',
		label: 'Departments',
		help: 'Show programs in any of these departments. Leave empty for every department.',
		panel: 'Programs',
		options: ( signal ) => service.getDepartments( signal ),
		default: [],
	},
	/** The program types that show; none for every type. */
	programTypes: {
		type: 'list',
		label: 'Program types',
		help: 'Show programs of any of these types. Leave empty for every type.',
		panel: 'Programs',
		options: PROGRAM_TYPES.map( ( { value, label } ) => ( {
			value,
			label,
		} ) ),
		default: [],
	},
	/** A heading above the list, or '' for none. */
	title: {
		type: 'text',
		label: 'Heading',
		help: 'Shown above the list. Leave empty when the section already has one.',
		panel: 'Display',
		default: '',
	},
	/**
	 * How many columns, where the list is wide enough: two from 36rem of list, three from 54rem.
	 * The names run down each column, as they do in print.
	 */
	columns: {
		type: 'choice',
		label: 'Columns',
		panel: 'Display',
		control: 'radio',
		options: [
			{ value: '1', label: 'One' },
			{ value: '2', label: 'Two' },
			{ value: '3', label: 'Three' },
		],
		default: '1',
	},
	/** What to say when no program matches, or '' to show nothing. */
	emptyMessage: {
		type: 'text',
		label: 'When no programs match',
		panel: 'Display',
		default: 'No programs found.',
	},
} as const satisfies PropDefinitions;

export type DegreeListEditableProps = PropsOf< typeof PROPS >;
