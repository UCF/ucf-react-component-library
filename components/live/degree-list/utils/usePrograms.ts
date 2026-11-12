/**
 * The programs for an editor's preview, fetched in the browser.
 *
 * WHY only for editors: the WordPress editor and Puck render on the client, so they fetch
 * there. A page a visitor sees gets its programs on the server (render.php, or a Next Server
 * Component calling client.ts), and DegreeList itself never fetches.
 */
import { useEffect, useState } from 'react';

import { createClient } from '../client.ts';
import type { Program, ProgramFilters } from '../types.ts';

export type ProgramsState =
	| { status: 'loading'; programs: readonly Program[] }
	| { status: 'success'; programs: readonly Program[] }
	| { status: 'error'; programs: readonly Program[]; error: Error };

/**
 * A list's programs, fetched again whenever its filters change.
 *
 * @param filters         Which programs.
 * @param options         Where from.
 * @param options.apiRoot The Search Service's API root; the live one when left out.
 * @return The request's state, with the last programs while the next load.
 */
export function usePrograms(
	filters: ProgramFilters,
	{ apiRoot }: { apiRoot?: string } = {}
): ProgramsState {
	const [ state, setState ] = useState< ProgramsState >( {
		status: 'loading',
		programs: [],
	} );
	// WHY a key: an editor's arrays are new objects on every render, so the effect compares
	// their contents, not their identity.
	const key = JSON.stringify( [
		filters.colleges ?? [],
		filters.departments ?? [],
		filters.programTypes ?? [],
		apiRoot ?? '',
	] );

	useEffect( () => {
		const controller = new AbortController();
		const [ colleges, departments, programTypes, root ] = JSON.parse(
			key
		) as [ string[], string[], string[], string ];
		setState( ( last ) => ( {
			status: 'loading',
			programs: last.programs,
		} ) );
		createClient( { apiRoot: root } )
			.getPrograms( {
				colleges,
				departments,
				programTypes,
				signal: controller.signal,
			} )
			.then(
				( programs ) => {
					if ( ! controller.signal.aborted ) {
						setState( { status: 'success', programs } );
					}
				},
				( error: unknown ) => {
					if ( ! controller.signal.aborted ) {
						setState( {
							status: 'error',
							programs: [],
							error:
								error instanceof Error
									? error
									: new Error( String( error ) ),
						} );
					}
				}
			);
		return () => controller.abort();
	}, [ key ] );

	return state;
}
