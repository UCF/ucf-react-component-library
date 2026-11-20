/**
 * Step 6 · Puck · every component · props → Puck fields (puckFields).
 *
 * A content component gets them through puckConfig() (config.tsx); a live or interactive one calls
 * puckFields() in its own Puck config.
 */

import { inHost, type PropsIn } from '../read-props.ts';
import type {
	Link,
	PropDefinition,
	PropDefinitions,
	Tile,
} from '../prop-definitions.ts';
import { listField } from './list-field.tsx';
import type {
	PuckArrayField,
	PuckCustomField,
	PuckFieldFor,
	PuckScalarField,
} from './types.ts';

/**
 * Prop definitions as Puck fields: radio buttons or a select for a choice, checkboxes for a list,
 * Puck's own array field for links and tiles, a text field otherwise, for every prop Puck has.
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
					ReturnType< typeof fieldOf >,
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
):
	| PuckScalarField
	| PuckCustomField< readonly string[] >
	| PuckArrayField< Link >
	| PuckArrayField< Tile > {
	if ( definition.type === 'list' ) {
		return listField( definition );
	}
	if ( definition.type === 'links' ) {
		return {
			type: 'array',
			label: definition.label,
			arrayFields: {
				label: { type: 'text', label: 'Text' },
				href: { type: 'text', label: 'Anchor (#section)' },
			},
			defaultItemProps: { label: '', href: '' },
			getItemSummary: ( link: Link ) =>
				link.label || link.href || 'New link',
		};
	}
	if ( definition.type === 'tiles' ) {
		return {
			type: 'array',
			label: definition.label,
			arrayFields: {
				label: { type: 'text', label: 'Text' },
				description: { type: 'textarea', label: 'Description' },
				// WHY: a bare `www.ucf.edu` links relative to the page, and breaks.
				href: {
					type: 'text',
					label: 'Address (/path on this site, or https://…)',
					placeholder: '/admissions/ or https://',
				},
			},
			defaultItemProps: { label: '', description: '', href: '' },
			getItemSummary: ( tile: Tile ) =>
				tile.label || tile.href || 'New link',
			...( definition.max && { max: definition.max } ),
		};
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
