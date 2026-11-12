/**
 * Storybook: a component's props as story controls, with the values editors get.
 */

import type { ArgTypes } from '@storybook/react-vite';

import type { PropDefinitions } from '../schema/props.ts';

/**
 * Inline radio buttons or a select for each choice prop; checkboxes for a list prop with fixed
 * options, and its values as JSON for one whose options load (a story can't wait on an API).
 *
 * @param definitions A component's prop definitions.
 */
export function argTypesOf( definitions: PropDefinitions ): ArgTypes {
	return Object.fromEntries(
		Object.entries( definitions ).flatMap(
			( [ key, definition ] ): [ string, ArgTypes[ string ] ][] => {
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
