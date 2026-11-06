import type { Degree } from '../types.ts';

interface DegreeCardProps {
	degree: Degree;
}

/**
 * One result on the last step. It takes the whole degree record so
 * that adding a field later, such as the college or a description,
 * means changing only this component.
 *
 * @param props        Its props.
 * @param props.degree The degree to show.
 */
export default function DegreeCard( { degree }: DegreeCardProps ) {
	return (
		<a
			className="ucf-c-degree-finder__card ucf-c-degree-finder__degree-card"
			href={ degree.url }
		>
			<span className="ucf-c-degree-finder__degree-title">
				{ degree.title }
			</span>
		</a>
	);
}
