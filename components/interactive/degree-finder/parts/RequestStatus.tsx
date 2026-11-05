import type { Request } from '../utils/useRequest.ts';

interface RequestStatusProps {
	request: Request< unknown >;
	loadingText: string;
	errorText: string;
}

/**
 * Shows loading and error states for a request made with useRequest.
 * Renders nothing once the request succeeds.
 *
 * @param props             Its props.
 * @param props.request     A request from useRequest.
 * @param props.loadingText Shown while loading.
 * @param props.errorText   Shown when it fails.
 */
export default function RequestStatus( {
	request,
	loadingText,
	errorText,
}: RequestStatusProps ) {
	if ( request.status === 'loading' ) {
		return (
			<p
				className="ucf-c-degree-finder__status ucf-c-degree-finder__motion"
				role="status"
			>
				{ loadingText }
			</p>
		);
	}

	if ( request.status === 'error' ) {
		return (
			<div
				className="ucf-c-degree-finder__status ucf-c-degree-finder__status--error ucf-c-degree-finder__motion"
				role="alert"
			>
				<p>{ errorText }</p>
				<button
					type="button"
					className="ucf-c-degree-finder__button"
					onClick={ request.retry }
				>
					Try again
				</button>
			</div>
		);
	}

	return null;
}
