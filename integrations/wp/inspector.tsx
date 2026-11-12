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
import { ListControl } from './list-control.tsx';

type Props = {
	definition: PropDefinition;
	/** The prop's value: a string, or a list prop's values. */
	value: unknown;
	onChange: ( value: string | string[] ) => void;
};

/**
 * Tokens for a list, radio buttons or a select for a choice, a text box for multiline text, a
 * text field otherwise.
 *
 * @param props            The prop's definition, its value, and what to call when it changes.
 * @param props.definition The prop's definition (its field: label, help, control, options).
 * @param props.value      Its value.
 * @param props.onChange   Called with the new value.
 */
export function FieldControl( { definition, value, onChange }: Props ) {
	if ( definition.type === 'list' ) {
		return (
			<ListControl
				definition={ definition }
				value={ Array.isArray( value ) ? value : [] }
				onChange={ onChange }
			/>
		);
	}
	const common = { label: definition.label, help: definition.help, onChange };
	const text = String( value ?? '' );
	if ( definition.type !== 'choice' ) {
		return 'control' in definition && definition.control === 'multiline' ? (
			<TextareaControl { ...common } value={ text } />
		) : (
			<TextControl __next40pxDefaultSize { ...common } value={ text } />
		);
	}
	// UPSTREAM: both controls want a mutable array; the definitions' is readonly.
	const options = definition.options.map( ( option ) => ( { ...option } ) );
	return definition.control === 'radio' ? (
		<RadioControl { ...common } options={ options } selected={ text } />
	) : (
		<SelectControl
			__next40pxDefaultSize
			{ ...common }
			options={ options }
			value={ text }
		/>
	);
}
