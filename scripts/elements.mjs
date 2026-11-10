/**
 * CONTEXT: tokens/elements.json, the element styles (body copy, headings, links, captions), in
 * the two forms its hosts read:
 *
 *   themeStyles()   theme.json `styles` (`typography` and `elements`), for the block theme's kit.
 *                   References become --wp--preset--* and --wp--custom--*; a role becomes
 *                   `var(--ucf-link, var(--wp--preset--color--horizon-deep))`, the Light
 *                   composition's color as the fallback, as the theme writes them. `css` entries
 *                   are left out: theme.json can't express them.
 *   elementsCss()   dist/tokens/elements.css, for React hosts: the same styles and the `css`
 *                   entries, scoped to a Section or `.ucf-elements`, at zero specificity.
 *
 * SYNC: elements.json's shape is theme.json's (`typography.fontSize`, `color.text`, `:hover`).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { compositions, root, target, treatments, wpName } from './tokens.mjs';

/** The element styles, as written. */
export function loadElements() {
	return JSON.parse(
		readFileSync( path.join( root, 'tokens/elements.json' ), 'utf8' )
	);
}

// theme.json's style keys, as CSS properties. UPSTREAM: the ones elements.json uses; add a row
// when an element needs another.
const CSS_PROPERTY = {
	'typography.fontFamily': 'font-family',
	'typography.fontSize': 'font-size',
	'typography.fontWeight': 'font-weight',
	'typography.letterSpacing': 'letter-spacing',
	'typography.lineHeight': 'line-height',
	'typography.textTransform': 'text-transform',
	'typography.textDecoration': 'text-decoration',
	'color.text': 'color',
	'color.background': 'background-color',
};

// What an element is in plain HTML, for React hosts. SYNC: WordPress's own element selectors
// (theme.json `elements`). WHY `ucf-` links left out: a component that styles its own links does
// so with its class, and the hover rule would otherwise reach it. The theme excludes them too.
const SELECTOR = {
	heading: 'h1, h2, h3, h4, h5, h6',
	h1: 'h1',
	h2: 'h2',
	h3: 'h3',
	h4: 'h4',
	h5: 'h5',
	h6: 'h6',
	link: 'a:not([class*="ucf-"])',
	caption: 'figcaption',
};

// WHY scoped to a Section or `.ucf-elements`: a host page has chrome of its own (a header, the
// Puck editor's interface) that these must not restyle. WHY `:where()`: zero specificity, so a
// component's own class always wins, as theme.json's element styles sit under every block's.
const SCOPE = ':where(.ucf-section, .ucf-elements)';

const REFERENCES = /\{([^}]+)\}/g;
const isMeta = ( key ) => key.startsWith( '$' );

/**
 * One value with its references resolved.
 *
 * @param {Object} tokens The tokens (tokens.json).
 * @param {string} value  As written: `{font-size.body}`, `{role.link}` or a plain value.
 * @param {string} where  Where it was written, for the error.
 * @param {string} host   `ucf` (React hosts) or `wp` (the theme).
 */
function resolve( tokens, value, where, host ) {
	return String( value ).replace( REFERENCES, ( reference, name ) => {
		const [ group, slug ] = name.split( '.' );
		if ( group === 'role' ) {
			const fallback = roleFallback( tokens, slug, where );
			return host === 'ucf'
				? `var(--ucf-${ slug })`
				: `var(--ucf-${ slug }, var(${ wpName( 'color', fallback ) }))`;
		}
		// target() fails the build for a reference to no token.
		const token = target( tokens, reference, where );
		return host === 'ucf'
			? `var(--ucf-${ group }-${ token.slug })`
			: `var(${ wpName( group, token.slug ) })`;
	} );
}

/**
 * The color a role has outside any section: the Light composition's. A role no treatment has
 * fails the build.
 *
 * @param {Object} tokens The tokens.
 * @param {string} role   A role's name.
 * @param {string} where  Where it was named, for the error.
 */
export function roleFallback( tokens, role, where ) {
	const light = compositions( tokens ).find( ( c ) => c.name === 'light' );
	const treatment = treatments( tokens ).find(
		( t ) => t.name === light.treatment
	);
	const found = treatment.roles.find( ( r ) => r.role === role );
	if ( ! found ) {
		throw new Error(
			`${ where } names {role.${ role }}, which no treatment has.`
		);
	}
	return target( tokens, found.reference, where ).slug;
}

/**
 * A style in theme.json's shape, with its references resolved for one host, `css` left out.
 *
 * @param {Object} tokens The tokens.
 * @param {Object} style  As written in elements.json.
 * @param {string} where  Its path, for errors.
 * @param {string} host   `ucf` or `wp`.
 */
function themeStyle( tokens, style, where, host ) {
	return Object.fromEntries(
		Object.entries( style )
			.filter( ( [ key ] ) => ! isMeta( key ) && key !== 'css' )
			.map( ( [ key, value ] ) => [
				key,
				typeof value === 'object'
					? themeStyle( tokens, value, `${ where }.${ key }`, host )
					: resolve( tokens, value, `${ where }.${ key }`, host ),
			] )
	);
}

/**
 * theme.json `styles` for the theme's kit: `typography` (the page's) and `elements`.
 *
 * @param {Object} tokens   The tokens.
 * @param {Object} elements The element styles (elements.json).
 */
export function themeStyles( tokens, elements = loadElements() ) {
	return {
		typography: themeStyle( tokens, elements.root, 'elements.root', 'wp' )
			.typography,
		elements: Object.fromEntries(
			Object.entries( elements.elements ).map( ( [ name, style ] ) => [
				name,
				themeStyle( tokens, style, `elements.${ name }`, 'wp' ),
			] )
		),
	};
}

/**
 * One style's CSS declarations: its theme.json properties, then its `css` entries.
 *
 * @param {Object} tokens The tokens.
 * @param {Object} style  As written in elements.json.
 * @param {string} where  Its path, for errors.
 */
function declarations( tokens, style, where ) {
	const out = [];
	for ( const [ group, values ] of Object.entries( style ) ) {
		if ( isMeta( group ) || group === 'css' || group.startsWith( ':' ) ) {
			continue;
		}
		for ( const [ key, value ] of Object.entries( values ) ) {
			const property = CSS_PROPERTY[ `${ group }.${ key }` ];
			if ( ! property ) {
				throw new Error(
					`${ where }.${ group }.${ key } has no CSS property in scripts/elements.mjs.`
				);
			}
			out.push( [
				property,
				resolve(
					tokens,
					value,
					`${ where }.${ group }.${ key }`,
					'ucf'
				),
			] );
		}
	}
	for ( const [ property, value ] of Object.entries( style.css ?? {} ) ) {
		if ( ! isMeta( property ) ) {
			out.push( [
				property,
				resolve( tokens, value, `${ where }.css.${ property }`, 'ucf' ),
			] );
		}
	}
	return out;
}

const rule = ( selector, decls, note ) =>
	( note ? `/* ${ note } */\n` : '' ) +
	`${ selector } {\n${ decls
		.map( ( [ property, value ] ) => `\t${ property }: ${ value };` )
		.join( '\n' ) }\n}\n`;

/**
 * dist/tokens/elements.css: the element styles for React hosts.
 *
 * @param {Object} tokens   The tokens.
 * @param {Object} elements The element styles (elements.json).
 */
export function elementsCss( tokens, elements = loadElements() ) {
	const rules = [
		rule( SCOPE, declarations( tokens, elements.root, 'elements.root' ) ),
	];
	for ( const [ name, style ] of Object.entries( elements.elements ) ) {
		const selector = SELECTOR[ name ];
		if ( ! selector ) {
			throw new Error(
				`elements.${ name } has no selector in scripts/elements.mjs.`
			);
		}
		const note = style.$description ?? style.css?.$description;
		rules.push(
			rule(
				`${ SCOPE } :where(${ selector })`,
				declarations( tokens, style, `elements.${ name }` ),
				note
			)
		);
		for ( const [ state, stateStyle ] of Object.entries( style ) ) {
			if ( state.startsWith( ':' ) ) {
				rules.push(
					rule(
						`${ SCOPE } :where(${ selector })${ state }`,
						declarations(
							tokens,
							stateStyle,
							`elements.${ name }.${ state }`
						),
						stateStyle.$description
					)
				);
			}
		}
	}
	for ( const [ selector, style ] of Object.entries( elements.text ) ) {
		if ( ! isMeta( selector ) ) {
			rules.push(
				rule(
					`${ SCOPE } :where(${ selector })`,
					Object.entries( style )
						.filter( ( [ property ] ) => ! isMeta( property ) )
						.map( ( [ property, value ] ) => [
							property,
							resolve(
								tokens,
								value,
								`elements.text.${ selector }`,
								'ucf'
							),
						] ),
					style.$description
				)
			);
		}
	}
	return rules.join( '\n' );
}
