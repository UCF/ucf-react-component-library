/**
 * The Heading as our blocks edit it: the primitive itself, with a plain text field in it. A
 * block's edit() renders this where its save() renders the plain primitive.
 *
 * WHY no block of its own: WordPress editors use `core/heading`.
 */
import { PlainText as UntypedPlainText } from '@wordpress/block-editor';
import type { ComponentType } from 'react';

import Heading, { type HeadingLevel } from '../../Heading.tsx';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

export type HeadingEditProps = {
	content: string;
	level?: HeadingLevel;
	onChange: ( content: string ) => void;
	/** Names the field for screen readers and shows when it's empty. */
	label: string;
};

/**
 * @param props          The heading and its setter.
 * @param props.content  The text.
 * @param props.level    Its level.
 * @param props.onChange Updates the text.
 * @param props.label    What the field is for.
 */
export default function HeadingEdit( {
	content,
	level,
	onChange,
	label,
}: HeadingEditProps ) {
	return (
		<Heading
			level={ level }
			content={
				<PlainText
					value={ content }
					onChange={ onChange }
					placeholder={ label }
					aria-label={ label }
				/>
			}
		/>
	);
}
