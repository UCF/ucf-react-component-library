/**
 * scripts/sync-blocks.mjs: block.json's attributes come from each component's props.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import { syncAttributes, syncBlocks } from './sync-blocks.mjs';

const root = path.resolve(
	path.dirname( fileURLToPath( import.meta.url ) ),
	'..'
);

describe( 'syncAttributes', () => {
	const json = {
		name: 'ucf-content/x',
		description: 'Written by hand.',
		attributes: {
			old: { type: 'string', default: '' },
			align: { type: 'string', default: 'full' },
			rule: { type: 'string', default: 'top' },
		},
	};
	const { json: synced, removed } = syncAttributes( json, {
		rule: { type: 'string', default: 'left' },
		size: { type: 'string', default: 'm' },
	} );

	// WHY the order kept: WordPress writes attributes into saved posts in block.json's order.
	test( 'writes each prop, keeps the order, adds new props last, and keeps the rest', () => {
		expect( synced.description ).toBe( 'Written by hand.' );
		expect( Object.keys( synced.attributes ) ).toEqual( [
			'align',
			'rule',
			'size',
		] );
		expect( synced.attributes.rule.default ).toBe( 'left' );
	} );

	// WHY: saved posts still have a removed prop, so it needs a deprecation, not a quiet delete.
	test( 'reports an attribute no prop has, and keeps WordPress’s own', () => {
		expect( removed ).toEqual( [ 'old' ] );
		expect( synced.attributes.align ).toEqual( {
			type: 'string',
			default: 'full',
		} );
	} );
} );

test( 'every block.json in the repo matches its props', async () => {
	expect( await syncBlocks( root, { check: true } ) ).toEqual( [] );
} );
