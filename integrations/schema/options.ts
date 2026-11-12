/**
 * Options: what a list prop's saved values look like to an editor, and back.
 *
 * Used by each host's field for a list prop (integrations/wp/list-control.tsx,
 * integrations/puck/list-field.tsx), so the two agree on what an unknown value is.
 */

import type { Option } from './props.ts';

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
