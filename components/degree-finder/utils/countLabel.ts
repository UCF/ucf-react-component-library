/**
 * "1 program", "254 programs".
 *
 * @param count How many.
 * @return The label.
 */
export function countLabel( count: number ): string {
	return `${ count } ${ count === 1 ? 'program' : 'programs' }`;
}
