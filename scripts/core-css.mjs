/**
 * CONTEXT: a primitive's CSS, rewritten for the core block WordPress editors place instead, so the
 * block theme styles core's Button, List, Table, Quote, Pullquote, Separator and Code with the
 * primitives' own rules (docs/architecture.md, "Primitives"). build-tokens.mjs writes it into the
 * theme's kit as dist/theme/_core-blocks.scss.
 *
 *   Selectors  our class and data attributes become core's markup and classes, from MAPS below:
 *              `.ucf-c-button[data-variant="outline"]:hover` →
 *              `.wp-block-button.is-style-outline > .wp-block-button__link:hover`;
 *              `ol.ucf-c-list > li::marker` → `ol.wp-block-list > li::marker`. What follows our
 *              class (` > li`, ` th`, `::before`) is kept: the primitives write core's elements.
 *   Margins    a block's own top and bottom margins are dropped: in WordPress the layout spaces
 *              blocks (blockGap), where in Puck the container does.
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
 * How each primitive's markup maps to its core block's.
 *
 *   `root`         the block's own element, which our class is on (List, Table and the rest);
 *                  each attribute value names the core class that means the same thing.
 *   `wrapper`, `link`  for a block whose element ours is inside of (the Button): our class is on
 *                  `link`, and each attribute adds to either.
 *   `outrankCore`  core's own CSS for the block competes with ours: each rule names the block's
 *                  class twice, one class above core's. Left off where it doesn't (List), so the
 *                  theme's own variations (`.ucf-toc .wp-block-list`) still outrank ours.
 *   `skip`         properties core sets another way, so ours would fight it.
 *   `overrides`    the properties an editor's own color settings replace (OVERRIDES below).
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
		overrides: [ 'color', 'border-color', 'background-color' ],
	},
	list: {
		source: 'components/primitives/list/style.css',
		className: 'ucf-c-list',
		root: '.wp-block-list',
		attributes: {
			'data-variant="check"': '.is-style-check',
			'data-variant="divided"': '.is-style-divided',
			'data-variant="tags"': '.is-style-tags',
			'data-variant="definitions"': '.is-style-definitions',
		},
	},
	table: {
		source: 'components/primitives/table/style.css',
		className: 'ucf-c-table',
		root: '.wp-block-table',
		outrankCore: true,
		attributes: {
			'data-variant="stripes"': '.is-style-stripes',
			// WHY a class, not a style: the theme's Comparison pattern sets it.
			'data-variant="compare"': '.ucf-compare',
		},
	},
	quote: {
		source: 'components/primitives/quote/style.css',
		className: 'ucf-c-quote',
		root: '.wp-block-quote',
		outrankCore: true,
		attributes: {},
	},
	pullquote: {
		source: 'components/primitives/pullquote/style.css',
		className: 'ucf-c-pullquote',
		root: '.wp-block-pullquote',
		outrankCore: true,
		attributes: {},
	},
	separator: {
		source: 'components/primitives/separator/style.css',
		className: 'ucf-c-separator',
		root: '.wp-block-separator',
		outrankCore: true,
		attributes: {
			'data-variant="wide"': '.is-style-wide',
			'data-variant="dots"': '.is-style-dots',
		},
	},
	code: {
		source: 'components/primitives/code/style.css',
		className: 'ucf-c-code',
		root: '.wp-block-code',
		outrankCore: true,
		attributes: {},
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
 * The rules of a stylesheet, in order: their selectors, declarations and `@media` condition, if
 * any. Comments are dropped.
 *
 * @param {string} css   The stylesheet.
 * @param {string} where Its file, for errors.
 * @param {string} media The `@media` condition the rules are inside of.
 */
function rulesOf( css, where, media = '' ) {
	const flat = css.replace( /\/\*[\s\S]*?\*\//g, '' );
	const rules = [];
	let at = 0;
	while ( at < flat.length ) {
		const open = flat.indexOf( '{', at );
		if ( open < 0 ) {
			break;
		}
		const head = flat.slice( at, open ).trim();
		if ( head.startsWith( '@' ) ) {
			if ( ! head.startsWith( '@media ' ) || media ) {
				throw new Error(
					`${ where } has "${ head }"; scripts/core-css.mjs maps rules and one level of @media only.`
				);
			}
			// The block's end: the brace that closes it, past its rules' own.
			let depth = 1;
			let end = open + 1;
			while ( depth && end < flat.length ) {
				depth += { '{': 1, '}': -1 }[ flat[ end ] ] ?? 0;
				end++;
			}
			rules.push(
				...rulesOf( flat.slice( open + 1, end - 1 ), where, head )
			);
			at = end;
			continue;
		}
		const close = flat.indexOf( '}', open );
		rules.push( {
			media,
			selectors: head
				.split( ',' )
				.map( ( s ) => s.trim().replace( /\s+/g, ' ' ) ),
			declarations: flat
				.slice( open + 1, close )
				.split( ';' )
				.map( ( d ) => d.trim() )
				.filter( Boolean )
				.map( ( d ) => {
					const colon = d.indexOf( ':' );
					return [
						d.slice( 0, colon ).trim(),
						d
							.slice( colon + 1 )
							.trim()
							.replace( /\s+/g, ' ' ),
					];
				} ),
		} );
		at = close + 1;
	}
	return rules;
}

/**
 * One of our selectors as core's, with an extra condition on the element core's classes are on
 * (an override's `:not()`).
 *
 * @param {Object} map      The primitive's map.
 * @param {string} selector Ours.
 * @param {string} extra    Added to that element, before any state.
 * @param {string} where    Its file, for errors.
 */
function coreSelector( map, selector, extra, where ) {
	const match = new RegExp(
		`^([a-z]*)\\.${ map.className }((?:\\[[^\\]]+\\])*)((?::[a-z-]+)*)(.*)$`
	).exec( selector );
	// The Button's rules are all on its link: nothing may follow.
	if ( ! match || ( ! map.root && ( match[ 1 ] || match[ 4 ] ) ) ) {
		throw new Error( `${ where }: no core selector for "${ selector }".` );
	}
	const [ , element, attributes, state, rest ] = match;
	const to = [ ...attributes.matchAll( /\[([^\]]+)\]/g ) ].map(
		( [ , attribute ] ) => {
			const found = map.attributes[ attribute ];
			if ( ! found ) {
				throw new Error(
					`${ where }: no core class for [${ attribute }] in "${ selector }".`
				);
			}
			return found;
		}
	);
	if ( map.root ) {
		// UPSTREAM: core's per-block CSS loads after the theme's stylesheet, with selectors as
		// specific as ours (`.wp-block-table td`, `.wp-block-quote cite`), so it won every tie.
		const block = map.outrankCore ? map.root.repeat( 2 ) : map.root;
		return `${ element }${ block }${ to.join( '' ) }${ extra }${ state }${ rest }`;
	}
	const wrapper = map.wrapper + to.map( ( t ) => t.wrapper ?? '' ).join( '' );
	const link = map.link + to.map( ( t ) => t.link ?? '' ).join( '' );
	return `${ wrapper } > ${ link }${ extra }${ state }`;
}

/**
 * A root rule's declarations for WordPress, where the layout sets a block's top and bottom
 * margins: those are dropped, and `margin: 0` keeps only its sides.
 *
 * @param {string[][]} declarations Property and value pairs.
 * @param {string}     where        Its file and rule, for errors.
 */
function withoutBlockMargins( declarations, where ) {
	return declarations.flatMap( ( [ property, value ] ) => {
		if ( /^margin-(block|top|bottom)/.test( property ) ) {
			return [];
		}
		if ( property === 'margin' ) {
			if ( value !== '0' ) {
				throw new Error(
					`${ where }: margin "${ value }" on the block; write its sides apart.`
				);
			}
			return [ [ 'margin-inline', '0' ] ];
		}
		return [ [ property, value ] ];
	} );
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
	const overrides = map.overrides ?? [ 'color', 'background-color' ];
	const out = [];
	for ( const { media, selectors, declarations } of rulesOf(
		source,
		map.source
	) ) {
		const where = `${ map.source }: ${ selectors.join( ', ' ) }`;
		// A rule on the block itself, with nothing after our class and its attributes.
		const onBlock = selectors.every( ( s ) =>
			new RegExp( `^[a-z]*\\.${ map.className }(\\[[^\\]]+\\])*$` ).test(
				s
			)
		);
		// Each override's declarations get their own rule; the rest share one.
		const groups = new Map();
		for ( const [ property, value ] of map.root && onBlock
			? withoutBlockMargins( declarations, where )
			: declarations ) {
			if ( map.skip?.includes( property ) ) {
				continue;
			}
			const extra = overrides.includes( property )
				? OVERRIDES[ property ]
				: '';
			if ( ! groups.has( extra ) ) {
				groups.set( extra, [] );
			}
			groups
				.get( extra )
				.push( [ property, themeValue( tokens, value, where ) ] );
		}
		const indent = media ? '\t' : '';
		for ( const [ extra, decls ] of groups ) {
			const rule = `${ indent }${ selectors
				.map( ( s ) => coreSelector( map, s, extra, map.source ) )
				.join( `,\n${ indent }` ) } {\n${ decls
				.map( ( [ p, v ] ) => `${ indent }\t${ p }: ${ v };` )
				.join( '\n' ) }\n${ indent }}\n`;
			out.push( media ? `${ media } {\n${ rule }}\n` : rule );
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
