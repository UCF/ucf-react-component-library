/**
 * The Button as our blocks edit it, with core Button's editing tools: the label typed in place,
 * and WordPress's link picker (`LinkControl`, core Button's own) for the link and new tab,
 * shown while the Button has focus. A block's edit() renders this where its save() renders the
 * plain Button.
 *
 * WHY no block of its own: WordPress editors use `core/button`.
 */
import {
	LinkControl,
	PlainText as UntypedPlainText,
} from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';
import { useState, type ComponentType, type FocusEvent } from 'react';

import Button, { type ButtonProps } from '../../Button.tsx';

// UPSTREAM: block-editor's type files are generated from JSDoc, and PlainText's has no props.
const PlainText = UntypedPlainText as ComponentType< {
	value: string;
	onChange: ( value: string ) => void;
	placeholder?: string;
	'aria-label'?: string;
} >;

export type ButtonValue = {
	text: string;
	url: string;
	linkTarget: string;
};

export type ButtonEditProps = ButtonValue & {
	variant?: ButtonProps[ 'variant' ];
	/** Receives only what changed. */
	onChange: ( change: Partial< ButtonValue > ) => void;
	/** Names the label field for screen readers, and shows while it is empty. */
	label: string;
};

/**
 * @param props            The Button's value and how to change it.
 * @param props.text       The label.
 * @param props.url        The link.
 * @param props.linkTarget `_blank` for a new tab.
 * @param props.variant    Fill or Outline.
 * @param props.onChange   Receives what changed.
 * @param props.label      What the Button is for, e.g. "Primary button".
 */
export default function ButtonEdit( {
	text,
	url,
	linkTarget,
	variant,
	onChange,
	label,
}: ButtonEditProps ) {
	const [ anchor, setAnchor ] = useState< HTMLElement | null >( null );
	const [ editing, setEditing ] = useState( false );

	// WHY close only when focus leaves the Button and its popover: moving between the label
	// and the link picker would otherwise close it.
	const onBlur = ( event: FocusEvent< HTMLElement > ) => {
		const next = event.relatedTarget as Node | null;
		if ( ! next || ! event.currentTarget.contains( next ) ) {
			setEditing( false );
		}
	};

	return (
		<span
			ref={ setAnchor }
			onFocus={ () => setEditing( true ) }
			onBlur={ onBlur }
			style={ { display: 'inline-block' } }
		>
			{ /* WHY no url here: a link around a text field would follow the link on click. */ }
			<Button
				variant={ variant }
				text={
					// SYNC: `.ucf-c-button__field` in plugins/shared/editor.css sizes the
					// field to this text.
					<span
						className="ucf-c-button__field"
						data-value={ text || label }
					>
						<PlainText
							value={ text }
							onChange={ ( value ) =>
								onChange( { text: value } )
							}
							placeholder={ label }
							aria-label={ label }
						/>
					</span>
				}
			/>
			{ editing && anchor ? (
				<Popover
					anchor={ anchor }
					placement="bottom"
					focusOnMount={ false }
					onClose={ () => setEditing( false ) }
				>
					<LinkControl
						value={ {
							url,
							opensInNewTab: linkTarget === '_blank',
						} }
						// UPSTREAM: LinkControl may send `url: null` when the link is cleared.
						onChange={ ( next: {
							url?: string | null;
							opensInNewTab?: boolean;
						} ) =>
							onChange( {
								url: next.url ?? '',
								linkTarget: next.opensInNewTab ? '_blank' : '',
							} )
						}
						onRemove={ () =>
							onChange( { url: '', linkTarget: '' } )
						}
					/>
				</Popover>
			) : null }
		</span>
	);
}
