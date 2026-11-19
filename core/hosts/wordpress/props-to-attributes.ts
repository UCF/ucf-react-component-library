/**
 * Step 6 · WordPress · every component · props → block attributes.
 *
 * For edit, save and the test that checks block.json.
 */

import { inHost } from '../read-props.ts';
import type { PropDefinition, PropDefinitions } from '../prop-definitions.ts';

/**
 * A block's attributes, without the ones WordPress adds to every block: only those its block.json
 * declares, which are the component's own props.
 * FIX: spreading every attribute after useBlockProps() replaced its className (the saved block
 * lost `wp-block-*`) and put `anchor` in the markup.
 *
 * @param attributes          The block's attributes.
 * @param metadata            Its block.json.
 * @param metadata.attributes The attributes block.json declares.
 */
export function ownAttributes< Props >(
	attributes: Record< string, unknown >,
	metadata: { attributes: Record< string, unknown > }
): Props {
	return Object.fromEntries(
		Object.entries( attributes ).filter(
			( [ key ] ) => key in metadata.attributes
		)
	) as Props;
}

/**
 * Prop definitions as block.json's `attributes`: each prop's type and default, for every prop
 * WordPress has.
 * WHY block.json is still written by hand: PHP registers the block from it before any script runs,
 * so it must be plain JSON on disk.
 *
 * @param definitions A component's prop definitions.
 */
export function blockAttributes( definitions: PropDefinitions ) {
	return Object.fromEntries(
		Object.entries( definitions )
			.filter( ( [ , definition ] ) => inHost( definition, 'wp' ) )
			.map( ( [ key, definition ] ) => [
				key,
				attributeOf( definition ),
			] )
	);
}

/**
 * A prop's block attribute type: lists and links are arrays, numbers numbers, the rest strings.
 *
 * @param definition A prop.
 */
function attributeOf( definition: PropDefinition ) {
	const { default: value } = definition;
	switch ( definition.type ) {
		case 'list':
			return { type: 'array', items: { type: 'string' }, default: value };
		case 'links':
			return {
				type: 'array',
				items: {
					type: 'object',
					properties: {
						label: { type: 'string' },
						href: { type: 'string' },
					},
				},
				default: value,
			};
		case 'number':
			return { type: 'number', default: value };
		default:
			return { type: 'string', default: value };
	}
}
