/**
 * CONTEXT: builds the npm package, `@ucf/components`, into dist/.
 *
 *   1. `tsc -p tsconfig.build.json` writes the JavaScript and the `.d.ts` type files, rewriting
 * `./Highlight.tsx` imports to `./Highlight.js`, and tsc-alias turns `@/` imports into relative
 * ones. Then every example.json is copied beside them.
 *   2. dist/ucf.css: the package's one stylesheet. dist/tokens/base.css (tokens, compositions,
 *      the component layer), then every primitive's and component's style.css; tsc ignores CSS.
 *   3. dist/elements.css: the opt-in element styles (dist/tokens/elements.css, from
 *      tokens/elements.json).
 *   4. dist/package.json marks the output as ES modules.
 *   5. Every file package.json exports must exist, or the build fails.
 *
 * WHY step 3 rather than `"type": "module"` in the root package.json: the root holds the
 * webpack, ESLint and Jest configs, which wp-scripts loads as CommonJS.
 */
import { execFileSync } from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import plugins from './plugins.cjs';

const { componentDirs } = plugins;

const root = path.dirname( path.dirname( fileURLToPath( import.meta.url ) ) );
const dist = path.join( root, 'dist' );

// WHY keep these: build:tokens writes them, and running this alone should not delete them.
// FIX: keeping only tokens/ deleted the theme kit, which `npm run build` then shipped without.
const FROM_TOKENS = new Set( [ 'tokens', 'theme' ] );
for ( const entry of existsSync( dist )
	? readdirSync( dist, { withFileTypes: true } )
	: [] ) {
	if ( ! FROM_TOKENS.has( entry.name ) ) {
		rmSync( path.join( dist, entry.name ), { recursive: true } );
	}
}

execFileSync(
	path.join( root, 'node_modules/.bin/tsc' ),
	[ '-p', 'tsconfig.build.json' ],
	{ cwd: root, stdio: 'inherit' }
);
// WHY: tsc writes an `@/` import as it is, and nothing outside this repo knows the alias.
// tsc-alias rewrites each one, in the JavaScript and the type files, to a relative path.
execFileSync(
	path.join( root, 'node_modules/.bin/tsc-alias' ),
	[ '-p', 'tsconfig.build.json' ],
	{ cwd: root, stdio: 'inherit' }
);

// WHY one file: a site loads tokens, compositions, the component layer and every component's
// styles together anyway. One import replaces four, and nothing can be left out. The cost is
// every component's CSS on every page, small while the library is small; split it again by
// component if that stops being true.
// WHY primitives first: components are built from them, so a component's rule that adjusts a
// primitive inside it comes later and wins at equal specificity.
const parts = [ readFileSync( path.join( dist, 'tokens/base.css' ), 'utf8' ) ];
// Primitives, then every other component by name, whatever its bucket: a component's place in
// ucf.css doesn't change when it moves between content and interactive.
const ordered = [ ...componentDirs() ].sort(
	( [ a, x ], [ b, y ] ) =>
		Number( x.bucket !== 'primitives' ) -
			Number( y.bucket !== 'primitives' ) || a.localeCompare( b )
);
for ( const [ , { dir } ] of ordered ) {
	const css = path.join( dir, 'style.css' );
	if ( existsSync( css ) ) {
		const from = path.relative( root, css );
		parts.push(
			`\n/* ── ${ from.replace( /^components\//, '' ) } ── */\n`,
			readFileSync( css, 'utf8' )
		);
	}
}
writeFileSync( path.join( dist, 'ucf.css' ), parts.join( '' ) );

// WHY copied, not left to tsc: tsc writes a JSON file only when code imports it, and a frame's
// code doesn't read its example. Every example.json is a package export.
for ( const { dir } of componentDirs().values() ) {
	const example = path.join( dir, 'example.json' );
	if ( existsSync( example ) ) {
		copyFileSync(
			example,
			path.join( dist, path.relative( root, dir ), 'example.json' )
		);
	}
}

// WHY separate from ucf.css: opt-in. It styles plain elements, which a site with its own
// typography must be able to leave out. build:tokens writes it from tokens/elements.json.
copyFileSync(
	path.join( dist, 'tokens/elements.css' ),
	path.join( dist, 'elements.css' )
);

writeFileSync(
	path.join( dist, 'package.json' ),
	JSON.stringify( { type: 'module' }, null, '\t' ) + '\n'
);

// FIX: an export whose file the build never wrote. tsc copies a JSON file only when code
// imports it, so a frame whose code doesn't read its example.json shipped an export
// (`@ucf/components/highlight/example.json`) that pointed at nothing. Fail here, not in a site.
const targets = ( value ) =>
	typeof value === 'string'
		? [ value ]
		: Object.values( value ).flatMap( targets );
const missing = Object.entries(
	JSON.parse( readFileSync( path.join( root, 'package.json' ), 'utf8' ) )
		.exports
).flatMap( ( [ name, value ] ) =>
	targets( value )
		// A `*` export needs its folder, with something in it.
		.filter( ( target ) => {
			const file = path.join( root, target );
			return target.includes( '*' )
				? readdirSync( path.dirname( file ) ).length === 0
				: ! existsSync( file );
		} )
		.map( ( target ) => `${ name } → ${ target }` )
);
if ( missing.length ) {
	throw new Error(
		`package.json exports files the build didn't write:\n  ${ missing.join(
			'\n  '
		) }`
	);
}

console.log( 'Built dist/ for @ucf/components.' );
