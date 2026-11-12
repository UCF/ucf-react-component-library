/**
 * `@ucf/components/degree-list`. SYNC: docs/architecture.md, "What a component exports".
 *
 * A live component: fetch the programs, then render the list. In a Next Server Component:
 *
 *     const programs = await createClient().getPrograms( { colleges: [ 'sciences' ] } );
 *     return <DegreeList programs={ programs } columns="2" />;
 */
export { default as DegreeList, type DegreeListProps } from './DegreeList.tsx';
export { PROPS as DEGREE_LIST_PROPS } from './DegreeList.props.ts';
export {
	createClient,
	normalizePrograms,
	programsQuery,
	DEFAULT_API_ROOT,
	PROGRAM_TYPES,
	type ClientOptions,
	type DegreeListClient,
} from './client.ts';
export type { Program, ProgramFilters } from './types.ts';
