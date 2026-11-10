/**
 * WordPress: a prop as a sidebar control.
 *
 * WHY not in the npm package: it imports `@wordpress/components`, which only WordPress has.
 */

import {
	RadioControl,
	SelectControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';

import type { PropDefinition } from '../schema/props.ts';

type Props = {
	definition: PropDefinition;
	value: string;
	onChange: ( value: string ) => void;
};

/**
 * Radio buttons or a select for a choice, a text box for multiline text, a text field otherwise.
 *
 * @param props            The prop's definition, its value, and what to call when it changes.
 * @param props.definition The prop's definition (its field: label, help, control, options).
 * @param props.value      Its value.
 * @param props.onChange   Called with the new value.
 */
export function FieldControl( { definition, value, onChange }: Props ) {
	const common = { label: definition.label, help: definition.help, onChange };
	if ( definition.type !== 'choice' ) {
		return 'control' in definition && definition.control === 'multiline' ? (
			<TextareaControl { ...common } value={ value } />
		) : (
			<TextControl __next40pxDefaultSize { ...common } value={ value } />
		);
	}
	// UPSTREAM: both controls want a mutable array; the definitions' is readonly.
	const options = definition.options.map( ( option ) => ( { ...option } ) );
	return definition.control === 'radio' ? (
		<RadioControl { ...common } options={ options } selected={ value } />
	) : (
		<SelectControl
			__next40pxDefaultSize
			{ ...common }
			options={ options }
			value={ value }
		/>
	);
}
