/**
 * Puck: the Section Nav's links as a field that reads the page: each link's text and address,
 * with buttons to move, remove and add one, and "Update from sections".
 *
 * While it has no links, it takes one for each Section with an HTML anchor, as WordPress's
 * edit.tsx does. Once it has links, they are the editor's; "Update from sections" brings them up
 * to date, keeping renamed text and links elsewhere (utils/links.ts).
 * WHY a field of its own, not Puck's array field: that field takes no button of ours.
 * WHY the site lends the hook that reads the page (withPageSections() in config.tsx): this
 * library's Puck configs don't import Puck.
 * WHY styled inline: Puck's editor loads no stylesheet of ours.
 */
import { useEffect, useId, type CSSProperties } from 'react';

import type { Link } from '@/integrations/schema/props';
import type { PuckCustomField } from '@/integrations/puck/types';
import { updateLinks } from '../../utils/links.ts';

const styles = {
	group: { border: 0, margin: 0, minWidth: 0, padding: 0 },
	legend: { fontWeight: 600, marginBottom: 8, padding: 0 },
	link: {
		border: '1px solid #ddd',
		borderRadius: 4,
		marginBottom: 8,
		padding: 8,
	},
	label: { display: 'block', fontSize: 12, marginBottom: 2 },
	input: { boxSizing: 'border-box', marginBottom: 6, width: '100%' },
	row: { display: 'flex', flexWrap: 'wrap', gap: 6 },
	note: { fontSize: 12, margin: '4px 0 8px' },
} satisfies Record< string, CSSProperties >;

type Props = {
	label?: string;
	value: readonly Link[];
	onChange: ( value: Link[] ) => void;
	readOnly?: boolean;
	/** The page's Section links, read through the site's hook. */
	useSections: () => Link[];
};

/**
 * The links, each editable, movable and removable, a button to add one, and the update from
 * the page's Sections.
 *
 * @param props             The field's links and what to call when they change.
 * @param props.label       The field's label.
 * @param props.value       Its links.
 * @param props.onChange    Called with the new links.
 * @param props.readOnly    Whether Puck has locked the field.
 * @param props.useSections Reads the page's Section links.
 */
export function LinksField( {
	label,
	value,
	onChange,
	readOnly,
	useSections,
}: Props ) {
	const id = useId();
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

	const change = ( index: number, link: Partial< Link > ) =>
		onChange(
			links.map( ( item, at ) =>
				at === index ? { ...item, ...link } : item
			)
		);
	const move = ( index: number, by: -1 | 1 ) => {
		const next = [ ...links ];
		const [ link ] = next.splice( index, 1 );
		next.splice( index + by, 0, link as Link );
		onChange( next );
	};

	return (
		<fieldset style={ styles.group } disabled={ readOnly }>
			<legend style={ styles.legend }>{ label }</legend>
			<p style={ styles.note }>
				{ sections.length > 0
					? 'Updating adds Sections given an anchor since, and drops those that lost one. Renamed text and links elsewhere stay.'
					: 'No Section on this page has an HTML anchor yet.' }
			</p>
			<button
				type="button"
				disabled={ sections.length === 0 }
				onClick={ () => onChange( updateLinks( links, sections ) ) }
			>
				Update from sections
			</button>
			<div style={ { marginTop: 12 } }>
				{ links.map( ( link, index ) => (
					// WHY the index as key: two links may share an address while being edited.
					<div key={ index } style={ styles.link }>
						<label
							style={ styles.label }
							htmlFor={ `${ id }-${ index }-label` }
						>
							Link { index + 1 }: text
						</label>
						<input
							id={ `${ id }-${ index }-label` }
							style={ styles.input }
							value={ link.label }
							onChange={ ( event ) =>
								change( index, { label: event.target.value } )
							}
						/>
						<label
							style={ styles.label }
							htmlFor={ `${ id }-${ index }-href` }
						>
							Address (#anchor for a section on this page)
						</label>
						<input
							id={ `${ id }-${ index }-href` }
							style={ styles.input }
							value={ link.href }
							onChange={ ( event ) =>
								change( index, { href: event.target.value } )
							}
						/>
						<div style={ styles.row }>
							<button
								type="button"
								disabled={ index === 0 }
								onClick={ () => move( index, -1 ) }
							>
								Move up
							</button>
							<button
								type="button"
								disabled={ index === links.length - 1 }
								onClick={ () => move( index, 1 ) }
							>
								Move down
							</button>
							<button
								type="button"
								onClick={ () =>
									onChange(
										links.filter(
											( _, at ) => at !== index
										)
									)
								}
							>
								Remove
							</button>
						</div>
					</div>
				) ) }
			</div>
			<button
				type="button"
				onClick={ () =>
					onChange( [ ...links, { label: '', href: '' } ] )
				}
			>
				Add link
			</button>
		</fieldset>
	);
}

/**
 * The field for Puck's config.
 *
 * @param label       The field's label.
 * @param useSections Reads the page's Section links.
 */
export const linksField = (
	label: string | undefined,
	useSections: () => Link[]
): PuckCustomField< Link[] > => ( {
	type: 'custom',
	label,
	render: ( { field, value, onChange, readOnly } ) => (
		<LinksField
			label={ field.label }
			value={ value }
			onChange={ onChange }
			readOnly={ readOnly }
			useSections={ useSections }
		/>
	),
} );
