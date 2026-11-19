/**
 * Step 6 · WordPress and Puck · every component with a list prop · its options: loaded once a
 * page, and saved values shown by their labels.
 *
 * Used by both editors' list fields (core/hosts/wordpress/controls/list-control.tsx,
 * core/hosts/puck/list-field.tsx), so the two agree.
 *
 * WHY loaded once a page: ten Degree Lists on a page each show a Colleges field, and every one would
 * otherwise ask the Search Service for the same twelve colleges. A failed load is forgotten, so
 * the next field to open tries again.
 * WHY here: both editors (WordPress, Puck) use it, and neither may import the other's code.
 */

import { useEffect, useState } from 'react';

import type { ListProp, Option, OptionsLoader } from './prop-definitions.ts';

// ── Loading ────────────────────────────────────────────────────────────────────────────────────

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

// ── Saved values and labels ────────────────────────────────────────────────────────────────────

/** A saved value as an editor sees it. */
export type Chosen = {
	value: string;
	/** Its option's label, or the value itself when no option has it. */
	label: string;
	/**
	 * Whether an option has it. WHY kept when false: a saved value the source no longer lists (a
	 * renamed department) silently matches nothing, so the field shows it as a problem instead of
	 * dropping it.
	 */
	known: boolean;
};

/**
 * Saved values, each with its label.
 *
 * @param values  The prop's saved values.
 * @param options Its options. While they load, every value shows as itself.
 * @return One entry per value, in the saved order.
 */
export function chosenOf(
	values: readonly string[],
	options: readonly Option[] | null
): Chosen[] {
	return values.map( ( value ) => {
		const option = options?.find( ( item ) => item.value === value );
		return option
			? { value, label: option.label, known: true }
			: { value, label: value, known: options === null };
	} );
}

/**
 * The values for what an editor picked, by label.
 * WHY by label: an editor types and picks labels; the prop saves values.
 *
 * @param labels  What the field holds: labels, or a saved value no option has.
 * @param options The prop's options.
 * @return The values, in the field's order, each once.
 */
export function valuesOf(
	labels: readonly string[],
	options: readonly Option[]
): string[] {
	const values = labels.map(
		( label ) =>
			options.find( ( option ) => option.label === label )?.value ?? label
	);
	return [ ...new Set( values ) ];
}
