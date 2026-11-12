/**
 * Puck: a list prop as a field, a group of checkboxes with a filter.
 *
 * WHY checkboxes, not a token field like WordPress's: Puck has no multi-select of its own, and a
 * Puck config can't use WordPress's components. A checkbox per option is the plain HTML control
 * for "any of these", and the filter keeps a long list (113 departments) usable.
 * WHY styled inline: Puck's editor loads no stylesheet of ours.
 */

import { useId, useState, type CSSProperties } from 'react';

import { useOptions } from '../react/options.ts';
import { chosenOf } from '../schema/options.ts';
import type { ListProp } from '../schema/props.ts';
import type { PuckCustomField } from './types.ts';

// SPEC: past this many options, a filter box is worth its space.
const FILTER_FROM = 8;

const styles = {
	group: { border: 0, margin: 0, minWidth: 0, padding: 0 },
	legend: { fontWeight: 600, marginBottom: 8, padding: 0 },
	filter: { boxSizing: 'border-box', marginBottom: 8, width: '100%' },
	options: { maxHeight: 240, overflowY: 'auto' },
	option: { alignItems: 'baseline', display: 'flex', gap: 8 },
	note: { fontSize: 12, margin: '4px 0 0' },
} satisfies Record< string, CSSProperties >;

type Props = {
	definition: ListProp;
	value: readonly string[];
	onChange: ( value: string[] ) => void;
	readOnly?: boolean;
};

/**
 * Checkboxes for a list prop's options, saved values that no option has first.
 *
 * @param props            The prop, its values, and what to call when they change.
 * @param props.definition A list prop.
 * @param props.value      Its values.
 * @param props.onChange   Called with the new values, in the order they were chosen.
 * @param props.readOnly   Whether Puck has locked the field.
 */
export function ListField( { definition, value, onChange, readOnly }: Props ) {
	const state = useOptions( definition );
	const [ filter, setFilter ] = useState( '' );
	const id = useId();
	const options = state.options ?? [];
	const unknown = chosenOf( value, state.options ).filter(
		( item ) => ! item.known
	);
	const match = filter.trim().toLocaleLowerCase();
	const shown = options.filter( ( option ) =>
		option.label.toLocaleLowerCase().includes( match )
	);

	const toggle = ( item: string, on: boolean ) =>
		onChange(
			on
				? [ ...value.filter( ( other ) => other !== item ), item ]
				: value.filter( ( other ) => other !== item )
		);

	return (
		<fieldset style={ styles.group } disabled={ readOnly }>
			<legend style={ styles.legend }>{ definition.label }</legend>
			{ options.length > FILTER_FROM ? (
				<input
					type="search"
					style={ styles.filter }
					aria-label={ `Filter ${ definition.label ?? 'options' }` }
					placeholder="Filter"
					value={ filter }
					onChange={ ( event ) => setFilter( event.target.value ) }
				/>
			) : null }
			<div style={ styles.options }>
				{ [ ...unknown, ...shown ].map( ( option ) => {
					const optionId = `${ id }-${ option.value }`;
					return (
						<div key={ option.value } style={ styles.option }>
							<input
								id={ optionId }
								type="checkbox"
								checked={ value.includes( option.value ) }
								onChange={ ( event ) =>
									toggle( option.value, event.target.checked )
								}
							/>
							<label htmlFor={ optionId }>
								{ option.label }
								{ 'known' in option
									? ' (not in the list any more: matches nothing)'
									: '' }
							</label>
						</div>
					);
				} ) }
			</div>
			{ state.status === 'loading' ? (
				<p style={ styles.note }>Loading choices…</p>
			) : null }
			{ state.status === 'error' ? (
				<p style={ styles.note }>
					The choices could not be loaded. Reload to try again.
				</p>
			) : null }
			{ definition.help ? (
				<p style={ styles.note }>{ definition.help }</p>
			) : null }
		</fieldset>
	);
}

/**
 * A list prop as Puck's custom field.
 *
 * @param definition A list prop.
 */
export function listField(
	definition: ListProp
): PuckCustomField< readonly string[] > {
	return {
		type: 'custom',
		label: definition.label,
		render: ( { value, onChange, readOnly } ) => (
			<ListField
				definition={ definition }
				value={ Array.isArray( value ) ? value : [] }
				onChange={ onChange }
				readOnly={ readOnly }
			/>
		),
	};
}
