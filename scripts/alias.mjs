/**
 * Teaches plain Node the `@/` alias, for scripts that load the TypeScript source directly
 * (scripts/sync-blocks.mjs reads each component's `{Name}.props.ts`). Import it before any
 * source file.
 *
 * SYNC: `@/` is the repo root, as tsconfig.json `paths` defines it (docs/architecture.md, "A
 * component's folder"). An `@/` import of a module has no ending, so this finds the file as
 * TypeScript does: the name as written (a `.css` or `.json`), then `.ts`, `.tsx`, and a folder's
 * `index.ts` or `index.tsx`.
 * UPSTREAM: Node runs the `.ts` files themselves by stripping their types; it only needs telling
 * where `@/` points. registerHooks() is Node's in-thread module hook (22.15+ and 23.5+).
 */
import { statSync } from 'node:fs';
import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'..'
);
const ENDINGS = [ '', '.ts', '.tsx', '/index.ts', '/index.tsx' ];

const isFile = ( file ) =>
	statSync( file, { throwIfNoEntry: false } )?.isFile();

registerHooks( {
	resolve( specifier, context, nextResolve ) {
		if ( specifier.startsWith( '@/' ) ) {
			const base = path.join( root, specifier.slice( 2 ) );
			const file = ENDINGS.map( ( ending ) => base + ending ).find(
				isFile
			);
			if ( file ) {
				return nextResolve( pathToFileURL( file ).href, context );
			}
		}
		return nextResolve( specifier, context );
	},
} );
