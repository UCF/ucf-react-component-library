/**
 * CONTEXT: zips each built plugin to dist/plugins/{plugin}.zip, ready to upload to a WordPress
 * site. Run through `npm run package:plugins`, which builds the plugins first.
 *
 * Each zip holds one folder named for the plugin, which is what WordPress's plugin uploader
 * expects: the main PHP file and build/. plugin.json is left out; it only tells the build what
 * goes in.
 *
 * UPSTREAM: uses the system `zip` command, present on macOS and on GitHub's Linux runners.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire( import.meta.url );
const { root, getPlugins } = require( './plugins.cjs' );

const out = path.join( root, 'dist/plugins' );
mkdirSync( out, { recursive: true } );

for ( const plugin of getPlugins() ) {
	const zip = path.join( out, `${ plugin.name }.zip` );
	rmSync( zip, { force: true } );
	execFileSync(
		'zip',
		[
			'-rq',
			zip,
			plugin.name,
			'-x',
			`${ plugin.name }/plugin.json`,
			'*.DS_Store',
		],
		{ cwd: path.dirname( plugin.dir ), stdio: 'inherit' }
	);
	console.log( `Wrote dist/plugins/${ plugin.name }.zip` );
}
