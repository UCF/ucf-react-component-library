/**
 * Puck: a component's settings as Puck fields. Every component uses this, whatever its kind:
 * a content component through puckConfig() (config.tsx), and a live or interactive one in its
 * own hand-written Puck config.
 */

import {
	inHost,
	type PropDefinition,
	type PropDefinitions,
	type PropsIn,
} from '../../define/props.ts';
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
