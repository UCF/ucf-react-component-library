import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import Stat from '../../Stat.tsx';

/**
 * The saved inner element, with the blocks placed inside the Stat.
 *
 * @param props The inner element's props from Stat.
 */
function InnerBlocksContent( props: Record< string, unknown > ) {
	return <div { ...useInnerBlocksProps.save( props ) } />;
}

/**
 * The stored markup: the Stat, its inner blocks inside its inner element.
 */
export default function save() {
	return <Stat { ...useBlockProps.save() } innerAs={ InnerBlocksContent } />;
}
