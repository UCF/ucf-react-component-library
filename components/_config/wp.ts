/**
 * CONTEXT: shared by the WordPress adapters' edit.tsx and save.tsx.
 */

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
