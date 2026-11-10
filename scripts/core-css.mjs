/**
 * CONTEXT: a primitive's CSS, rewritten for the core block WordPress editors place instead, so the
 * block theme styles core's Button with the Button primitive's own rules (docs/architecture.md,
 * "Primitives"). build-tokens.mjs writes it into the theme's kit as dist/theme/_core-blocks.scss.
 *
 *   Selectors  our class and data attributes become core's markup and classes, from MAPS below:
 *              `.ucf-c-button[data-variant="outline"]:hover` →
 *              `.wp-block-button.is-style-outline > .wp-block-button__link:hover`.
 *   Values     a component-layer role becomes the theme's role with its Light fallback
 *              (`var(--ucf-button, var(--wp--preset--color--gold))`), as theme.json writes them;
 *              a token becomes the theme's preset or custom property (`--wp--custom--…`).
 *   Overrides  an editor's own colors win, as core's do: `color` and `border-color` apply only
 *              `:not(.has-text-color)`, `background-color` only `:not(.has-background)`.
 *
 * FIX: a selector or property the map doesn't know fails the build, so the primitive and the
 * theme's copy can't drift apart unnoticed.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { roleFallback } from './elements.mjs';
import { root, target, wpName } from './tokens.mjs';

/**
 * How each primitive's markup maps to its core block's. `wrapper` is the block's own element and
 * `link` the element our class is on; each attribute value names the core class that means the
 * same thing. `skip`: properties core sets another way, so ours would fight it.
 */
const MAPS = {
	button: {
		source: 'components/primitives/button/style.css',
		className: 'ucf-c-button',
		wrapper: '.wp-block-button',
		link: '.wp-block-button__link',
		attributes: {
			// Fill is core's default style: not Outline, not Text.
			'data-variant="fill"': {
				wrapper: ':not(.is-style-outline):not(.is-style-text)',
			},
			'data-variant="outline"': { wrapper: '.is-style-outline' },
			'data-variant="text"': { wrapper: '.is-style-text' },
			// SPEC: in the theme a button's size rides on core's font-size control.
			'data-size="small"': { link: '.has-small-font-size' },
			'data-size="body"': { link: '.has-body-font-size' },
			'data-size': {
				link: ':is(.has-small-font-size, .has-body-font-size)',
			},
		},
		// WHY width: core's Width control (25% to 100%) sets the link's width; `fit-content` would
		// override it. Core's wrapper already keeps a lone button from stretching.
		skip: [ 'width' ],
	},
};

const ROLE = /var\(--ucf-c-([a-z0-9-]+)\)/g;
const TOKEN = /var\(--ucf-([a-z0-9-]+)\)/g;
// Token groups, longest first, so `font-size-small` is read as `font-size` + `small`.
const GROUPS = [
	'font-family',
	'font-size',
	'spacing',
	'shadow',
	'custom',
	'layout',
	'color',
];

/**
 * A value with our variables as the theme's.
 *
 * @param {Object} tokens The tokens (tokens.json).
 * @param {string} value  A declaration's value.
 * @param {string} where  Where it was written, for errors.
 */
function themeValue( tokens, value, where ) {
	return value
		.replace(
			ROLE,
			( _, role ) =>
				`var(--ucf-${ role }, var(${ wpName(
					'color',
					roleFallback( tokens, role, where )
				) }))`
		)
		.replace( TOKEN, ( whole, name ) => {
			const group = GROUPS.find( ( g ) => name.startsWith( `${ g }-` ) );
			if ( ! group ) {
				throw new Error( `${ where }: ${ whole } is no token.` );
			}
			const slug = name.slice( group.length + 1 );
			// target() fails the build for a token tokens.json doesn't have.
			target( tokens, `{${ group }.${ slug }}`, where );
			return `var(${ wpName( group, slug ) })`;
		} );
}

/**
 * The rules of a flat stylesheet, in order: its selectors and declarations. Comments are dropped.
 *
 * @param {string} css   The stylesheet.
 * @param {string} where Its file, for errors.
 */
function rulesOf( css, where ) {
	const flat = css.replace( /\/\*[\s\S]*?\*\//g, '' );
	if ( /@[a-z]/.test( flat ) ) {
		throw new Error(
			`${ where } has an @-rule; scripts/core-css.mjs maps flat rules only.`
		);
	}
	return [ ...flat.matchAll( /([^{}]+)\{([^}]*)\}/g ) ].map(
		( [ , selectors, body ] ) => ( {
			selectors: selectors
				.split( ',' )
				.map( ( s ) => s.trim().replace( /\s+/g, ' ' ) ),
			declarations: body
				.split( ';' )
				.map( ( d ) => d.trim() )
				.filter( Boolean )
				.map( ( d ) => {
					const at = d.indexOf( ':' );
					return [
						d.slice( 0, at ).trim(),
						d
							.slice( at + 1 )
							.trim()
							.replace( /\s+/g, ' ' ),
					];
				} ),
		} )
	);
}

/**
 * One of our selectors as core's, with an extra condition on the link (an override's `:not()`).
 *
 * @param {Object} map      The primitive's map.
 * @param {string} selector Ours.
 * @param {string} extra    Added to the link, before any state.
 * @param {string} where    Its file, for errors.
 */
function coreSelector( map, selector, extra, where ) {
	const match = new RegExp(
		`^\\.${ map.className }((?:\\[[^\\]]+\\])*)((?::[a-z-]+)*)$`
	).exec( selector );
	if ( ! match ) {
		throw new Error( `${ where }: no core selector for "${ selector }".` );
	}
	let wrapper = map.wrapper;
	let link = map.link;
	for ( const [ , attribute ] of match[ 1 ].matchAll( /\[([^\]]+)\]/g ) ) {
		const to = map.attributes[ attribute ];
		if ( ! to ) {
			throw new Error(
				`${ where }: no core class for [${ attribute }] in "${ selector }".`
			);
		}
		wrapper += to.wrapper ?? '';
		link += to.link ?? '';
	}
	return `${ wrapper } > ${ link }${ extra }${ match[ 2 ] }`;
}

// An editor's own colors win: these properties apply only without them.
const OVERRIDES = {
	color: ':not(.has-text-color)',
	'border-color': ':not(.has-text-color)',
	'background-color': ':not(.has-background)',
};

/**
 * A primitive's CSS for its core block, as the theme loads it.
 *
 * @param {Object} tokens The tokens (tokens.json).
 * @param {string} name   The primitive: a key of MAPS.
 * @param {string} css    Its stylesheet; read from its file when left out.
 */
export function coreCss( tokens, name, css ) {
	const map = MAPS[ name ];
	const source = css ?? readFileSync( path.join( root, map.source ), 'utf8' );
	const out = [];
	for ( const { selectors, declarations } of rulesOf( source, map.source ) ) {
		// Each override's declarations get their own rule; the rest share one.
		const groups = new Map();
		for ( const [ property, value ] of declarations ) {
			if ( map.skip.includes( property ) ) {
				continue;
			}
			const extra = OVERRIDES[ property ] ?? '';
			if ( ! groups.has( extra ) ) {
				groups.set( extra, [] );
			}
			groups
				.get( extra )
				.push( [
					property,
					themeValue(
						tokens,
						value,
						`${ map.source }: ${ selectors.join( ', ' ) }`
					),
				] );
		}
		for ( const [ extra, decls ] of groups ) {
			out.push(
				`${ selectors
					.map( ( s ) => coreSelector( map, s, extra, map.source ) )
					.join( ',\n' ) } {\n${ decls
					.map( ( [ p, v ] ) => `\t${ p }: ${ v };` )
					.join( '\n' ) }\n}\n`
			);
		}
	}
	return out.join( '\n' );
}

/**
 * dist/theme/_core-blocks.scss: every mapped primitive's CSS for its core block.
 *
 * @param {Object} tokens The tokens (tokens.json).
 */
export function coreBlocksCss( tokens ) {
	return (
		"// Generated by scripts/build-tokens.mjs (scripts/core-css.mjs) from the primitives'\n" +
		'// style.css. Do not edit: change the primitive, and the theme follows.\n' +
		Object.keys( MAPS )
			.map(
				( name ) =>
					`\n// ── ${ name }: from ${ MAPS[ name ].source } ──\n\n${ coreCss( tokens, name ) }`
			)
			.join( '' )
	);
}
