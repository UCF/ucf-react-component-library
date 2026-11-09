/**
 * `npm run sync:blocks`: writes each component's block.json `attributes` from its props
 * (`{Name}.props.ts`), so no one writes an attribute by hand. `--check` changes nothing and lists
 * the files that are out of date.
 *
 * WHY block.json stays a file on disk, and only its attributes are written: PHP registers the
 * block from it before any script runs, and it's where a WordPress developer looks. The rest of it
 * (description, keywords, supports) is still written by hand.
 * WHY a prop that's gone is reported: saved posts still have it, so removing one needs a block
 * deprecation (docs/architecture.md, "Changing a content component's markup").
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Attributes WordPress adds for a block's `supports`, kept as they are: not props.
// SYNC: WORDPRESS_ONLY in integrations/tests/parity.test.tsx.
const WORDPRESS_OWN = new Set( [ 'align' ] );

/**
 * A block.json with its attributes written from a component's props.
 *
 * @param {Object} json       The block.json, parsed.
 * @param {Object} attributes From blockAttributes(): each prop's type and default, in order.
 * @return {{ json: Object, removed: string[] }} The new block.json, and attributes no prop has.
 * New props go last; the rest keep their place.
 */
export function syncAttributes( json, attributes ) {
	const current = json.attributes ?? {};
	const kept = ( key ) => key in attributes || WORDPRESS_OWN.has( key );
	const removed = Object.keys( current ).filter( ( key ) => ! kept( key ) );
	// WHY the current order first, new props after: WordPress writes a block's attributes into
	// each saved post in this order, so moving one would change what new saves store.
	const order = [
		...Object.keys( current ).filter( kept ),
		...Object.keys( attributes ).filter( ( key ) => ! ( key in current ) ),
	];
	return {
		json: {
			...json,
			attributes: Object.fromEntries(
				order.map( ( key ) => [
					key,
					attributes[ key ] ?? current[ key ],
				] )
			),
		},
		removed,
	};
}

/**
 * Every component with props, and its block.json.
 *
 * @param {string} root The repo.
 * @return {{ props: string, blockJson: string }[]} Absolute paths.
 */
function components( root ) {
	return [ 'content', 'interactive' ].flatMap( ( bucket ) => {
		const dir = path.join( root, 'components', bucket );
		if ( ! existsSync( dir ) ) {
			return [];
		}
		return readdirSync( dir ).flatMap( ( name ) => {
			const folder = path.join( dir, name );
			const props = existsSync( folder )
				? readdirSync( folder ).find( ( file ) =>
						file.endsWith( '.props.ts' )
					)
				: undefined;
			const blockJson = path.join( folder, 'integrations/wp/block.json' );
			return props && existsSync( blockJson )
				? [ { props: path.join( folder, props ), blockJson } ]
				: [];
		} );
	} );
}

/**
 * Sync every component's block.json.
 *
 * @param {string}  root          The repo.
 * @param {Object}  options       How.
 * @param {boolean} options.check List what's out of date; write nothing.
 * @return {Promise<{ file: string, removed: string[] }[]>} The files that changed (or would).
 */
export async function syncBlocks( root, { check = false } = {} ) {
	const prettier = await import( 'prettier' );
	const { blockAttributes } = await import(
		pathToFileURL( path.join( root, 'integrations/wp/attributes.ts' ) )
	);
	const changed = [];
	for ( const { props, blockJson } of components( root ) ) {
		const { PROPS } = await import( pathToFileURL( props ) );
		const before = readFileSync( blockJson, 'utf8' );
		const { json, removed } = syncAttributes(
			JSON.parse( before ),
			blockAttributes( PROPS )
		);
		const after = await prettier.format(
			JSON.stringify( json, null, '\t' ),
			{
				...( await prettier.resolveConfig( blockJson ) ),
				filepath: blockJson,
			}
		);
		if ( after !== before ) {
			changed.push( { file: path.relative( root, blockJson ), removed } );
			if ( ! check ) {
				writeFileSync( blockJson, after );
			}
		}
	}
	return changed;
}

if ( process.argv[ 1 ] === fileURLToPath( import.meta.url ) ) {
	const root = path.resolve(
		path.dirname( fileURLToPath( import.meta.url ) ),
		'..'
	);
	const check = process.argv.includes( '--check' );
	const changed = await syncBlocks( root, { check } );
	for ( const { file, removed } of changed ) {
		console.log( `${ check ? 'Out of date' : 'Updated' }: ${ file }` );
		for ( const key of removed ) {
			console.warn(
				`  "${ key }" is no longer a prop. Saved posts still have it: add a block deprecation.`
			);
		}
	}
	if ( ! changed.length ) {
		console.log( 'Every block.json matches its props.' );
	}
	process.exitCode = check && changed.length ? 1 : 0;
}
