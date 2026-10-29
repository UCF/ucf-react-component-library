/**
 * CONTEXT: the sample client answers the way the real one does, so stories show real behavior.
 */
import { expect, test } from 'vitest';

import { createSampleClient } from './sample-client.ts';

const client = createSampleClient( { delay: 0 } );

test( 'offers interests for each default program type', async () => {
	for ( const type of [ 'bachelor', 'master', 'doctorate' ] ) {
		expect( ( await client.getInterests( type ) ).length ).toBeGreaterThan(
			0
		);
	}
} );

test( 'merges several interests into one list, sorted by title', async () => {
	const one = await client.getDegrees( 'bachelor', [ 'psychology-general' ] );
	const degrees = await client.getDegrees( 'bachelor', [
		'psychology-general',
		'biology-general',
	] );
	const titles = degrees.map( ( d ) => d.title );

	expect( degrees.length ).toBeGreaterThan( one.length );
	expect( titles ).toEqual(
		[ ...titles ].sort( ( a, b ) => a.localeCompare( b ) )
	);
} );

test( 'fails every request when told to', async () => {
	await expect(
		createSampleClient( { delay: 0, fail: true } ).getProgramTypes()
	).rejects.toThrow();
} );
