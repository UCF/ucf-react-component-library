'use client';
/**
 * CONTEXT: the Degree Finder, an interactive component. A visitor chooses a degree type, then
 * one or more interests, and gets the matching degrees. On a page that already implies the
 * type (a masters page), `programType` skips the first step.
 *
 * Ported from Jim's `@ucfweb/degree-picker` in UCF-Degree-Search-Plugin (branch `wp-block`,
 * src/components/DegreePicker, commit 43b23e3), then renamed to this repo's naming convention
 * (docs/architecture.md, "Naming"). This copy is now the source; a later change of his is
 * merged by hand. To find his version of a file:
 *
 *   here                        his
 *   DegreeFinder.tsx            src/DegreePicker.tsx
 *   parts/                      src/components/
 *   client.ts                   src/data/client.ts
 *   utils/useRequest.ts         src/data/useRequest.ts
 *   style.css                   src/styles.css
 *   `ucf-c-degree-finder`       `ucf-degree-picker` (CSS classes)
 *   `--udf-*`                   `--udp-*` (CSS properties)
 *
 * Also changed: tagged comments, Vitest, and style.css reading `--ucf-*` tokens.
 *
 * An interactive component may hold state and fetch data, because no host saves its HTML.
 * WordPress mounts it from view.tsx into the container render.php writes; Next, Puck and other
 * React hosts render it directly. The `'use client'` above is what Next needs.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Presence from './parts/Presence.tsx';
import ProgressBar from './parts/ProgressBar.tsx';
import { createClient } from './client.ts';
import { useRequest } from './utils/useRequest.ts';
import { DEFAULTS } from './defaults.ts';
import InterestStep from './steps/InterestStep.tsx';
import ProgramTypeStep from './steps/ProgramTypeStep.tsx';
import ResultsStep from './steps/ResultsStep.tsx';
import type { DegreeClient, Interest, ProgramTypeOption } from './types.ts';
import { exitDuration } from './utils/motion.ts';
import { programTypeCounts } from './utils/programTypeCounts.ts';
import { buildSearchUrl } from './utils/searchUrl.ts';

export interface DegreeFinderProps {
	/** The WordPress REST API root that serves degree data. */
	apiRoot?: string;
	/** The degree search page that "Explore our Programs" links to. */
	searchUrl?: string;
	/** The choices on the first step. Defaults to Bachelors, Masters and Doctorates. */
	programTypes?: readonly ProgramTypeOption[];
	/**
	 * A program type slug, such as "master", when the page already
	 * answers the first question. The finder then skips that step.
	 */
	programType?: string;
	/** Replaces the data client, e.g. with sample data in a preview or story. */
	client?: DegreeClient;
}

type StepKey = 'programType' | 'interests' | 'results';

/**
 * A degree finder: degree type, then interests, then the matching
 * degrees. When the page already knows the degree type, pass it as
 * `programType` and the finder starts at interests.
 *
 * Plain React with no WordPress dependencies, so the same component
 * runs in the block editor, on the public page and in Puck.
 *
 * @param props              Its props.
 * @param props.apiRoot      The REST API root. Ignored when client is passed.
 * @param props.searchUrl    The degree search page.
 * @param props.programTypes The first step's choices.
 * @param props.programType  A preset type, which skips the first step.
 * @param props.client       Replaces the data client.
 */
export default function DegreeFinder( {
	apiRoot = DEFAULTS.apiRoot,
	searchUrl = DEFAULTS.searchUrl,
	programTypes = DEFAULTS.programTypes,
	programType: presetType,
	client: clientProp,
}: DegreeFinderProps ) {
	const client = useMemo(
		() => clientProp ?? createClient( { apiRoot } ),
		[ clientProp, apiRoot ]
	);
	const [ step, setStep ] = useState( 0 );
	const [ chosenType, setChosenType ] = useState< string | null >( null );
	const [ interests, setInterests ] = useState< Interest[] >( [] );
	// WHY: true while the current step's content animates out.
	const [ leaving, setLeaving ] = useState( false );
	const leaveTimer = useRef< ReturnType< typeof setTimeout > | undefined >(
		undefined
	);

	const id = useId();
	const headingId = `${ id }-heading`;
	const hintId = `${ id }-hint`;
	const headingRef = useRef< HTMLHeadingElement >( null );
	const hasMoved = useRef( false );

	const stepKeys: StepKey[] = presetType
		? [ 'interests', 'results' ]
		: [ 'programType', 'interests', 'results' ];
	const stepIndex = Math.min( step, stepKeys.length - 1 );
	const currentKey = stepKeys[ stepIndex ] ?? 'interests';
	const programType = presetType ?? chosenType;
	const interestSlugs = interests.map( ( interest ) => interest.slug );

	// WHY: if the preset changes, e.g. while an editor adjusts the block, start over.
	useEffect( () => {
		clearTimeout( leaveTimer.current );
		setLeaving( false );
		setStep( 0 );
		setChosenType( null );
		setInterests( [] );
	}, [ presetType ] );

	useEffect( () => () => clearTimeout( leaveTimer.current ), [] );

	// WHY: counts for the first step's cards only. Not needed when the type is preset.
	const counts = useRequest(
		presetType
			? null
			: async ( signal ) =>
					programTypeCounts(
						await client.getProgramTypes( { signal } )
					),
		[ client, presetType ]
	);

	// PERF: starts loading as soon as a type is picked, before the visitor continues.
	const interestOptions = useRequest(
		programType
			? ( signal ) => client.getInterests( programType, { signal } )
			: null,
		[ client, programType ]
	);

	const isResults = currentKey === 'results';
	const degrees = useRequest(
		isResults && programType
			? ( signal ) =>
					client.getDegrees( programType, interestSlugs, { signal } )
			: null,
		[ client, isResults, programType, interestSlugs.join( ',' ) ]
	);

	// A11Y: move focus to the new step's heading, so keyboard and screen-reader
	// users land on it. Skip the first render, so the page doesn't jump.
	useEffect( () => {
		if ( hasMoved.current ) {
			headingRef.current?.focus();
		}
	}, [ stepIndex ] );

	// WHY: let the current step animate out, then show the next one.
	function goTo( next: number ) {
		if ( leaving ) {
			return;
		}

		hasMoved.current = true;
		const delay = exitDuration();

		if ( ! delay ) {
			setStep( next );
			return;
		}

		setLeaving( true );
		leaveTimer.current = setTimeout( () => {
			setStep( next );
			setLeaving( false );
		}, delay );
	}

	function selectProgramType( slug: string ) {
		if ( slug !== chosenType ) {
			setChosenType( slug );
			// WHY: interests belong to a degree type, so a new type starts fresh.
			setInterests( [] );
		}
	}

	// SPEC: button labels name the next step, per the UCF brand's web guidance.
	const stepContent: Record<
		StepKey,
		{
			heading: string;
			canContinue: boolean;
			hint: string;
			nextLabel: string;
		}
	> = {
		programType: {
			heading: 'What type of degree are you looking for?',
			canContinue: chosenType !== null,
			hint: 'Choose a degree type to continue.',
			nextLabel: 'Choose Interests',
		},
		interests: {
			heading: 'What are you interested in?',
			canContinue: interests.length > 0,
			hint: 'Choose at least one interest to continue.',
			nextLabel: 'See Matching Programs',
		},
		results: {
			heading: 'Programs that match your interests',
			canContinue: false,
			hint: '',
			nextLabel: '',
		},
	};

	const current = stepContent[ currentKey ];
	const isLast = stepIndex === stepKeys.length - 1;

	return (
		<div
			className={ `ucf-c-panel ucf-c-degree-finder${ leaving ? ' ucf-c-degree-finder--leaving' : '' }` }
		>
			<h2
				id={ headingId }
				ref={ headingRef }
				tabIndex={ -1 }
				className="ucf-c-degree-finder__heading"
			>
				<span className="ucf-c-degree-finder__visually-hidden">
					Step { stepIndex + 1 } of { stepKeys.length }:{ ' ' }
				</span>
				{ /* WHY: keyed by step, so each new heading animates in. */ }
				<span
					key={ currentKey }
					className="ucf-c-degree-finder__heading-text ucf-c-degree-finder__motion"
				>
					{ current.heading }
				</span>
			</h2>

			<div className="ucf-c-degree-finder__body">
				{ currentKey === 'programType' && (
					<ProgramTypeStep
						options={ programTypes }
						counts={
							counts.status === 'success' ? counts.data : null
						}
						selected={ chosenType }
						onSelect={ selectProgramType }
						headingId={ headingId }
					/>
				) }
				{ currentKey === 'interests' && (
					<InterestStep
						request={ interestOptions }
						selected={ interests }
						onChange={ setInterests }
					/>
				) }
				{ isResults && <ResultsStep request={ degrees } /> }
			</div>

			<div className="ucf-c-degree-finder__footer">
				<div className="ucf-c-degree-finder__nav">
					<Presence show={ stepIndex > 0 }>
						<button
							type="button"
							className="ucf-c-degree-finder__button ucf-c-degree-finder__button--secondary"
							onClick={ () => goTo( stepIndex - 1 ) }
						>
							Back
						</button>
					</Presence>
					<Presence show={ ! isLast }>
						<button
							type="button"
							className="ucf-c-degree-finder__button"
							// A11Y: aria-disabled, not disabled, so the button stays reachable
							// and screen readers can say why it's inactive.
							aria-disabled={ ! current.canContinue }
							aria-describedby={
								current.canContinue ? undefined : hintId
							}
							onClick={ () =>
								current.canContinue && goTo( stepIndex + 1 )
							}
						>
							{ current.nextLabel }
						</button>
					</Presence>
					<Presence show={ ! isLast && ! current.canContinue }>
						<p id={ hintId } className="ucf-c-degree-finder__hint">
							{ current.hint }
						</p>
					</Presence>
				</div>

				<a
					className="ucf-c-degree-finder__explore"
					href={ buildSearchUrl( {
						baseUrl: searchUrl,
						programType: programType ?? undefined,
						interests: interestSlugs,
					} ) }
				>
					Explore our Programs
				</a>

				<ProgressBar
					current={ stepIndex + 1 }
					total={ stepKeys.length }
				/>
			</div>
		</div>
	);
}
