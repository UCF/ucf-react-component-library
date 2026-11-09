import DegreeCard from '../parts/DegreeCard.tsx';
import RequestStatus from '../parts/RequestStatus.tsx';
import type { Degree } from '../types.ts';
import type { Request } from '../utils/useRequest.ts';
import { countLabel } from '../utils/countLabel.ts';
import { stagger } from '../utils/motion.ts';

interface ResultsStepProps {
	request: Request< Degree[] >;
}

/**
 * Last step: every degree that matches the chosen type and interests.
 *
 * @param props         Its props.
 * @param props.request The degrees request.
 */
export default function ResultsStep( { request }: ResultsStepProps ) {
	if ( request.status !== 'success' ) {
		return (
			<RequestStatus
				request={ request }
				loadingText="Finding programs…"
				errorText="We couldn’t load programs."
			/>
		);
	}

	const degrees = request.data;

	if ( ! degrees.length ) {
		return (
			<p className="ucf-c-degree-finder__status ucf-c-degree-finder__motion">
				No programs match those interests. Try going back and choosing
				others.
			</p>
		);
	}

	return (
		<>
			<p className="ucf-c-degree-finder__result-count ucf-c-degree-finder__motion">
				{ countLabel( degrees.length ) } found
			</p>
			<ul className="ucf-c-degree-finder__degree-list">
				{ degrees.map( ( degree, i ) => (
					<li
						key={ degree.id }
						className="ucf-c-degree-finder__motion"
						style={ stagger( i ) }
					>
						<DegreeCard degree={ degree } />
					</li>
				) ) }
			</ul>
		</>
	);
}
