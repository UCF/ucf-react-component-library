/**
 * The Section Nav in Puck, from its port (integrations/puck/config.tsx).
 *
 *   config               its links as Puck's array field, typed by hand
 *   withPageSections()   its links filled from the page's Sections, as in WordPress:
 *
 *     const usePuck = createUsePuck();
 *     withPageSections( () => usePuck( ( puck ) => puck.appState.data ) );
 *
 * WHY the site lends the hook: Puck shows a field none of the page, and this library's Puck
 * configs don't import Puck. WHY the keys: a Puck page names each component by the key the site
 * registered it under.
 */
import { useMemo } from 'react';

import { puckConfig } from '@/integrations/puck/config';
import SectionNav from '../../SectionNav.tsx';
import { linksField } from './links-field.tsx';
import {
	puckSectionLinks,
	type PuckPage,
	type SectionKeys,
} from './section-links.ts';

const { config } = puckConfig( SectionNav );

/**
 * The Section Nav, its links filled from the page's Sections that have an HTML anchor.
 *
 * @param usePage A hook that returns Puck's page data, from inside Puck's editor.
 * @param keys    The keys the site registered the Section and the Heading under.
 */
const withPageSections = (
	usePage: () => PuckPage,
	keys: SectionKeys = { section: 'Section', heading: 'Heading' }
): typeof config => {
	const useSections = () => {
		const page = usePage();
		return useMemo( () => puckSectionLinks( page, keys ), [ page ] );
	};
	return {
		...config,
		fields: {
			...config.fields,
			links: linksField( config.fields.links.label, useSections ),
		},
	};
};

export default config;
export { withPageSections };
