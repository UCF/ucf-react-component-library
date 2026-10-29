/**
 * CONTEXT: turns tokens/tokens.json into the one stylesheet each host loads.
 *
 *   dist/tokens/base.css        For any host that is not WordPress, in three parts:
 *                               - every primitive (`--ucf-color-gold: #EDB80D`) and the light
 *                                 composition's roles on :root;
 *                               - `.ucf-composition-dark` and the rest: a background, every role
 *                                 re-pointed, and the panel and bar roles it names;
 *                               - the component layer (below).
 *                               build-package.mjs adds every component's style.css to it as the
 *                               package's single `ucf.css`.
 *   dist/tokens/base-wp.css     For WordPress: every primitive pointing at the theme's preset
 *                               (`var(--wp--preset--color--gold, #EDB80D)`, so the active
 *                               theme.json wins), and the component layer. Plugins ship it as
 *                               build/base.css.
 *   dist/theme/                 The block theme's kit, copied there by its `npm run sync:tokens`:
 *                               _tokens.scss (,  as slugs), compositions.json
 *                               (names and labels for its block-style registration) and
 *                               theme-json.json (the presets its theme.json must hold).
 *
 * The component layer is `.ucf-c` and `.ucf-c-panel`: each sets `--ucf-c-{role}` and
 * `--ucf-c-bar-{role}` for every role, already resolved with its fallback, so a component reads
 * `var(--ucf-c-accent)` and nothing else. It reads roles and never sets them, so it can ship to
 * WordPress without competing with the theme.
 *
 * Component CSS reads only `--ucf-*` names, never `--wp--preset--*`, which is what lets one
 * stylesheet work in every host. How tokens.json is read is in tokens.mjs.
 *
 * WHY no roles in the WordPress files: in WordPress the block theme sets every role, per
 * section (`.is-style-dark`), and its src/scss/_compositions.scss says it is the only file
 * allowed to. A plugin setting them too would be a second source. Until the theme builds its
 * compositions from this file, components there fall back from the role to a token.
 *
 * WHY no staleness check, unlike ucf-components: dist/ is not committed here. Everything that
 * reads these files (the plugin build, Storybook, the npm package) runs this script first.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
	children,
	compositions,
	loadTokens,
	primitives,
	root,
	target,
	treatments,
	ucfExtension,
} from './tokens.mjs';

const tokens = loadTokens();
const entries = primitives( tokens );

// SYNC: WordPress's preset prefixes, keyed by group in tokens.json. `custom` is not a preset;
// WordPress writes it as --wp--custom--{key}.
const WP_PRESET = {
	color: 'color',
	'font-family': 'font-family',
	'font-size': 'font-size',
	spacing: 'spacing',
	shadow: 'shadow',
};

// WHY: what a page is outside any composition. The theme's role-default() is the same row.
const DEFAULT_COMPOSITION = 'light';

const ucfName = ( group, slug ) => `--ucf-${ group }-${ slug }`;
const wpName = ( group, slug ) =>
	group === 'custom'
		? `--wp--custom--${ slug }`
		: `--wp--preset--${ WP_PRESET[ group ] }--${ slug }`;

// ── Roles ────────────────────────────────────────────────────────────────────

const treatmentByName = Object.fromEntries(
	treatments( tokens ).map( ( t ) => [ t.name, t ] )
);
const primitiveNames = new Set(
	entries.map( ( t ) => ucfName( t.group, t.slug ) )
);

// A11Y: every treatment defines every role. A role missing from one treatment would inherit
// the enclosing section's value: a light-field color on a dark field.
const [ first, ...rest ] = Object.values( treatmentByName );
const roleList = first.roles.map( ( r ) => r.role ).join( ' ' );
for ( const t of rest ) {
	const list = t.roles.map( ( r ) => r.role ).join( ' ' );
	if ( list !== roleList ) {
		throw new Error(
			`Treatment "${ t.name }" has the roles\n  ${ list }\nbut "${ first.name }" has\n  ${ roleList }\nEvery treatment must define the same roles, in the same order.`
		);
	}
}

/**
 * The custom properties one composition sets, as [ name, value ] pairs.
 *
 * @param {Object} c A composition, from compositions() in tokens.mjs.
 */
function compositionProperties( c ) {
	const where = `composition.${ c.name }`;
	const t = treatmentByName[ c.treatment ];
	if ( ! t ) {
		throw new Error(
			`${ where } names the treatment "${ c.treatment }", which is not in treatment.`
		);
	}
	const props = [
		...t.roles.map( ( r ) => [
			`--ucf-${ r.role }`,
			r.reference,
			`treatment.${ t.name }.${ r.role }`,
		] ),
		// WHY: the field's own background, as a role. Per composition, not per treatment:
		// `light` and `alt` share a treatment but not a background.
		[ '--ucf-surface', c.background, `${ where }.background` ],
	];
	// WHY: a composition may override any of its treatment's roles, because some are a contrast
	// with this background, not with the treatment (Light Alt's `raised` and `field`). Replaced
	// in place, not appended, so each property is written once.
	for ( const [ role, reference ] of Object.entries( c.overrides ) ) {
		const i = props.findIndex( ( [ name ] ) => name === `--ucf-${ role }` );
		if ( i < 0 ) {
			throw new Error(
				`${ where }.${ role } overrides a role that treatment.${ t.name } does not have.`
			);
		}
		props[ i ] = [ `--ucf-${ role }`, reference, `${ where }.${ role }` ];
	}
	return props.map( ( [ name, reference, at ] ) => {
		if ( primitiveNames.has( name ) ) {
			throw new Error(
				`${ at } would write ${ name }, which is already a primitive's name.`
			);
		}
		const { group, slug } = target( tokens, reference, at );
		return [ name, `var(${ ucfName( group, slug ) })` ];
	} );
}

const all = compositions( tokens );
const byName = Object.fromEntries( all.map( ( c ) => [ c.name, c ] ) );
if ( ! byName[ DEFAULT_COMPOSITION ] ) {
	throw new Error( `There is no composition "${ DEFAULT_COMPOSITION }".` );
}

/**
 * The surfaces a composition can name, and the property prefix each writes.
 *
 *   panel   objects set on the section, such as the Degree Finder (Bold Gold names Light Alt,
 *           so a finder on gold looks exactly as it does on Light Alt).
 *   bar     a control bar set in the section, such as the finder's footer (Dark on light and
 *           gold sections, Light Alt on dark ones, so it always contrasts with the band).
 *
 * WHY one mechanism for both: each is "a surface inside the section that uses another
 * composition's roles". A new kind of surface is a new row here, not a new set of roles in
 * every treatment.
 */
const SURFACES = { panel: '--ucf-panel-', bar: '--ucf-bar-' };

/**
 * The roles one composition gives a named surface: `--ucf-{surface}-{role}` for every role.
 *
 * FIX: a composition that names no such surface sets each one to `initial`, which makes it
 * unset again. Custom properties inherit, so without that a Dark section inside a Bold Gold one
 * would hand its panels Light Alt's roles: light-side colors on a dark field.
 *
 * @param {Object} c       A composition, from compositions() in tokens.mjs.
 * @param {string} surface A key of SURFACES.
 */
function surfaceProperties( c, surface ) {
	const named = c[ surface ];
	const other = named && byName[ named ];
	if ( named && ! other ) {
		throw new Error(
			`composition.${ c.name } names the ${ surface } "${ named }", which is not a composition.`
		);
	}
	const values = other
		? Object.fromEntries( compositionProperties( other ) )
		: {};
	return compositionProperties( c ).map( ( [ name ] ) => [
		name.replace( /^--ucf-/, SURFACES[ surface ] ),
		values[ name ] ?? 'initial',
	] );
}

/**
 * A composition's own declarations.
 *
 * WHY `border-color` though nothing draws a border: with `border-style: none` it paints only
 * once something adds a width, so a host can ask for an outline without naming a color.
 *
 * @param {Object} c A composition, from compositions() in tokens.mjs.
 */
function compositionRule( c ) {
	const { group, slug } = target(
		tokens,
		c.text,
		`composition.${ c.name }.text`
	);
	return [
		...compositionProperties( c ),
		...Object.keys( SURFACES ).flatMap( ( surface ) =>
			surfaceProperties( c, surface )
		),
		[ 'background-color', 'var(--ucf-surface)' ],
		[ 'border-color', 'var(--ucf-line)' ],
		[ 'color', `var(${ ucfName( group, slug ) })` ],
	];
}

/**
 * The component layer: one class on a component's outer element, and every element inside it
 * reads `--ucf-c-{role}` and `--ucf-c-bar-{role}`.
 *
 *   .ucf-c         a component that sits on the section (a stat, a quote). Each role is the
 *                  section's, or the light composition's value when there is no section.
 *   .ucf-c-panel   a component that paints its own ground (the Degree Finder, a boxed card).
 *                  Each role is the section's panel role first (Bold Gold's panels are Light
 *                  Alt), then the section's, then the light default.
 *
 * Both also set `--ucf-c-bar-{role}`: the section's bar roles, or the light composition's bar
 * (Dark) when there is no section.
 *
 * WHY generated: a role added to tokens.json reaches every component with no edit to any of
 * them, and the fallbacks live in one place. WHY the default is the light composition: it is
 * what a page is outside any section (the theme's role-default() is the same row).
 * WHY on the component's root and not on `*`: custom properties inherit, so one declaration
 * reaches every nested element. Re-declaring on each element would recompute from the section
 * and undo a panel's values inside it.
 */
function rolesCss() {
	const light = byName[ DEFAULT_COMPOSITION ];
	const defaults = compositionProperties( light );
	const barDefaults = Object.fromEntries(
		compositionProperties( byName[ light.bar ] )
	);
	const name = ( prop ) => prop.replace( /^--ucf-/, '--ucf-c-' );
	const bar = defaults.map( ( [ prop ] ) => [
		prop.replace( /^--ucf-/, '--ucf-c-bar-' ),
		`var(${ prop.replace( /^--ucf-/, '--ucf-bar-' ) }, ${
			barDefaults[ prop ]
		})`,
	] );
	return [
		block( '.ucf-c', [
			...defaults.map( ( [ prop, value ] ) => [
				name( prop ),
				`var(${ prop }, ${ value })`,
			] ),
			...bar,
		] ),
		block( '.ucf-c-panel', [
			...defaults.map( ( [ prop, value ] ) => [
				name( prop ),
				`var(${ prop.replace(
					/^--ucf-/,
					'--ucf-panel-'
				) }, var(${ prop }, ${ value }))`,
			] ),
			...bar,
		] ),
	].join( '\n' );
}

// ── Output ───────────────────────────────────────────────────────────────────

const banner =
	'/* Generated by scripts/build-tokens.mjs from tokens/tokens.json. Do not edit. */\n';

const block = ( selector, declarations ) =>
	`${ selector } {\n${ declarations
		.map( ( [ name, value ] ) => `\t${ name }: ${ value };` )
		.join( '\n' ) }\n}\n`;

const primitiveDeclarations = ( value ) =>
	entries.map( ( t ) => [ ucfName( t.group, t.slug ), value( t ) ] );

const preset = ( group, key ) =>
	entries
		.filter( ( t ) => t.group === group )
		.map( ( t ) => ( { slug: t.slug, name: t.name, [ key ]: t.value } ) );

const themeJson = {
	color: { palette: preset( 'color', 'color' ) },
	typography: {
		fontFamilies: preset( 'font-family', 'fontFamily' ),
		fontSizes: preset( 'font-size', 'size' ),
	},
	spacing: { spacingSizes: preset( 'spacing', 'size' ) },
	shadow: { presets: preset( 'shadow', 'shadow' ) },
	custom: Object.fromEntries(
		entries
			.filter( ( t ) => t.group === 'custom' )
			.map( ( t ) => [ t.slug, t.value ] )
	),
};

// ── Theme kit ────────────────────────────────────────────────────────────────
//
// CONTEXT: the block theme's copy of the roles, generated: `$treatments` and `$compositions`
// as Sass maps of color slugs, in the shape src/scss/_compositions.scss there loops over.
//
// WHY slugs, not values: the theme resolves each slug through its `$color` map to its
// theme.json preset, so the theme's presets keep the final say on values, as for every other
// host. WHY descriptions as comments: the A11Y, SPEC and FIX notes that explain each value in
// tokens.json are the theme's notes too, and they belong beside the value there as well.
// SYNC: the theme's tools/sync-tokens.js copies dist/theme/ into its tokens/ folder.

// A reference's color slug: "{color.gold}" → "gold".
const slug = ( reference, where ) => target( tokens, reference, where ).slug;

const sassComment = ( text, indent ) => {
	if ( ! text ) {
		return [];
	}
	const lines = [];
	let line = '';
	for ( const word of text.split( /\s+/ ) ) {
		if ( line && indent.length + 3 + line.length + 1 + word.length > 100 ) {
			lines.push( line );
			line = word;
		} else {
			line = line ? `${ line } ${ word }` : word;
		}
	}
	lines.push( line );
	return lines.map( ( l ) => `${ indent }// ${ l }` );
};

function themeSass() {
	const out = [
		'// Generated by ucf-react-component-library (scripts/build-tokens.mjs) from tokens/tokens.json.',
		'// Do not edit. Change tokens.json there, then run `npm run sync:tokens` here.',
		'',
		...sassComment( tokens.treatment.$description, '' ),
		'$treatments: (',
	];
	for ( const [ name, set ] of children( tokens.treatment ) ) {
		out.push(
			...sassComment( set.$description, '\t' ),
			`\t"${ name }": (`
		);
		for ( const [ role, token ] of children( set ) ) {
			out.push(
				...sassComment( token.$description, '\t\t' ),
				`\t\t"${ role }": "${ slug(
					token.$value,
					`treatment.${ name }.${ role }`
				) }",`
			);
		}
		out.push( '\t),' );
	}
	out.push(
		');',
		'',
		...sassComment( tokens.composition.$description, '' ),
		'$compositions: ('
	);
	for ( const [ name, c ] of children( tokens.composition ) ) {
		const { name: label, treatment, panel, bar } = ucfExtension( c );
		out.push(
			...sassComment( c.$description, '\t' ),
			`\t"${ name }": (`,
			`\t\t"label": "${ label }",`,
			`\t\t"bg": "${ slug( c.background.$value, `composition.${ name }.background` ) }",`,
			`\t\t"text": "${ slug( c.text.$value, `composition.${ name }.text` ) }",`,
			`\t\t"treatment": "${ treatment }",`
		);
		if ( panel ) {
			out.push( `\t\t"panel": "${ panel }",` );
		}
		if ( bar ) {
			out.push( `\t\t"bar": "${ bar }",` );
		}
		const overrides = children( c ).filter(
			( [ key ] ) => key !== 'background' && key !== 'text'
		);
		out.push( `\t\t"overrides": (` );
		for ( const [ role, token ] of overrides ) {
			out.push(
				...sassComment( token.$description, '\t\t\t' ),
				`\t\t\t"${ role }": "${ slug(
					token.$value,
					`composition.${ name }.${ role }`
				) }",`
			);
		}
		out.push( '\t\t),', '\t),' );
	}
	out.push( ');', '' );
	return out.join( '\n' );
}

// The composition names and labels, for the theme's register_block_style() loop.
const themeCompositions = Object.fromEntries(
	all.map( ( c ) => [ c.name, c.label ] )
);

// Section banners inside the merged files, so a reader of dist/ can find each part.
const part = ( title ) => `\n/* ── ${ title } ── */\n`;

const tokensRoot = block( ':root', [
	...primitiveDeclarations( ( t ) => t.value ),
	...compositionProperties( byName[ DEFAULT_COMPOSITION ] ),
] );
const compositionsCss = all
	.map( ( c ) =>
		block( `.ucf-composition-${ c.name }`, compositionRule( c ) )
	)
	.join( '\n' );
const tokensWpRoot = block(
	':root',
	primitiveDeclarations(
		( t ) => `var(${ wpName( t.group, t.slug ) }, ${ t.value })`
	)
);

const out = {
	'dist/tokens/base.css':
		banner +
		part( 'Tokens, and the light roles on :root' ) +
		tokensRoot +
		part( 'Compositions: .ucf-composition-*' ) +
		compositionsCss +
		part( 'Component layer: .ucf-c, .ucf-c-panel' ) +
		rolesCss(),
	'dist/tokens/base-wp.css':
		banner +
		part( "Tokens, each pointing at the theme's preset" ) +
		tokensWpRoot +
		part( 'Component layer: .ucf-c, .ucf-c-panel' ) +
		rolesCss(),
	'dist/theme/_tokens.scss': themeSass(),
	'dist/theme/compositions.json':
		JSON.stringify( themeCompositions, null, '\t' ) + '\n',
	'dist/theme/theme-json.json':
		JSON.stringify( themeJson, null, '\t' ) + '\n',
};

// WHY clear both first: files from an earlier build (tokens.css, from before the merge)
// would otherwise linger there and look current.
for ( const dir of [ 'dist/tokens', 'dist/theme' ] ) {
	rmSync( path.join( root, dir ), { recursive: true, force: true } );
	mkdirSync( path.join( root, dir ), { recursive: true } );
}
for ( const [ file, content ] of Object.entries( out ) ) {
	writeFileSync( path.join( root, file ), content );
}
