/**
 * WordPress: a list prop as a sidebar field, core's FormTokenField (WordPress's select2-style
 * field): type part of a name, pick it, and it becomes a token.
 *
 * WHY labels as tokens: FormTokenField matches what an editor types against the suggestion
 * strings themselves, so they must be what an editor reads. integrations/schema/options.ts turns
 * them back into values.
 */

import { FormTokenField, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import { useOptions } from '../react/options.ts';
import { chosenOf, valuesOf } from '../schema/options.ts';
import type { ListProp } from '../schema/props.ts';

type Props = {
	definition: ListProp;
	value: readonly string[];
	onChange: ( value: string[] ) => void;
};

/**
 * Tokens for the values chosen, with suggestions from the prop's options.
 *
 * @param props            The prop's definition, its values, and what to call when they change.
 * @param props.definition A list prop.
 * @param props.value      Its values.
 * @param props.onChange   Called with the new values.
 */
export function ListControl( { definition, value, onChange }: Props ) {
	const state = useOptions( definition );
	const options = state.options ?? [];
	const chosen = chosenOf( value, state.options );

	return (
		<>
			<FormTokenField
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				__experimentalExpandOnFocus
				// WHY: a typed name that isn't an option would save a value the API rejects.
				__experimentalValidateInput={ ( label ) =>
					options.some( ( option ) => option.label === label )
				}
				label={ definition.label ?? '' }
				suggestions={ options.map( ( option ) => option.label ) }
				value={ chosen.map( ( item ) =>
					item.known
						? item.label
						: {
								value: item.label,
								status: 'error' as const,
								title: __(
									'Not in the list any more: this matches nothing. Remove it.',
									'ucf-components'
								),
							}
				) }
				onChange={ ( tokens ) =>
					onChange(
						valuesOf(
							tokens.map( ( token ) =>
								typeof token === 'string' ? token : token.value
							),
							options
						)
					)
				}
			/>
			{ state.status === 'loading' ? <Spinner /> : null }
			{ state.status === 'error' ? (
				<p className="components-base-control__help">
					{ __(
						'The choices could not be loaded. Reload the editor to try again.',
						'ucf-components'
					) }
				</p>
			) : null }
			{ definition.help ? (
				<p className="components-base-control__help">
					{ definition.help }
				</p>
			) : null }
		</>
	);
}
