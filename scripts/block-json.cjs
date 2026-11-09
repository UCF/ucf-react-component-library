/**
 * Writes each block's block.json into the build, on every compilation.
 *
 * The shipped block.json points at the built `.js`, not the `.tsx` source, and carries a
 * `version` made from the block's built CSS.
 *
 * FIX: WordPress versions a block's stylesheet URL with block.json's `version`, or its own
 * version when there is none, so without one the URL never changed between builds and the
 * editor kept a cached copy. Scripts are fine: index.asset.php versions them.
 * FIX: the version is worked out per compilation, from the CSS that compilation emitted. Worked
 * out once when webpack loaded its config, a watching `npm start` or `npm run deploy:watch` kept
 * one URL for every rebuild. And block.json is emitted here, not by copy-webpack-plugin, which
 * caches a copy by its source file and so never re-emitted it for a CSS-only change.
 * WHY a hash of the CSS, not the time: an unchanged build keeps its URL, so browsers keep their
 * copy.
 */
const { createHash } = require( 'node:crypto' );
const { readFileSync } = require( 'node:fs' );

// UPSTREAM: block.json fields that point at a script wp-scripts should compile.
const SCRIPT_FIELDS = [ 'editorScript', 'script', 'viewScript' ];

const NAME = 'UcfBlockJsonPlugin';

/**
 * block.json as shipped: its scripts pointed at the built `.js`, and `version` set unless the
 * block sets its own.
 *
 * @param {Buffer|string} content block.json as written.
 * @param {string}        version The version for its styles.
 * @return {string} block.json as shipped.
 */
function toBuiltBlockJson( content, version ) {
	const blockJson = JSON.parse( content.toString() );
	blockJson.version ??= version;

	for ( const field of SCRIPT_FIELDS ) {
		if ( blockJson[ field ] ) {
			blockJson[ field ] = []
				.concat( blockJson[ field ] )
				.map( ( value ) => value.replace( /\.[jt]sx?$/, '.js' ) );
			if ( blockJson[ field ].length === 1 ) {
				blockJson[ field ] = blockJson[ field ][ 0 ];
			}
		}
	}

	return JSON.stringify( blockJson, null, '\t' ) + '\n';
}

/**
 * A block's style version: the package's version and a hash of the CSS built for it.
 *
 * @param {string}                  packageVersion package.json's version.
 * @param {Array<[string, Buffer]>} css            Each built CSS file's name and contents.
 * @return {string} The version.
 */
function styleVersion( packageVersion, css ) {
	const hash = createHash( 'sha256' );
	for ( const [ file, contents ] of [ ...css ].sort( ( [ a ], [ b ] ) =>
		a.localeCompare( b )
	) ) {
		hash.update( file ).update( contents );
	}
	return `${ packageVersion }-${ hash.digest( 'hex' ).slice( 0, 10 ) }`;
}

class BlockJsonPlugin {
	/**
	 * @param {Object}                   options
	 * @param {string[]}                 options.blocks         The plugin's block names; each builds to `{name}/`.
	 * @param {(name: string) => string} options.blockJsonOf    A block's name → its source block.json path.
	 * @param {string}                   options.packageVersion package.json's version.
	 */
	constructor( { blocks, blockJsonOf, packageVersion } ) {
		this.blocks = blocks;
		this.blockJsonOf = blockJsonOf;
		this.packageVersion = packageVersion;
	}

	apply( compiler ) {
		const { Compilation, sources } = compiler.webpack;
		compiler.hooks.thisCompilation.tap( NAME, ( compilation ) => {
			compilation.hooks.processAssets.tap(
				// WHY this stage: after CSS is minified, so the hash is of what ships.
				{
					name: NAME,
					stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
				},
				() => {
					for ( const name of this.blocks ) {
						const source = this.blockJsonOf( name );
						// WHY: a watch rebuilds when block.json itself changes.
						compilation.fileDependencies.add( source );
						const css = compilation
							.getAssets()
							.filter(
								( asset ) =>
									asset.name.startsWith( `${ name }/` ) &&
									asset.name.endsWith( '.css' )
							)
							.map( ( asset ) => [
								asset.name,
								asset.source.buffer(),
							] );
						compilation.emitAsset(
							`${ name }/block.json`,
							new sources.RawSource(
								toBuiltBlockJson(
									readFileSync( source ),
									styleVersion( this.packageVersion, css )
								)
							)
						);
					}
				}
			);
		} );
	}
}

module.exports = {
	BlockJsonPlugin,
	SCRIPT_FIELDS,
	styleVersion,
	toBuiltBlockJson,
};
