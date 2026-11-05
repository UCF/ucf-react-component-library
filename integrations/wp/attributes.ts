/**
 * CONTEXT: a component's props as WordPress block attributes, for the WordPress adapters'
 * edit.tsx and save.tsx, and for the test that checks block.json.
 */
import { inHost, type PropDefinitions } from '../schema/props.ts';

/**
 * A block's attributes, without the ones WordPress adds to every block: only those its
 * block.json declares, which are the component's own props.
 *
 * FIX: edit and save spread every attribute onto the component after useBlockProps(). An
 * editor's "Additional CSS class(es)" (`className`) then replaced the className WordPress had
 * merged, so the saved block lost its `wp-block-*` class and, in the editor, the classes it
 * is selected by. `anchor` reached the root element as a stray HTML attribute. useBlockProps()
 * already turns WordPress's own attributes into the right class, id and style.
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
 *
 * WHY block.json is still written by hand: PHP registers the block from it before any
 * script runs, so it must be plain JSON on disk. parity.test.tsx fails while its attributes
 * differ from these.
 *
 * @param definitions A component's prop definitions.
 */
export function blockAttributes( definitions: PropDefinitions ) {
	return Object.fromEntries(
		Object.entries( definitions )
			.filter( ( [ , definition ] ) => inHost( definition, 'wp' ) )
			.map( ( [ key, definition ] ) => [
				key,
				{
					type: definition.type === 'number' ? 'number' : 'string',
					default: definition.default,
				},
			] )
	);
}
