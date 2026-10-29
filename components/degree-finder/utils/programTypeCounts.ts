import type { ProgramType } from '../types.ts';

/**
 * Flattens the program type tree into a slug-to-count lookup.
 *
 * WHY flatten: a card can then show its type's count wherever the type sits in the tree.
 *
 * @param programTypes The tree, from the client.
 * @return Counts by slug.
 */
export function programTypeCounts(
	programTypes: ProgramType[]
): Map< string, number > {
	const counts = new Map< string, number >();

	const visit = ( type: ProgramType ) => {
		counts.set( type.slug, type.count );
		type.children.forEach( visit );
	};
	programTypes.forEach( visit );

	return counts;
}
