// @vitest-environment happy-dom
// WHY happy-dom: the block-editor store needs a `window`.
/** CONTEXT: integrations/wp/section-links.ts and utils/links.ts. */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock, registerBlockType } from '@wordpress/blocks';
import { createRegistry } from '@wordpress/data';
import { describe, expect, it } from 'vitest';

import {
	pageSections,
	sectionLinks,
	type BlockNode,
	type BlockSelectors,
} from '../integrations/wp/section-links.ts';
import { textOf, updateLinks } from '../utils/links.ts';

const block = (
	name: string,
	attributes: Record< string, unknown > = {},
	innerBlocks: BlockNode[] = []
): BlockNode => ( { name, attributes, innerBlocks } );
const section = ( anchor: string | undefined, inner: BlockNode[] = [] ) =>
	block( 'ucf-content/section', anchor ? { anchor } : {}, inner );
const heading = ( content: string ) => block( 'core/heading', { content } );

describe( 'pageSections', () => {
	// WHY the real store: the bug is in what its getBlocks() leaves out.
	registerBlockType( 'ucf-content/section', {
		title: 'Section',
		attributes: { anchor: { type: 'string' } },
		edit: () => null,
		save: () => null,
	} as never );
	registerBlockType( 'core/post-content', {
		title: 'Content',
		edit: () => null,
		save: () => null,
	} as never );

	/** A page shown with its template: Sections inside Post Content's inner blocks. */
	const templatePage = () => {
		const registry = createRegistry();
		registry.register( blockEditorStore );
		const editor = registry.dispatch( blockEditorStore );
		const content = createBlock( 'core/post-content' );
		editor.resetBlocks( [ content ] );
		editor.setHasControlledInnerBlocks( content.clientId, true );
		const overview = createBlock( 'ucf-content/section', {
			anchor: 'overview',
		} );
		const apply = createBlock( 'ucf-content/section', {
			anchor: 'apply',
		} );
		editor.replaceInnerBlocks( content.clientId, [ overview, apply ] );
		return { registry, apply };
	};
	const anchors = ( registry: ReturnType< typeof createRegistry > ) =>
		pageSections(
			registry.select( blockEditorStore ) as unknown as BlockSelectors
		).map( ( found ) => found.attributes.anchor );

	it( 'finds the Sections inside the template’s Post Content, in order', () => {
		expect( anchors( templatePage().registry ) ).toEqual( [
			'overview',
			'apply',
		] );
	} );

	it( 'sees a Section’s new anchor', () => {
		const { registry, apply } = templatePage();
		registry
			.dispatch( blockEditorStore )
			.updateBlockAttributes( apply.clientId, {
				anchor: 'how-to-apply',
			} );
		expect( anchors( registry ) ).toEqual( [ 'overview', 'how-to-apply' ] );
	} );
} );

describe( 'sectionLinks', () => {
	it( 'links each Section with an anchor, by its first heading, in order', () => {
		expect(
			sectionLinks( [
				section( 'overview', [
					heading( 'Overview' ),
					heading( 'Not this one' ),
				] ),
				section( undefined, [ heading( 'No anchor' ) ] ),
				section( 'apply', [ heading( 'Apply' ) ] ),
			] )
		).toEqual( [
			{ label: 'Overview', href: '#overview' },
			{ label: 'Apply', href: '#apply' },
		] );
	} );

	it( 'finds a heading inside other blocks, but not inside another Section', () => {
		expect(
			sectionLinks( [
				section( 'outer', [
					section( 'inner', [ heading( 'Inner' ) ] ),
					block( 'core/group', {}, [ heading( 'Outer' ) ] ),
				] ),
			] )
		).toEqual( [ { label: 'Outer', href: '#outer' } ] );
	} );

	it( 'labels a Section with no heading by its anchor', () => {
		expect( sectionLinks( [ section( 'faq' ) ] ) ).toEqual( [
			{ label: 'faq', href: '#faq' },
		] );
	} );
} );

describe( 'textOf', () => {
	it( 'drops tags, decodes entities and collapses spaces', () => {
		expect(
			textOf( '<strong>Tuition</strong> &amp;\n Aid&#8217;s&nbsp;&#x41;' )
		).toBe( 'Tuition & Aid’s A' );
	} );

	it( 'reads a RichTextData, which prints as its HTML', () => {
		expect( textOf( { toString: () => '<em>Careers</em>' } ) ).toBe(
			'Careers'
		);
	} );
} );

describe( 'updateLinks', () => {
	it( 'follows the page, keeping renamed text', () => {
		expect(
			updateLinks(
				[
					{ label: 'Costs', href: '#tuition' },
					{ label: 'Gone', href: '#old' },
					{ label: 'Apply', href: 'https://www.ucf.edu/apply/' },
				],
				[
					{ label: 'Overview', href: '#overview' },
					{ label: 'Tuition and Aid', href: '#tuition' },
				]
			)
		).toEqual( [
			{ label: 'Overview', href: '#overview' },
			{ label: 'Costs', href: '#tuition' },
		] );
	} );
} );
