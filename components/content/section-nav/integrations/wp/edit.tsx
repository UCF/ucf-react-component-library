/**
 * The Section Nav's editor view: blockEdit()'s sidebar and markup, filled from the page.
 *
 * While it has no links, it takes one for each Section with an HTML anchor, and follows them as
 * they change. Once it has links, they are the editor's: "Update from sections" brings them up to
 * date with the page, keeping renamed text and links elsewhere (section-links.ts).
 * WHY not always following the page: an editor's own order, text and removals would be undone
 * on every change to a Section.
 */
import {
	InspectorControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import type { BlockEditProps } from '@wordpress/blocks';
import { Button, PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import type { Link } from '@/integrations/schema/props';
import { blockEdit } from '@/integrations/wp/block';
import SectionNav from '../../SectionNav.tsx';
import { updateLinks } from '../../utils/links.ts';
import {
	pageSections,
	sectionLinks,
	type BlockSelectors,
} from './section-links.ts';

type Attributes = { links?: readonly Link[] } & Record< string, unknown >;

const Edit = blockEdit( SectionNav );

/**
 * The page's Section links, from the editor's store.
 * WHY the Sections from useSelect and the links from useMemo: useSelect compares the Sections
 * one by one, and they stay the same objects while unchanged; links built inside it would be
 * new objects on every store update.
 */
function usePageSections(): Link[] {
	const sections = useSelect(
		( select ) =>
			pageSections(
				// UPSTREAM: the store's types name its own block type, wider than BlockNode.
				select( blockEditorStore ) as unknown as BlockSelectors
			),
		[]
	);
	return useMemo( () => sectionLinks( sections ), [ sections ] );
}

export default function SectionNavEdit( props: BlockEditProps< Attributes > ) {
	const { attributes, setAttributes } = props;
	const links = attributes.links ?? [];
	const sections = usePageSections();
	const empty = links.length === 0;

	useEffect( () => {
		if ( empty && sections.length > 0 ) {
			setAttributes( { links: sections } );
		}
	}, [ empty, sections, setAttributes ] );

	const sidebar = (
		<InspectorControls>
			<PanelBody title={ __( 'Sections', 'ucf-content' ) }>
				<p>
					{ sections.length > 0
						? __(
								'Updating adds Sections given an anchor since, and drops those that lost one. Renamed text and links elsewhere stay.',
								'ucf-content'
							)
						: __(
								'No Section on this page has an HTML anchor yet.',
								'ucf-content'
							) }
				</p>
				<Button
					variant="secondary"
					disabled={ sections.length === 0 }
					onClick={ () =>
						setAttributes( {
							links: updateLinks( links, sections ),
						} )
					}
				>
					{ __( 'Update from sections', 'ucf-content' ) }
				</Button>
			</PanelBody>
		</InspectorControls>
	);

	// WHY no placeholder while empty: the bar keeps its height (style.css), blank, so it can
	// be seen and selected as it is.
	return (
		<>
			{ sidebar }
			<Edit { ...props } />
		</>
	);
}
