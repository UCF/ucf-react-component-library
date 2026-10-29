import {
	forwardRef,
	useEffect,
	useId,
	useRef,
	useState,
	type KeyboardEvent,
} from 'react';
import type { Interest } from '../types.ts';

interface InterestComboboxProps {
	options: Interest[];
	selected: Interest[];
	onAdd: ( interest: Interest ) => void;
}

/**
 * A typeahead for choosing interests, following the ARIA combobox
 * pattern. The full list is already loaded, so filtering happens in
 * the browser. Chosen interests drop out of the list.
 *
 * @param props          Its props.
 * @param props.options  Every interest for the chosen type.
 * @param props.selected The interests already chosen.
 * @param props.onAdd    Called with an interest when one is picked.
 */
const InterestCombobox = forwardRef< HTMLInputElement, InterestComboboxProps >(
	function Combobox( { options, selected, onAdd }, inputRef ) {
		const id = useId();
		const listId = `${ id }-list`;
		const listRef = useRef< HTMLUListElement >( null );
		const [ query, setQuery ] = useState( '' );
		const [ open, setOpen ] = useState( false );
		const [ active, setActive ] = useState( -1 );
		// A11Y: tells screen-reader users a pick worked, since the list closes.
		const [ announcement, setAnnouncement ] = useState( '' );

		const chosen = new Set( selected.map( ( interest ) => interest.slug ) );
		const needle = query.trim().toLowerCase();
		const matches = options.filter(
			( option ) =>
				! chosen.has( option.slug ) &&
				option.name.toLowerCase().includes( needle )
		);
		const activeOption = open ? matches[ active ] : undefined;

		// A11Y: keep the highlighted option in view while arrowing through a long list.
		useEffect( () => {
			listRef.current?.children[ active ]?.scrollIntoView?.( {
				block: 'nearest',
			} );
		}, [ active ] );

		// WHY: close the list after each pick, so the new chip below is easy to
		// spot. Clicking, typing or pressing the down arrow opens it again.
		function choose( option: Interest ) {
			onAdd( option );
			setQuery( '' );
			setActive( -1 );
			setOpen( false );
			setAnnouncement( `${ option.name } added.` );
		}

		function openList() {
			setOpen( true );
			setAnnouncement( '' );
		}

		function onKeyDown( event: KeyboardEvent< HTMLInputElement > ) {
			switch ( event.key ) {
				case 'ArrowDown':
					event.preventDefault();
					openList();
					setActive( ( i ) => Math.min( i + 1, matches.length - 1 ) );
					break;
				case 'ArrowUp':
					event.preventDefault();
					setActive( ( i ) => Math.max( i - 1, 0 ) );
					break;
				case 'Enter':
					if ( activeOption ) {
						event.preventDefault();
						choose( activeOption );
					}
					break;
				case 'Escape':
					if ( open ) {
						setOpen( false );
						setActive( -1 );
					} else {
						setQuery( '' );
					}
					break;
			}
		}

		return (
			<div className="ucf-c-degree-finder__combobox">
				<label
					htmlFor={ `${ id }-input` }
					className="ucf-c-degree-finder__label"
				>
					Search interests
				</label>
				<input
					ref={ inputRef }
					id={ `${ id }-input` }
					className="ucf-c-degree-finder__input"
					type="text"
					role="combobox"
					autoComplete="off"
					aria-autocomplete="list"
					aria-expanded={ open }
					aria-controls={ listId }
					aria-activedescendant={
						activeOption ? `${ id }-option-${ active }` : undefined
					}
					placeholder="Start typing, e.g. biology"
					value={ query }
					onChange={ ( event ) => {
						setQuery( event.target.value );
						openList();
						setActive( -1 );
					} }
					onFocus={ openList }
					// WHY: focus stays in the input after a pick, so a click must reopen the list.
					onClick={ openList }
					onBlur={ () => {
						setOpen( false );
						setActive( -1 );
					} }
					onKeyDown={ onKeyDown }
				/>
				<ul
					ref={ listRef }
					id={ listId }
					role="listbox"
					aria-label="Interests"
					className="ucf-c-degree-finder__listbox"
					hidden={ ! open }
				>
					{ matches.map( ( option, i ) => (
						// A11Y: no key handler here on purpose. In the ARIA combobox pattern the
						// options never take focus; the input handles the keys and points at the
						// highlighted option with aria-activedescendant.
						// eslint-disable-next-line jsx-a11y/click-events-have-key-events
						<li
							key={ option.slug }
							id={ `${ id }-option-${ i }` }
							role="option"
							aria-selected={ i === active }
							className="ucf-c-degree-finder__listbox-option"
							// WHY: keep focus in the input so the list stays open for the next pick.
							onMouseDown={ ( event ) => event.preventDefault() }
							onClick={ () => choose( option ) }
						>
							{ option.name }
						</li>
					) ) }
					{ ! matches.length && (
						<li className="ucf-c-degree-finder__listbox-empty">
							No matching interests
						</li>
					) }
				</ul>
				<p
					className="ucf-c-degree-finder__visually-hidden"
					aria-live="polite"
				>
					{ open
						? `${ matches.length } ${ matches.length === 1 ? 'interest' : 'interests' } available.`
						: announcement }
				</p>
			</div>
		);
	}
);

export default InterestCombobox;
