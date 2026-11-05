/**
 * Presets: named mixes of a component's props and parts ("Card: Pathway").
 *
 * integrations/tests/presets.test.tsx checks each reaches WordPress whole.
 */

/** A preset of a component with props `Props` and parts `Part`. */
export type Preset< Props, Part > = {
	/** Its key: the WordPress variation's name and withPreset()'s argument. */
	name: string;
	/** "Card: Pathway". WHY the block's name first: in a list of blocks, it says whose it is. */
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
	/** Whether it has a background image. WHY a flag: WordPress must not save a sample one. */
	background?: boolean;
	/** What it starts with inside, in order. */
	parts: Part[];
};

/**
 * A preset by its name, or an error listing the names there are.
 *
 * @param presets A component's presets.
 * @param name    A preset's name.
 */
export function findPreset< SomePreset extends { name: string } >(
	presets: readonly SomePreset[],
	name: string
): SomePreset {
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
