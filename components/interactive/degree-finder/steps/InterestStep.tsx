import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import InterestCombobox from '../parts/InterestCombobox.tsx';
import RequestStatus from '../parts/RequestStatus.tsx';
import type { Interest } from '../types.ts';
import type { Request } from '../utils/useRequest.ts';
import { exitDuration } from '../utils/motion.ts';

interface InterestStepProps {
	request: Request< Interest[] >;
	selected: Interest[];
	onChange: Dispatch< SetStateAction< Interest[] > >;
}

/**
 * Choose one or more interests with a typeahead. Each choice
 * shows as a removable chip.
 *
 * @param props          Its props.
 * @param props.request  The interests request.
 * @param props.selected The interests chosen so far.
 * @param props.onChange Updates them.
 */
export default function InterestStep( {
	request,
	selected,
	onChange,
}: InterestStepProps ) {
	const inputRef = useRef< HTMLInputElement >( null );
	// WHY: chips animating out, by slug. They leave the list once the animation ends.
	const [ removing, setRemoving ] = useState< string[] >( [] );

	if ( request.status !== 'success' ) {
		return (
			<RequestStatus
				request={ request }
				loadingText="Loading interests…"
				errorText="We couldn’t load interests."
			/>
		);
	}

	function remove( interest: Interest ) {
		// A11Y: the chip's button is going away, so give focus somewhere useful.
		inputRef.current?.focus();

		const drop = () =>
			onChange( ( current ) =>
				current.filter( ( item ) => item.slug !== interest.slug )
			);
		const delay = exitDuration();

		if ( ! delay ) {
			drop();
			return;
		}

		setRemoving( ( slugs ) => [ ...slugs, interest.slug ] );
		setTimeout( () => {
			drop();
			setRemoving( ( slugs ) =>
				slugs.filter( ( slug ) => slug !== interest.slug )
			);
		}, delay );
	}

	return (
		<div className="ucf-c-degree-finder__interests">
			<div className="ucf-c-degree-finder__combobox-layer ucf-c-degree-finder__motion">
				<InterestCombobox
					ref={ inputRef }
					options={ request.data }
					selected={ selected }
					onAdd={ ( interest ) =>
						onChange( ( current ) => [ ...current, interest ] )
					}
				/>
			</div>
			{ selected.length > 0 && (
				<ul
					className="ucf-c-degree-finder__chips"
					aria-label="Selected interests"
				>
					{ selected.map( ( interest ) => {
						const isLeaving = removing.includes( interest.slug );
						return (
							<li
								key={ interest.slug }
								className={ `ucf-c-degree-finder__chip ucf-c-degree-finder__motion${
									isLeaving
										? ' ucf-c-degree-finder__motion--exit'
										: ''
								}` }
							>
								<span>{ interest.name }</span>
								<button
									type="button"
									className="ucf-c-degree-finder__chip-remove"
									aria-label={ `Remove ${ interest.name }` }
									disabled={ isLeaving }
									onClick={ () => remove( interest ) }
								>
									<span aria-hidden="true">×</span>
								</button>
							</li>
						);
					} ) }
				</ul>
			) }
		</div>
	);
}
