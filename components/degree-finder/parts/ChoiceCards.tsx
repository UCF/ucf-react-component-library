import { useId } from 'react';
import { stagger } from '../utils/motion.ts';

export interface Choice {
	slug: string;
	title: string;
	detail?: string;
}

interface ChoiceCardsProps {
	choices: Choice[];
	selected: string | null;
	onSelect: ( slug: string ) => void;
	/** The id of the heading that names this group. */
	labelledBy: string;
	size?: 'large' | 'small';
}

/**
 * A single-choice group of cards. The cards are native radio buttons,
 * so arrow keys, Tab and screen readers behave as a radio group
 * without extra code.
 *
 * @param props            Its props.
 * @param props.choices    The cards.
 * @param props.selected   The chosen slug, or null.
 * @param props.onSelect   Called with a slug when one is chosen.
 * @param props.labelledBy The id of the heading that names the group.
 * @param props.size       Large for the first step's few cards.
 */
export default function ChoiceCards( {
	choices,
	selected,
	onSelect,
	labelledBy,
	size = 'small',
}: ChoiceCardsProps ) {
	const name = useId();

	return (
		<div
			role="radiogroup"
			aria-labelledby={ labelledBy }
			className={ `ucf-c-degree-finder__choices ucf-c-degree-finder__choices--${ size }` }
		>
			{ choices.map( ( choice, i ) => (
				<label
					key={ choice.slug }
					htmlFor={ `${ name }-${ choice.slug }` }
					className="ucf-c-degree-finder__option ucf-c-degree-finder__motion"
					style={ stagger( i ) }
				>
					<input
						type="radio"
						id={ `${ name }-${ choice.slug }` }
						className="ucf-c-degree-finder__visually-hidden"
						name={ name }
						value={ choice.slug }
						checked={ selected === choice.slug }
						onChange={ () => onSelect( choice.slug ) }
					/>
					<span className="ucf-c-degree-finder__card ucf-c-degree-finder__choice-card">
						<span className="ucf-c-degree-finder__choice-title">
							{ choice.title }
						</span>
						{ choice.detail && (
							<span className="ucf-c-degree-finder__choice-detail">
								{ choice.detail }
							</span>
						) }
					</span>
				</label>
			) ) }
		</div>
	);
}
