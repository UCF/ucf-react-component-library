/**
 * CONTEXT: what a component's presets (`{Name}.presets.ts`) look like. A preset is a named
 * combination of the component's props (`{Name}.props.ts`) and the parts placed inside it
 * (`{Name}.parts.ts`): "Card: Pathway", "Highlight: Key figure". A component's presets file
 * holds only its list; the shape and the lookup are here.
 *
 * Each environment reads the same list: WordPress registers each preset as a block variation
 * and the default one as the block's template and inserter preview; Puck builds each with
 * `withPreset( name )` and starts the slot with the default's parts; the stories render them.
 * integrations/tests/presets.test.tsx checks every component's presets reach WordPress whole.
 */

/**
 * A preset of a component whose props are `Props` and whose parts are `Part`.
 */
export type Preset< Props, Part > = {
	/** Its key: the WordPress variation's name and withPreset()'s argument. */
	name: string;
	/**
	 * Its name in the inserter and Puck, after the block's: "Card: Pathway". WHY the prefix: in
	 * a search or a list of blocks, it says which block the preset is.
	 */
	title: string;
	/** One line for the inserter. */
	description: string;
	/**
	 * Its icon in WordPress's inserter, by its name in `@wordpress/icons` (the component's
	 * integrations/wp/index.tsx looks it up): the shape of the preset where it can be.
	 */
	wpIcon: string;
	/** The props it sets; the rest keep their defaults. */
	props: Partial< Props >;
	/**
	 * For a component with a background image: whether this preset has one. WHY a flag, not an
	 * image: a preset with a background shows a sample in Puck and the stories, but WordPress
	 * must not save a sample into a post; there the editor picks one.
	 */
	background?: boolean;
	/** What it starts with inside, in order. */
	parts: Part[];
};

/**
 * A preset by its name, or an error that lists the names there are.
 *
 * @param presets A component's presets.
 * @param name    A preset's name.
 */
export function findPreset< P extends { name: string } >(
	presets: readonly P[],
	name: string
): P {
	const preset = presets.find( ( item ) => item.name === name );
	if ( ! preset ) {
		throw new Error(
			`There is no preset "${ name }". There are: ${ presets
				.map( ( item ) => item.name )
				.join( ', ' ) }.`
		);
	}
	return preset;
}
