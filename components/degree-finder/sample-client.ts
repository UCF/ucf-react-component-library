/**
 * CONTEXT: a client with no network, for Storybook and tests. Answers from sample-data.ts, real
 * ucf.edu records, so the stories look like the live finder.
 */
import {
	SAMPLE_DEGREES,
	SAMPLE_INTERESTS,
	SAMPLE_PROGRAM_TYPES,
} from './sample-data.ts';
import type { Degree, DegreeClient } from './types.ts';

export type SampleClientOptions = {
	/** Milliseconds before answering, so loading states can be seen. */
	delay?: number;
	/** Fail every request, to show the error state. */
	fail?: boolean;
};

/**
 * A DegreeClient that answers from sample data.
 *
 * @param options       How it behaves.
 * @param options.delay Milliseconds before each answer.
 * @param options.fail  Fail every request.
 * @return A DegreeClient.
 */
export function createSampleClient( {
	delay = 300,
	fail = false,
}: SampleClientOptions = {} ): DegreeClient {
	function answer< T >( value: () => T, signal?: AbortSignal ): Promise< T > {
		return new Promise( ( resolve, reject ) => {
			const timer = setTimeout( () => {
				if ( fail ) {
					reject( new Error( 'Sample client set to fail' ) );
					return;
				}
				resolve( value() );
			}, delay );

			signal?.addEventListener( 'abort', () => {
				clearTimeout( timer );
				reject( new DOMException( 'Aborted', 'AbortError' ) );
			} );
		} );
	}

	return {
		getProgramTypes: ( { signal } = {} ) =>
			answer(
				() => structuredClone( [ ...SAMPLE_PROGRAM_TYPES ] ),
				signal
			),

		getInterests: ( programType, { signal } = {} ) =>
			answer(
				() => [ ...( SAMPLE_INTERESTS[ programType ] ?? [] ) ],
				signal
			),

		// WHY merged, by id, and sorted: the API returns every degree matching any of the
		// interests, once each, by title. The sample has no degree under two interests yet, but
		// the live data could.
		getDegrees: ( programType, interests, { signal } = {} ) =>
			answer( () => {
				const byId = new Map< number, Degree >();
				for ( const interest of interests ) {
					for ( const degree of SAMPLE_DEGREES[
						`${ programType }/${ interest }`
					] ?? [] ) {
						byId.set( degree.id, degree );
					}
				}
				return [ ...byId.values() ].sort( ( a, b ) =>
					a.title.localeCompare( b.title )
				);
			}, signal ),
	};
}
