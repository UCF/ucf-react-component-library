/**
 * CONTEXT: reads tokens/tokens.json and resolves its references. Shared by build-tokens.mjs,
 * which writes the CSS, and tokens.test.mjs, which checks the values.
 *
 * The file is in the W3C Design Tokens format (DTCG): a token is an object with `$value`, keys
 * starting with `$` belong to the format, every other key is a token or a group, and
 * `"{color.gold}"` is a reference to another token.
 *
 * Two kinds of group:
 *
 *   primitives    color, font-family, font-size, spacing, shadow, custom. Values. Each
 *                 becomes `--ucf-{group}-{slug}`.
 *   roles         treatment and composition. References to colors, never values. A treatment
 *                 says what each color is for on one kind of background (`--ucf-accent`); a
 *                 composition is a background plus the treatment that goes with it.
 *
 * UPSTREAM: DTCG 2025.10 writes colors as `{ colorSpace, components }` objects. These stay hex
 * strings, which Style Dictionary and most tools still read; a strict validator would flag them.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.dirname(
	path.dirname( fileURLToPath( import.meta.url ) )
);

export const ROLE_GROUPS = [ 'treatment', 'composition' ];

// SYNC: the extension key for UCF's own fields (display names, a composition's treatment).
const EXT = 'edu.ucf';

const REFERENCE = /^\{([^}]+)\}$/;

export function loadTokens() {
	return JSON.parse(
		readFileSync( path.join( root, 'tokens/tokens.json' ), 'utf8' )
	);
}

/**
 * The keys of a group that are tokens or subgroups, not `$type` and the rest.
 *
 * @param {Object} group A group from tokens.json.
 */
export const children = ( group ) =>
	Object.entries( group ).filter( ( [ key ] ) => ! key.startsWith( '$' ) );

export const ucfExtension = ( node ) => node.$extensions?.[ EXT ] ?? {};

/**
 * Every primitive as { group, slug, value, name }, in file order.
 *
 * @param {Object} tokens The parsed tokens.json.
 */
export function primitives( tokens ) {
	return Object.entries( tokens )
		.filter( ( [ group ] ) => ! ROLE_GROUPS.includes( group ) )
		.flatMap( ( [ group, set ] ) =>
			children( set ).map( ( [ slug, token ] ) => ( {
				group,
				slug,
				value: token.$value,
				name: ucfExtension( token ).name,
			} ) )
		);
}

/**
 * The primitive a reference points at, as { group, slug }. Throws on anything else, so a typo
 * in tokens.json fails the build instead of emitting a variable that is never set.
 *
 * WHY roles may only point at primitives, not at other roles: one level of indirection is all
 * the CSS needs (`--ucf-accent: var(--ucf-color-gold)`), and it keeps every role's final value
 * one lookup away.
 *
 * @param {Object} tokens    The parsed tokens.json.
 * @param {string} reference A reference such as "{color.gold}".
 * @param {string} where     The path being read, for the error message.
 */
export function target( tokens, reference, where ) {
	const match = REFERENCE.exec( reference );
	const [ group, slug, extra ] = match ? match[ 1 ].split( '.' ) : [];

	if (
		! group ||
		! slug ||
		extra ||
		ROLE_GROUPS.includes( group ) ||
		tokens[ group ]?.[ slug ]?.$value === undefined
	) {
		throw new Error(
			`${ where } is ${ JSON.stringify(
				reference
			) }, which is not a reference to a primitive token like "{color.gold}".`
		);
	}
	return { group, slug };
}

/**
 * A reference's final value: "{color.gold}" → "#EDB80D".
 *
 * @param {Object} tokens    The parsed tokens.json.
 * @param {string} reference A reference such as "{color.gold}".
 * @param {string} where     The path being read, for the error message.
 */
export const resolve = ( tokens, reference, where ) => {
	const { group, slug } = target( tokens, reference, where );
	return tokens[ group ][ slug ].$value;
};

/**
 * Each treatment as { name, roles: [ { role, reference } ] }.
 *
 * @param {Object} tokens The parsed tokens.json.
 */
export const treatments = ( tokens ) =>
	children( tokens.treatment ).map( ( [ name, set ] ) => ( {
		name,
		roles: children( set ).map( ( [ role, token ] ) => ( {
			role,
			reference: token.$value,
		} ) ),
	} ) );

/**
 * Each composition as { name, label, treatment, panel?, bar?, background, text, overrides }.
 *
 * `panel` names the composition that objects set on this one use (Bold Gold: Light Alt);
 * `bar` names the one a control bar set in it uses (Dark on light sections, Light Alt on dark).
 *
 * `overrides` is every other token in the composition, by role: a role whose value on this
 * background differs from its treatment's, such as Light Alt's `raised` and `field`.
 *
 * @param {Object} tokens The parsed tokens.json.
 */
export const compositions = ( tokens ) =>
	children( tokens.composition ).map( ( [ name, c ] ) => ( {
		name,
		label: ucfExtension( c ).name,
		treatment: ucfExtension( c ).treatment,
		panel: ucfExtension( c ).panel,
		bar: ucfExtension( c ).bar,
		background: c.background?.$value,
		text: c.text?.$value,
		overrides: Object.fromEntries(
			children( c )
				.filter( ( [ key ] ) => key !== 'background' && key !== 'text' )
				.map( ( [ role, token ] ) => [ role, token.$value ] )
		),
	} ) );

// SYNC: WordPress's preset prefixes, keyed by group in tokens.json. `custom` is not a preset;
// WordPress writes it as --wp--custom--{key}.
const WP_PRESET = {
	color: 'color',
	'font-family': 'font-family',
	'font-size': 'font-size',
	spacing: 'spacing',
	shadow: 'shadow',
};

/**
 * The WordPress custom property a token points at in WordPress, so the theme's value wins.
 *
 * WHY `layout` maps to --wp--style--global--{slug}-size: WordPress writes theme.json's
 * `settings.layout` (contentSize, wideSize) as those two properties, and no others.
 *
 * @param {string} group The token's group in tokens.json.
 * @param {string} slug  Its key in that group.
 * @return {string} The WordPress property name.
 */
export function wpName( group, slug ) {
	if ( group === 'custom' ) {
		return `--wp--custom--${ slug }`;
	}
	if ( group === 'layout' ) {
		return `--wp--style--global--${ slug }-size`;
	}
	return `--wp--preset--${ WP_PRESET[ group ] }--${ slug }`;
}
