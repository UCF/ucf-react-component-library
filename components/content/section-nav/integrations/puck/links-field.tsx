/**
 * Puck: the Section Nav's links as a field that reads the page: Puck's own array field for the
 * links, under "Update from sections".
 *
 * While it has no links, it takes one for each Section with an HTML anchor, as WordPress's
 * edit.tsx does. Once it has links, they are the editor's; "Update from sections" brings them up
 * to date, keeping renamed text and links elsewhere (utils/links.ts).
 * WHY a custom field around Puck's array field: an array field takes no button of ours.
 * WHY the site lends Puck's controls and the hook that reads the page (withPageSections() in
 * config.tsx): this library's Puck configs don't import Puck.
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
	/** The links' own fields: the config's array field. */
	field: PuckArrayField< Link >;
	value: readonly Link[];
	onChange: ( value: Link[] ) => void;
	readOnly?: boolean;
	/** The page's Section links, read through the site's hook. */
	useSections: () => Link[];
	puck: PuckControls;
};

/**
 * The update from the page's Sections, and the links in Puck's array field.
 *
 * @param props             The field's links and what to call when they change.
 * @param props.label       The field's label.
 * @param props.field       The array field that draws the links.
 * @param props.value       Its links.
 * @param props.onChange    Called with the new links.
 * @param props.readOnly    Whether Puck has locked the field.
 * @param props.useSections Reads the page's Section links.
 * @param props.puck        Puck's controls, from the site.
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
		// WHY by its JSON: the site's hook may build a new array on every render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ empty, sectionKey, readOnly ] );

	// WHY without its label: FieldLabel draws it, over the button too.
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
 * The field for Puck's config.
 *
 * @param field       The config's array field for the links.
 * @param useSections Reads the page's Section links.
 * @param puck        Puck's controls, from the site.
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
