/**
 * CONTEXT: builds the npm package, `@ucf/components`, into dist/.
 *
 *   1. `tsc -p tsconfig.build.json` writes the JavaScript, the `.d.ts` type files and the
 *      example data, rewriting `./Stat.tsx` imports to `./Stat.js`.
 *   2. dist/ucf.css: the package's one stylesheet. dist/tokens/base.css (tokens, compositions,
 *      the component layer), then every component's style.css; tsc ignores CSS.
 *   3. dist/package.json marks the output as ES modules.
 *
 * WHY step 3 rather than `"type": "module"` in the root package.json: the root holds the
 * webpack, ESLint and Jest configs, which wp-scripts loads as CommonJS.
 */
import { execFileSync } from 'node:child_process';
import {
	existsSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname( path.dirname( fileURLToPath( import.meta.url ) ) );
const dist = path.join( root, 'dist' );

// WHY keep dist/tokens: build:tokens writes it, and running this alone should not delete it.
for ( const entry of existsSync( dist )
	? readdirSync( dist, { withFileTypes: true } )
	: [] ) {
	if ( entry.name !== 'tokens' ) {
		rmSync( path.join( dist, entry.name ), { recursive: true } );
	}
}

execFileSync(
	path.join( root, 'node_modules/.bin/tsc' ),
	[ '-p', 'tsconfig.build.json' ],
	{ cwd: root, stdio: 'inherit' }
);

// WHY one file: a site loads tokens, compositions, the component layer and every component's
// styles together anyway. One import replaces four, and nothing can be left out. The cost is
// every component's CSS on every page, small while the library is small; split it again by
// component if that stops being true.
const componentsDir = path.join( root, 'components' );
const parts = [ readFileSync( path.join( dist, 'tokens/base.css' ), 'utf8' ) ];
for ( const name of readdirSync( componentsDir ).sort() ) {
	const css = path.join( componentsDir, name, 'style.css' );
	if ( existsSync( css ) ) {
		parts.push(
			`\n/* ── components/${ name }/style.css ── */\n`,
			readFileSync( css, 'utf8' )
		);
	}
}
writeFileSync( path.join( dist, 'ucf.css' ), parts.join( '' ) );

writeFileSync(
	path.join( dist, 'package.json' ),
	JSON.stringify( { type: 'module' }, null, '\t' ) + '\n'
);

console.log( 'Built dist/ for @ucf/components.' );
