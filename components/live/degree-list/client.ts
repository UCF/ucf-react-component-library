/**
 * CONTEXT: the only code that knows the UCF Search Service's response shape. Everything it
 * returns is a Program (types.ts) or an editor's Option, so if the service changes, this file
 * changes and the component does not.
 *
 * Used wherever programs are fetched in JavaScript: a Next Server Component, the WordPress
 * editor's preview, Puck. On a WordPress page, PHP fetches instead, with the same rules:
 * SYNC: integrations/wp/client.php, step for step. tests/DegreeList.php.test.tsx runs both on
 * the same responses and fails when their programs or markup differ.
 *
 * UPSTREAM: the Search Service (search.cm.ucf.edu) sends `Access-Control-Allow-Origin: *`, so
 * an editor's browser may fetch it directly.
 * UPSTREAM: `/programs/` ignores every filter; `/programs/search/` applies them. A misspelled
 * parameter name is ignored there too, and returns every program, so queries are built only from
 * the names in programsQuery().
 */
import type { Option } from '@/integrations/schema/props';
import type { Program, ProgramFilters } from './types.ts';

/** The Search Service's API. SYNC: ucf_degrees_degree_list_settings() in ucf-degrees.php. */
export const DEFAULT_API_ROOT = 'https://search.cm.ucf.edu/api/v1/';

/** UPSTREAM: the most programs the service sends in one page. */
export const PAGE_SIZE = 50;

/**
 * UPSTREAM: the most pages one list reads. Every active program is 12 pages; this stops a
 * service that misreports its count from sending the page into a long loop.
 * SYNC: client.php.
 */
export const MAX_PAGES = 40;

/**
 * The program types an editor picks from, with the Search Service's own labels, and the `level`
 * ID it filters by. WHY our own values (`bachelors`), not the IDs: a saved block and a React site
 * read `programTypes={ [ 'bachelors' ] }`, not `[ '1' ]`.
 * SYNC: client.php's level map.
 */
export const PROGRAM_TYPES = [
	{ value: 'bachelors', label: 'Bachelors', level: 1 },
	{ value: 'masters', label: 'Masters', level: 2 },
	{ value: 'certificate', label: 'Certificate', level: 3 },
	{ value: 'doctoral', label: 'Doctoral', level: 4 },
	{ value: 'specialist', label: 'Specialist', level: 5 },
	{ value: 'professional', label: 'Professional', level: 6 },
	{ value: 'minor', label: 'Minor', level: 7 },
] as const;

// WHY a pattern: a slug goes into the query as it is, so anything else (a space, a comma, `&`)
// could change which parameters the service reads.
const SLUG = /^[a-z0-9-]+$/;

/**
 * One filter's query parameters, or null when it had values and none can be sent.
 * WHY null, not no filter: a list asked for one college must never show every program.
 *
 * @param name   The parameter.
 * @param values The values asked for.
 * @return `&name=value` for each, or null.
 */
function filterOf( name: string, values: readonly string[] ): string | null {
	const sent = values.filter(
		( value ) => typeof value === 'string' && SLUG.test( value )
	);
	if ( values.length && ! sent.length ) {
		return null;
	}
	return sent.map( ( value ) => `&${ name }=${ value }` ).join( '' );
}

/**
 * The query for one page of programs, or null when the filters can match nothing.
 *
 * Always: active programs (`active` decides what's shown; `valid` is an internal flag), each
 * once (`subplan_code__isnull`: no tracks), and only the fields the list shows (a page of whole
 * records is 1.2 MB; of these three fields, 6 KB). Repeating a filter means any of its values;
 * different filters all apply.
 *
 * @param filters The list's filters.
 * @param offset  How many programs to skip: a page's start.
 * @return The query string, without `?`, or null.
 */
export function programsQuery(
	filters: ProgramFilters,
	offset: number
): string | null {
	// WHY '' for a type that isn't one: filterOf() drops it, as it does a bad slug.
	const levels = ( filters.programTypes ?? [] ).map( ( value ) =>
		String(
			PROGRAM_TYPES.find( ( type ) => type.value === value )?.level ?? ''
		)
	);
	const parts = [
		filterOf( 'college_slug', filters.colleges ?? [] ),
		filterOf( 'department_slug', filters.departments ?? [] ),
		filterOf( 'level', levels ),
	];
	if ( parts.includes( null ) ) {
		return null;
	}
	return `active=True&subplan_code__isnull=True&fields=id,name,primary_profile_url${ parts.join(
		''
	) }&limit=${ PAGE_SIZE }&offset=${ offset }`;
}

/**
 * Trimmed of spaces, tabs and line breaks. SYNC: client.php trims the same four characters.
 * WHY not trim(): JavaScript's and PHP's differ in which spaces they remove.
 *
 * @param text Text.
 */
const trimmed = ( text: string ) =>
	text.replace( /^[ \t\n\r]+|[ \t\n\r]+$/g, '' );

/**
 * The key a name sorts by: A to Z lowered, nothing else changed.
 * WHY not localeCompare(): PHP has no match for it, and the two must order names alike.
 * "e-Learning…" sorts among the E's, not after every capital.
 *
 * @param name A program's name.
 */
const sortKey = ( name: string ) =>
	name.replace( /[A-Z]/g, ( letter ) => letter.toLowerCase() );

/**
 * Two programs in the list's order: by name, ignoring case, then by name as written, then by URL.
 * SYNC: ucf_degrees_degree_list_compare() in client.php.
 * WHY plain `<`: it compares UTF-16 code units, which order like PHP's strcmp() compares UTF-8
 * bytes for every name the service has (all below U+D800).
 *
 * @param a A program.
 * @param b Another.
 */
export function compareProgramsByName( a: Program, b: Program ): number {
	for ( const [ x, y ] of [
		[ sortKey( a.name ), sortKey( b.name ) ],
		[ a.name, b.name ],
		[ a.url, b.url ],
	] ) {
		if ( x !== y ) {
			return ( x ?? '' ) < ( y ?? '' ) ? -1 : 1;
		}
	}
	return 0;
}

/**
 * The service's program records as Programs: each with a name and an http(s) profile URL,
 * trimmed, each profile once, sorted by name.
 * WHY each profile once: a program offered on campus and online is two records, and most share
 * one profile page. Two records with different pages both show, even with the same name.
 *
 * @param results The `results` of every page, in order.
 * @return The programs to show.
 */
export function normalizePrograms( results: unknown ): Program[] {
	if ( ! Array.isArray( results ) ) {
		return [];
	}
	const seen = new Set< string >();
	const programs: Program[] = [];
	for ( const record of results as Record< string, unknown >[] ) {
		if ( ! record || typeof record !== 'object' ) {
			continue;
		}
		const name =
			typeof record.name === 'string' ? trimmed( record.name ) : '';
		const url =
			typeof record.primary_profile_url === 'string'
				? record.primary_profile_url
				: '';
		if ( ! name || ! /^https?:\/\//i.test( url ) || seen.has( url ) ) {
			continue;
		}
		seen.add( url );
		programs.push( { id: String( record.id ?? '' ), name, url } );
	}
	return programs.sort( compareProgramsByName );
}

export interface ClientOptions {
	/** The Search Service's API root. */
	apiRoot?: string;
	/** Replaces the global fetch, for tests and for hosts that cache their own. */
	fetch?: typeof globalThis.fetch;
}

export interface DegreeListClient {
	/** The programs a list with these filters shows. */
	getPrograms: (
		filters: ProgramFilters & { signal?: AbortSignal }
	) => Promise< Program[] >;
	/** Every college, for an editor's choices: its slug and full name. */
	getColleges: ( signal?: AbortSignal ) => Promise< Option[] >;
	/** Every department, for an editor's choices: its slug and full name. */
	getDepartments: ( signal?: AbortSignal ) => Promise< Option[] >;
}

/**
 * A client for the Search Service.
 *
 * @param options         Where the service is, and how to fetch.
 * @param options.apiRoot The API root; the live service when left out or ''.
 * @param options.fetch   Replaces the global fetch.
 * @return A DegreeListClient.
 */
export function createClient( {
	apiRoot,
	fetch: fetchFn = globalThis.fetch,
}: ClientOptions = {} ): DegreeListClient {
	const root = ( apiRoot || DEFAULT_API_ROOT ).replace( /\/*$/, '/' );

	async function getJson( path: string, signal?: AbortSignal ) {
		const url = root + path;
		const response = await fetchFn( url, {
			signal,
			headers: { Accept: 'application/json' },
		} );
		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }: ${ url }`
			);
		}
		return ( await response.json() ) as Record< string, unknown >;
	}

	// WHY sorted by label: an editor scans the choices by name; the service sends them by ID.
	async function optionsFrom( path: string, signal?: AbortSignal ) {
		const { results } = await getJson( path, signal );
		return ( Array.isArray( results ) ? results : [] )
			.flatMap( ( item: Record< string, unknown > ): Option[] =>
				typeof item?.slug === 'string' &&
				typeof item.full_name === 'string'
					? [ { value: item.slug, label: item.full_name } ]
					: []
			)
			.sort( ( a, b ) => a.label.localeCompare( b.label ) );
	}

	return {
		async getPrograms( { signal, ...filters } ) {
			const first = programsQuery( filters, 0 );
			if ( first === null ) {
				return [];
			}
			const page = await getJson( `programs/search/?${ first }`, signal );
			const count = Math.min(
				Number( page.count ) || 0,
				MAX_PAGES * PAGE_SIZE
			);
			// WHY the rest at once: each page waits only on the first, which gives the count.
			const rest = await Promise.all(
				Array.from(
					{
						length: Math.max(
							0,
							Math.ceil( count / PAGE_SIZE ) - 1
						),
					},
					( _, index ) =>
						getJson(
							`programs/search/?${ programsQuery(
								filters,
								( index + 1 ) * PAGE_SIZE
							) }`,
							signal
						)
				)
			);
			return normalizePrograms(
				[ page, ...rest ].flatMap( ( { results } ) =>
					Array.isArray( results ) ? results : []
				)
			);
		},
		getColleges: ( signal ) => optionsFrom( 'colleges/', signal ),
		// UPSTREAM: departments come 100 a page by default; there are 113.
		getDepartments: ( signal ) =>
			optionsFrom( 'departments/?limit=500', signal ),
	};
}
