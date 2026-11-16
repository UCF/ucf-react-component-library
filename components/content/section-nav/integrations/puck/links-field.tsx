/**
 * CONTEXT: the Puck links field: an "Update from sections" button over Puck's array field.
 * Empty, it fills itself from the page's Sections, as in WordPress.
 *
 * WHY a custom field: Puck's array field can't hold our button.
 */
import { useEffect } from 'react';

import type { Link } from '@/integrations/schema/props';
import type {
	PuckArrayField,
	PuckControls,
	PuckCustomField,
} from '@/integrations/puck/types';
import { updateLinks } from '../../utils/links.ts';

type Props = {
	label: string;
	field: PuckArrayField< Link >;
	value: readonly Link[];
	onChange: ( value: Link[] ) => void;
	readOnly?: boolean;
	useSections: () => Link[];
	puck: PuckControls;
};

/**
 * The links field.
 *
 * @param props             Props.
 * @param props.label       Field label.
 * @param props.field       The config's array field for the links.
 * @param props.value       The links.
 * @param props.onChange    Called with new links.
 * @param props.readOnly    Whether Puck has locked the field.
 * @param props.useSections Hook returning the page's Section links.
 * @param props.puck        Puck's controls.
 */
export function LinksField( {
	label,
	field,
	value,
	onChange,
	readOnly,
	useSections,
	puck,
}: Props ) {
	const { AutoField, FieldLabel, Button } = puck;
	const sections = useSections();
	const links = [ ...( value ?? [] ) ];
	const empty = links.length === 0;
	const sectionKey = JSON.stringify( sections );

	useEffect( () => {
		if ( empty && sections.length > 0 && ! readOnly ) {
			onChange( sections );
		}
		// WHY JSON: the hook may return a new array each render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ empty, sectionKey, readOnly ] );

	// WHY no label: FieldLabel draws it above the button.
	const { label: _label, ...arrayField } = field;

	return (
		<FieldLabel label={ label } el="div" readOnly={ readOnly }>
			<p>
				{ sections.length > 0
					? 'Updating adds Sections given an anchor since, and drops those that lost one. Renamed text and links elsewhere stay.'
					: 'No Section on this page has an HTML anchor yet.' }
			</p>
			<Button
				type="button"
				variant="secondary"
				fullWidth
				disabled={ readOnly || sections.length === 0 }
				onClick={ () => onChange( updateLinks( links, sections ) ) }
			>
				Update from sections
			</Button>
			<AutoField
				field={ arrayField }
				value={ links }
				onChange={ onChange }
				readOnly={ readOnly }
			/>
		</FieldLabel>
	);
}

/**
 * The links field as a Puck custom field.
 *
 * @param field       The config's array field for the links.
 * @param useSections Hook returning the page's Section links.
 * @param puck        Puck's controls.
 */
export const linksField = (
	field: PuckArrayField< Link >,
	useSections: () => Link[],
	puck: PuckControls
): PuckCustomField< Link[] > => ( {
	type: 'custom',
	label: field.label,
	render: ( { name, value, onChange, readOnly } ) => (
		<LinksField
			label={ field.label ?? name }
			field={ field }
			value={ value }
			onChange={ onChange }
			readOnly={ readOnly }
			useSections={ useSections }
			puck={ puck }
		/>
	),
} );
