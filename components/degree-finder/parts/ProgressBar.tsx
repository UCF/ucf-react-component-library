interface ProgressBarProps {
	/** The current step, starting at 1. */
	current: number;
	total: number;
}

/**
 * A segmented progress bar, one segment per step. Screen readers hear
 * "Step 2 of 3" rather than the segments themselves.
 *
 * Each segment's fill grows from its right edge, so moving forward
 * sweeps right to left and going back retracts left to right, in step
 * with the cards.
 *
 * @param props         Its props.
 * @param props.current The current step, starting at 1.
 * @param props.total   How many steps.
 */
export default function ProgressBar( { current, total }: ProgressBarProps ) {
	return (
		<div
			className="ucf-c-degree-finder__progress"
			role="progressbar"
			aria-label="Progress"
			aria-valuemin={ 1 }
			aria-valuemax={ total }
			aria-valuenow={ current }
			aria-valuetext={ `Step ${ current } of ${ total }` }
		>
			{ Array.from( { length: total }, ( _, i ) => (
				<span
					key={ i }
					className="ucf-c-degree-finder__progress-segment"
				>
					<span
						className={ `ucf-c-degree-finder__progress-fill${
							i < current
								? ' ucf-c-degree-finder__progress-fill--filled'
								: ''
						}` }
					/>
				</span>
			) ) }
		</div>
	);
}
