import { expect, test } from 'vitest';

import type { ProgramType } from '../types.ts';
import { programTypeCounts } from './programTypeCounts.ts';

const type = (
	slug: string,
	count: number,
	children: ProgramType[] = []
): ProgramType => ( {
	slug,
	name: slug,
	plural: `${ slug }s`,
	count,
	children,
} );

test( 'finds counts at any depth of the tree', () => {
	const counts = programTypeCounts( [
		type( 'undergraduate-program', 480, [
			type( 'bachelor', 254 ),
			type( 'minor', 143 ),
		] ),
		type( 'graduate-program', 429, [
			type( 'master', 233 ),
			type( 'doctorate', 87 ),
		] ),
		type( 'professional-program', 1 ),
	] );

	expect( counts.get( 'bachelor' ) ).toBe( 254 );
	expect( counts.get( 'master' ) ).toBe( 233 );
	expect( counts.get( 'doctorate' ) ).toBe( 87 );
	expect( counts.get( 'professional-program' ) ).toBe( 1 );
	expect( counts.get( 'missing' ) ).toBeUndefined();
} );
