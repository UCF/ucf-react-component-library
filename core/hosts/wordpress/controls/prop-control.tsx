/**
 * Step 6 · WordPress · every component · one prop → its sidebar control (FieldControl).
 *
 * WHY not in the npm package: it imports `@wordpress/components`, which only WordPress has.
 */

import {
	RadioControl,
	SelectControl,
	TextControl,
	TextareaControl,
} from '@wordpress/components';

import type { Link, PropDefinition, Tile } from '../../prop-definitions.ts';
import { LinksControl } from './links-control.tsx';
import { ListControl } from './list-control.tsx';
import { TilesControl } from './tiles-control.tsx';

type Props = {
	definition: PropDefinition;
	/** The prop's value: a string, a list prop's values, or a links or tiles prop's items. */
	value: unknown;
	onChange: ( value: string | string[] | Link[] | Tile[] ) => void;
};

/**
 * Tokens for a list, fields per item for links and tiles, radio buttons or a select for a
 * choice, a text box for multiline text, a text field otherwise.
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
	if ( definition.type === 'links' ) {
		return (
			<LinksControl
				definition={ definition }
				value={ Array.isArray( value ) ? value : [] }
				onChange={ onChange }
			/>
		);
	}
	if ( definition.type === 'tiles' ) {
		return (
			<TilesControl
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
