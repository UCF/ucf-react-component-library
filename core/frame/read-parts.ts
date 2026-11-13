/**
 * Step 5 · content · reading a component's parts and presets, for the hosts and React sites:
 * a preset found by name, and its parts with their part kind and class looked up.
 *
 * What a part and a preset are is in types.ts. core/testing/suites/presets.test.tsx checks each
 * preset reaches WordPress whole.
 */

import type {
	PartDefinition,
	PartDefinitions,
	PartOf,
	ResolvedPart,
} from './types.ts';

// ── Presets ────────────────────────────────────────────────────────────────────────────────────

/**
 * A preset by its name, or an error listing the names there are.
 *
 * @param presets A component's presets.
 * @param name    A preset's name.
 */
export function findPreset< SomePreset extends { name: string } >(
	presets: readonly SomePreset[],
	name: string
): SomePreset {
	const preset = presets.find( ( item ) => item.name === name );
	if ( ! preset ) {
		throw new Error(
			`There is no preset "${ name }". There are: ${ presets
				.map( ( item ) => item.name )
				.join( ', ' ) }.`
		);
	}
	return preset;
}

// ── Parts ──────────────────────────────────────────────────────────────────────────────────────

/**
 * Parts with their kind and class looked up, for each host's parts-to-* file.
 *
 * @param partDefinitions A component's PARTS.
 * @param parts           A preset's parts.
 */
export function resolveParts< Parts extends PartDefinitions >(
	partDefinitions: Parts,
	parts: readonly PartOf< Parts >[]
): ResolvedPart[] {
	return parts.map( ( { part, ...content } ) => {
		const definition = partDefinitions[ part ] as PartDefinition;
		// UPSTREAM: TypeScript can't follow a look's kind to its content through the table.
		return {
			part,
			kind: definition.kind,
			className: definition.className ?? '',
			...content,
		} as unknown as ResolvedPart;
	} );
}

/**
 * The end of a switch over every kind. WHY: a new kind no case handles is then a type error.
 *
 * @param part A part no case handled.
 */
export function unhandledPart( part: never ): never {
	throw new Error( `No case for the part ${ JSON.stringify( part ) }.` );
}
