/**
 * CONTEXT: the Section Nav in the block editor. Empty, it fills from the page's anchored
 * Sections; after that, "Update from sections" refreshes them.
 *
 * WHY not always follow the page: it would undo the editor's own order, labels and removals.
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

import type { Link } from '@/core/hosts/prop-definitions';
import { blockEdit } from '@/core/hosts/wordpress/block';
import { LinkTargets } from '@/core/hosts/wordpress/controls/links-control';
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
 * The page's Section links.
 * WHY build links in useMemo: built inside useSelect they'd be new objects on every update.
 */
function usePageSections(): Link[] {
	const sections = useSelect(
		( select ) =>
			pageSections(
				// UPSTREAM: the store's block type is wider than BlockNode.
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
								'Adds newly anchored Sections and removes ones that lost their anchor. Your text changes are kept.',
								'ucf-content'
							)
						: __(
								'No Section on this page has an HTML anchor yet.',
								'ucf-content'
							) }
				</p>
				<Button
					variant="secondary"
					// WHY with links but no Sections: updating clears links that lost their anchor.
					disabled={ sections.length === 0 && links.length === 0 }
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

	// WHY no placeholder: an empty bar keeps its height and can be selected (style.css).
	// The Links field's Section picker reads the page's Sections from LinkTargets.
	return (
		<LinkTargets.Provider value={ sections }>
			{ sidebar }
			<Edit { ...props } />
		</LinkTargets.Provider>
	);
}
