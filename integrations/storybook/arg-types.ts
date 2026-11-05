/**
 * Storybook: a component's props as story controls, with the values editors get.
 */

import type { PropDefinitions } from '../schema/props.ts';

/**
 * Inline radio buttons or a select for each choice prop.
 *
 * @param definitions A component's prop definitions.
 */
export function argTypesOf( definitions: PropDefinitions ) {
	return Object.fromEntries(
		Object.entries( definitions ).flatMap( ( [ key, definition ] ) =>
			definition.type === 'choice'
				? [
						[
							key,
							{
								control:
									definition.control === 'radio'
										? 'inline-radio'
										: 'select',
								options: definition.options.map(
									( option ) => option.value
								),
							},
						],
					]
				: []
		)
	);
}
