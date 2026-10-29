/**
 * CONTEXT: a temporary stand-in for a real release. Collects every built output into
 * temp-release/, one folder per place it is used, for `npm run release:temp` (which builds
 * first). Hand the folder, or one of its subfolders, to whoever is adding the components to a
 * site.
 *
 *   temp-release/wordpress/{plugin}.zip     upload under Plugins → Add New → Upload
 *   temp-release/react/ucf-components-{version}.tgz   `npm install ./ucf-components-{version}.tgz`
 *   temp-release/theme/                     the block theme's token kit, for its tokens/ folder
 *   temp-release/README.md                  the same, for whoever receives the folder
 *
 * WHY a folder and not a publish: how the plugins and package will be distributed is not
 * decided yet (docs/todo.md). This makes each output usable anywhere in the meantime. Replace it
 * (and the "temp" names) once there is a release pipeline.
 * WHY temp-release/ is outside dist/: dist/ is the npm package, so anything in it would be packed
 * into the .tgz, and `npm run build:package` empties it.
 *
 * UPSTREAM: uses the system `zip` command, present on macOS and on GitHub's Linux runners.
 */
import { execFileSync } from 'node:child_process';
import {
	cpSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire( import.meta.url );
const { root, getPlugins } = require( './plugins.cjs' );

const out = path.join( root, 'temp-release' );
rmSync( out, { recursive: true, force: true } );

// WordPress: each zip holds one folder named for the plugin, which is what WordPress's plugin
// uploader expects: the main PHP file and build/. plugin.json is left out; it only tells the
// build what goes in.
const wordpress = path.join( out, 'wordpress' );
mkdirSync( wordpress, { recursive: true } );
const plugins = getPlugins();
for ( const plugin of plugins ) {
	execFileSync(
		'zip',
		[
			'-rq',
			path.join( wordpress, `${ plugin.name }.zip` ),
			plugin.name,
			'-x',
			`${ plugin.name }/plugin.json`,
			'*.DS_Store',
		],
		{ cwd: path.dirname( plugin.dir ), stdio: 'inherit' }
	);
}

// React: the exact file `npm publish` would upload, so installing it matches a published install.
const react = path.join( out, 'react' );
mkdirSync( react, { recursive: true } );
execFileSync( 'npm', [ 'pack', '--silent', '--pack-destination', react ], {
	cwd: root,
	stdio: [ 'ignore', 'ignore', 'inherit' ],
} );

// Block theme.
cpSync( path.join( root, 'dist/theme' ), path.join( out, 'theme' ), {
	recursive: true,
} );

const { version } = JSON.parse(
	readFileSync( path.join( root, 'package.json' ), 'utf8' )
);
const tgz = `ucf-components-${ version }.tgz`;

writeFileSync(
	path.join( out, 'README.md' ),
	`# UCF components ${ version } (temporary build)

> **Temporary.** These files were built by hand from ucf-react-component-library with
> \`npm run release:temp\`, not published. They stand in until the plugins and npm package have a
> real release. Expect them to be replaced, and don't treat the version number as a promise.

Each folder is for one kind of site.

## wordpress/

${ plugins
	.map( ( p ) => `- \`${ p.name }.zip\`: ${ p.blocks.join( ', ' ) }` )
	.join( '\n' ) }

Upload under **Plugins → Add New → Upload**, or unzip into \`wp-content/plugins/\`. Activate,
then add blocks from the **UCF** category of the inserter.

## react/

\`${ tgz }\` is the \`@ucf/components\` npm package. Copy it into the site and run:

\`\`\`sh
npm install ./${ tgz }
\`\`\`

Then import components and the one stylesheet:

\`\`\`tsx
import { Stat } from '@ucf/components/stat';
import '@ucf/components/ucf.css';
\`\`\`

The site loads the UCF fonts (Oswald, Montserrat, Roboto Mono). Puck sites add
\`@ucf/components/{name}/puck\` to their \`config.components\`.

## theme/

The block theme's token kit. Copy these files into the theme's \`tokens/\` folder, then run its
\`npm run build\`. Its \`npm run check:tokens\` fails while its \`theme.json\` disagrees with the kit.
`
);

console.log( `Wrote ${ path.relative( root, out ) }/:` );
for ( const plugin of plugins ) {
	console.log( `  wordpress/${ plugin.name }.zip` );
}
console.log( `  react/${ tgz }\n  theme/\n  README.md` );
