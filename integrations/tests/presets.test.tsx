// @vitest-environment happy-dom
/**
 * CONTEXT: every component's presets (`{Name}.presets.ts`) reach WordPress whole, and use only
 * the component's own props. Found by glob, so a component with presets is checked with no
 * other change. Puck's side is checked in puck.test.tsx.
 */
import { getBlockVariations } from '@wordpress/blocks';
import { describe, expect, it } from 'vitest';

import type { Preset as PresetOf } from '../schema/presets.ts';
import { ICONS } from '../wp/icons.ts';
import type { PropDefinitions } from '../schema/props.ts';

type Preset = PresetOf< Record< string, unknown >, unknown >;

// `../../components/content/card/Card.presets.ts` → `card`.
const componentOf = ( file: string ) => file.split( '/' )[ 4 ] ?? file;

const byComponent = < T, >( modules: Record< string, T > ) =>
	Object.fromEntries(
		Object.entries( modules ).map( ( [ file, module ] ) => [
			componentOf( file ),
			module,
		] )
	);

const presetFiles = byComponent(
	import.meta.glob< { PRESETS: Preset[]; DEFAULT_PRESET: Preset } >(
		'../../components/{content,interactive}/*/*.presets.ts',
		{ eager: true }
	)
);
// WHY eager: importing each block's index.tsx registers it, with its presets as variations.
import.meta.glob(
	'../../components/{content,interactive}/*/integrations/wp/index.tsx',
	{ eager: true }
);
const blockJsons = byComponent(
	import.meta.glob< { name: string; title: string } >(
		'../../components/{content,interactive}/*/integrations/wp/block.json',
		{ eager: true, import: 'default' }
	)
);
const definitions = byComponent(
	import.meta.glob< PropDefinitions >(
		'../../components/{content,interactive}/*/*.props.ts',
		{
			eager: true,
			import: 'PROPS',
		}
	)
);

describe.each( Object.keys( presetFiles ).sort() )( '%s', ( component ) => {
	const { PRESETS = [], DEFAULT_PRESET } = presetFiles[ component ] ?? {};
	const icons = ICONS;
	const json = blockJsons[ component ];
	const registered = () =>
		getBlockVariations( json?.name ?? '', 'inserter' ) ?? [];

	it( 'registers every preset as a variation, the default preset as the default', () => {
		expect( registered().map( ( variation ) => variation.name ) ).toEqual(
			PRESETS.map( ( preset ) => preset.name )
		);
		// A component with no presets (the Section) has no variations, so no default one.
		expect(
			registered().find( ( variation ) => variation.isDefault )?.name
		).toBe( PRESETS.length ? DEFAULT_PRESET?.name : undefined );
	} );

	describe.each( PRESETS )( 'the $name preset', ( preset ) => {
		const inWordPress = () =>
			registered().find( ( item ) => item.name === preset.name );

		it( 'starts with a block for each of its parts', () => {
			expect( inWordPress()?.innerBlocks ).toHaveLength(
				preset.parts.length
			);
		} );

		// WHY: in the inserter, a preset's icon and the block's name in its title say which
		// block it is and how it looks. An icon integrations/wp/icons.ts doesn't list would
		// show none.
		it( 'names an icon WordPress has, and a title that starts with the block’s name', () => {
			expect( [ preset.wpIcon, preset.wpIcon in icons ] ).toEqual( [
				preset.wpIcon,
				true,
			] );
			expect( inWordPress()?.icon ).toBe( icons[ preset.wpIcon ] );
			expect(
				inWordPress()?.title.startsWith( `${ json?.title }: ` )
			).toBe( true );
		} );

		// WHY: a value that isn't a choice saves, but no rule matches it and the sidebar shows
		// nothing selected.
		it( 'sets only values its component offers', () => {
			const own = definitions[ component ] ?? {};
			const strays = Object.entries( preset.props )
				.filter( ( [ key, value ] ) => {
					const definition = own[ key ];
					return (
						! definition ||
						( definition.type === 'choice' &&
							! definition.options.some(
								( option ) => option.value === value
							) )
					);
				} )
				.map( ( [ key ] ) => key );
			expect( strays ).toEqual( [] );
		} );
	} );
} );
