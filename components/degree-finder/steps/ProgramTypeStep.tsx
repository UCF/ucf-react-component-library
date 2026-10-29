import ChoiceCards from '../parts/ChoiceCards.tsx';
import type { ProgramTypeOption } from '../types.ts';
import { countLabel } from '../utils/countLabel.ts';

interface ProgramTypeStepProps {
	options: readonly ProgramTypeOption[];
	/** Program counts by slug, once loaded. */
	counts: Map< string, number > | null;
	selected: string | null;
	onSelect: ( slug: string ) => void;
	headingId: string;
}

/**
 * Step 1: the degree types on offer, e.g. Bachelors, Masters and
 * Doctorates. The cards don't wait for the counts, so the step is
 * usable even if the count request is slow or fails.
 *
 * @param props           Its props.
 * @param props.options   The types on offer.
 * @param props.counts    Program counts by slug, once loaded.
 * @param props.selected  The chosen slug, or null.
 * @param props.onSelect  Called with a slug when one is chosen.
 * @param props.headingId The id of the step's heading.
 */
export default function ProgramTypeStep( {
	options,
	counts,
	selected,
	onSelect,
	headingId,
}: ProgramTypeStepProps ) {
	return (
		<ChoiceCards
			size="large"
			labelledBy={ headingId }
			choices={ options.map( ( option ) => {
				const count = counts?.get( option.slug );
				return {
					slug: option.slug,
					title: option.label,
					detail:
						count === undefined ? undefined : countLabel( count ),
				};
			} ) }
			selected={ selected }
			onSelect={ onSelect }
		/>
	);
}
