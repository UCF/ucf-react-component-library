/**
 * Step 6 · Storybook · every component · props → story controls, with the values editors get.
 */

import type { ArgTypes } from '@storybook/react-vite';

import type { PropDefinitions } from '../prop-definitions.ts';

/**
 * Inline radio buttons or a select for each choice prop; checkboxes for a list prop with fixed
 * options, and its values as JSON for one whose options load (a story can't wait on an API);
 * a links or tiles prop as JSON.
 *
 * @param definitions A component's prop definitions.
 */
export function argTypesOf( definitions: PropDefinitions ): ArgTypes {
	return Object.fromEntries(
		Object.entries( definitions ).flatMap(
			( [ key, definition ] ): [ string, ArgTypes[ string ] ][] => {
				if (
					definition.type === 'links' ||
					definition.type === 'tiles'
				) {
					return [ [ key, { control: 'object' as const } ] ];
				}
				if ( definition.type === 'list' ) {
					return [
						[
							key,
							typeof definition.options === 'function'
								? { control: 'object' as const }
								: {
										control: 'check' as const,
										options: definition.options.map(
											( option ) => option.value
										),
									},
						],
					];
				}
				return definition.type === 'choice'
					? [
							[
								key,
								{
									control:
										definition.control === 'radio'
											? ( 'inline-radio' as const )
											: ( 'select' as const ),
									options: definition.options.map(
										( option ) => option.value
									),
								},
							],
						]
					: [];
			}
		)
	);
}
