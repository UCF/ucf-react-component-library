/**
 * Step 6 · Puck · every component · props → Puck fields (puckFields).
 *
 * A content component gets them through puckConfig() (config.tsx); a live or interactive one calls
 * puckFields() in its own Puck config.
 */

import { inHost, type PropsIn } from '../read-props.ts';
import type { PropDefinition, PropDefinitions } from '../prop-definitions.ts';
import { listField } from './list-field.tsx';
import type {
	PuckCustomField,
	PuckFieldFor,
	PuckScalarField,
} from './types.ts';

/**
 * Prop definitions as Puck fields: radio buttons or a select for a choice, a text field otherwise,
 * for every prop Puck has.
 *
 * @param definitions A component's prop definitions.
 */
export function puckFields< Props extends PropDefinitions >(
	definitions: Props
): {
	[ Key in keyof PropsIn< Props, 'puck' > ]: PuckFieldFor<
		PropsIn< Props, 'puck' >[ Key ]
	>;
} {
	return Object.fromEntries(
		Object.entries( definitions )
			.filter( ( [ , definition ] ) => inHost( definition, 'puck' ) )
			.map(
				( [ key, definition ] ): [
					string,
					PuckScalarField | PuckCustomField< readonly string[] >,
				] => [ key, fieldOf( definition ) ]
			)
	) as never;
}

/**
 * One prop as a Puck field.
 *
 * @param definition A prop.
 */
function fieldOf(
	definition: PropDefinition
): PuckScalarField | PuckCustomField< readonly string[] > {
	if ( definition.type === 'list' ) {
		return listField( definition );
	}
	return definition.type === 'choice'
		? {
				type: definition.control,
				label: definition.label,
				options: definition.options.map( ( option ) => ( {
					...option,
				} ) ),
			}
		: {
				type:
					'control' in definition &&
					definition.control === 'multiline'
						? 'textarea'
						: 'text',
				label: definition.label,
			};
}
