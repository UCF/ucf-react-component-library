/**
 * CONTEXT: a component's props schema (integrations/schema/props.ts) as Storybook
 * controls, so a story's controls offer the same values the editors do.
 */
import type { PropDefinitions } from '../schema/props.ts';

/**
 * Inline radio buttons or a select for each choice prop. Text and number props keep
 * Storybook's own control.
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
