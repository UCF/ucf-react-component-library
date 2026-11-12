/**
 * A list prop's options in an editor, loaded once a page.
 *
 * WHY once a page: ten Degree Lists on a page each show a Colleges field, and every one would
 * otherwise ask the Search Service for the same twelve colleges. A failed load is forgotten, so
 * the next field to open tries again.
 * WHY here: both editors (WordPress, Puck) use it, and neither may import the other's code.
 */

import { useEffect, useState } from 'react';

import type { ListProp, Option, OptionsLoader } from '../schema/props.ts';

const loads = new Map< OptionsLoader, Promise< readonly Option[] > >();

/**
 * A loader's options, from the one request this page makes.
 *
 * @param loader A list prop's OptionsLoader.
 * @return Its options.
 */
export function loadOptions(
	loader: OptionsLoader
): Promise< readonly Option[] > {
	let load = loads.get( loader );
	if ( ! load ) {
		load = loader().catch( ( error: unknown ) => {
			loads.delete( loader );
			throw error;
		} );
		loads.set( loader, load );
	}
	return load;
}

export type OptionsState =
	| { status: 'loading'; options: null }
	| { status: 'ready'; options: readonly Option[] }
	| { status: 'error'; options: null };

/**
 * A list prop's options: at once when they are fixed, otherwise once loaded.
 *
 * @param definition A list prop.
 * @return Its options, or why there are none yet.
 */
export function useOptions( definition: ListProp ): OptionsState {
	const { options } = definition;
	const [ state, setState ] = useState< OptionsState >( () =>
		typeof options === 'function'
			? { status: 'loading', options: null }
			: { status: 'ready', options }
	);

	useEffect( () => {
		if ( typeof options !== 'function' ) {
			setState( { status: 'ready', options } );
			return undefined;
		}
		let current = true;
		loadOptions( options ).then(
			( loaded ) =>
				current && setState( { status: 'ready', options: loaded } ),
			() => current && setState( { status: 'error', options: null } )
		);
		return () => {
			current = false;
		};
	}, [ options ] );

	return state;
}
