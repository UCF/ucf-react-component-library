/**
 * CONTEXT: the only code that knows the shape of the REST API's responses. Everything it
 * returns is normalized to types.ts, so if the data moves to the Search Service, this file
 * changes and the components do not.
 *
 * UPSTREAM: the API is the UCF Degree Search plugin's (`ucf-degree-search/v1`) plus WordPress's
 * own `wp/v2/degrees`, on ucf.edu. Which source the finder should use, this or the Search
 * Service, is an open question in docs/todo.md.
 */
import { DEFAULTS } from './defaults.ts';
import { decodeEntities } from './utils/decodeEntities.ts';
import type { Degree, DegreeClient, Interest, ProgramType } from './types.ts';

// UPSTREAM: the most WordPress returns in one page.
const PER_PAGE = 100;

interface ApiProgramType {
	slug: string;
	name: string;
	plural?: string;
	count?: number;
	children?: ApiProgramType[];
}

interface ApiInterest {
	slug: string;
	name: string;
	display_text?: string;
}

interface ApiDegree {
	id: number;
	title?: { rendered?: string };
	link: string;
}

export interface ClientOptions {
	apiRoot?: string;
	fetch?: typeof globalThis.fetch;
}

/**
 * A client for the ucf.edu REST API.
 *
 * @param options         Where to call, and how.
 * @param options.apiRoot The WordPress REST API root.
 * @param options.fetch   Replaces the global fetch, for tests.
 * @return A DegreeClient.
 */
export function createClient( {
	apiRoot = DEFAULTS.apiRoot,
	fetch: fetchFn = globalThis.fetch,
}: ClientOptions = {} ): DegreeClient {
	const root = apiRoot.replace( /\/+$/, '' );

	async function getJson< T >(
		path: string,
		params: Record< string, string | number >,
		signal?: AbortSignal
	): Promise< { data: T; totalPages: number } > {
		const query = new URLSearchParams(
			Object.entries( params ).map( ( [ key, value ] ) => [
				key,
				String( value ),
			] )
		).toString();
		const url = `${ root }/${ path }${ query ? `?${ query }` : '' }`;
		const response = await fetchFn( url, {
			signal,
			headers: { Accept: 'application/json' },
		} );

		if ( ! response.ok ) {
			throw new Error(
				`Request failed with status ${ response.status }: ${ url }`
			);
		}

		return {
			data: ( await response.json() ) as T,
			totalPages:
				Number( response.headers.get( 'X-WP-TotalPages' ) ) || 1,
		};
	}

	return {
		async getProgramTypes( { signal } = {} ) {
			const { data } = await getJson< ApiProgramType[] >(
				'ucf-degree-search/v1/program-types',
				{},
				signal
			);
			return data.map( normalizeProgramType );
		},

		async getInterests( programType, { signal } = {} ) {
			const { data } = await getJson< ApiInterest[] >(
				'ucf-degree-search/v1/interests/',
				{ program_types: programType },
				signal
			);

			return data
				.map( ( interest ): Interest => ( {
					slug: interest.slug,
					name: decodeEntities(
						interest.display_text || interest.name
					),
				} ) )
				.sort( ( a, b ) => a.name.localeCompare( b.name ) );
		},

		// FIX: loads every page, not just the first. The shortcode stopped at 30 programs and
		// silently dropped the rest.
		async getDegrees( programType, interests, { signal } = {} ) {
			if ( ! interests.length ) {
				return [];
			}

			const params = {
				program_types: programType,
				interests: interests.join( ',' ),
				per_page: PER_PAGE,
				orderby: 'title',
				order: 'asc',
				_fields: 'id,title,link',
			};

			const first = await getJson< ApiDegree[] >(
				'wp/v2/degrees',
				{ ...params, page: 1 },
				signal
			);
			const rest = await Promise.all(
				Array.from( { length: first.totalPages - 1 }, ( _, i ) =>
					getJson< ApiDegree[] >(
						'wp/v2/degrees',
						{ ...params, page: i + 2 },
						signal
					)
				)
			);

			return [ first, ...rest ]
				.flatMap( ( page ) => page.data )
				.map( ( degree ): Degree => ( {
					id: degree.id,
					title: decodeEntities( degree.title?.rendered ),
					url: degree.link,
				} ) );
		},
	};
}

function normalizeProgramType( type: ApiProgramType ): ProgramType {
	return {
		slug: type.slug,
		name: decodeEntities( type.name ),
		plural: decodeEntities( type.plural || type.name ),
		count: type.count ?? 0,
		children: ( type.children ?? [] ).map( normalizeProgramType ),
	};
}
