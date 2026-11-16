/**
 * The Section Nav in Puck, from its port (integrations/puck/config.tsx).
 *
 *   config               its links as Puck's array field, typed by hand
 *   withPageSections()   its links filled from the page's Sections, as in WordPress:
 *
 *     import { AutoField, Button, createUsePuck, FieldLabel } from '@puckeditor/core';
 *
 *     const usePuck = createUsePuck();
 *     withPageSections(
 *       () => usePuck( ( puck ) => puck.appState.data ),
 *       { AutoField, FieldLabel, Button }
 *     );
 *
 * WHY the site lends the hook and the controls: Puck shows a field none of the page, and this
 * library's Puck configs don't import Puck. WHY the keys: a Puck page names each component by
 * the key the site registered it under.
 */
import { useMemo } from 'react';

import { puckConfig } from '@/integrations/puck/config';
import type { PuckArrayField, PuckControls } from '@/integrations/puck/types';
import type { Link } from '@/integrations/schema/props';
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
 * @param puck    Puck's `AutoField`, `FieldLabel` and `Button`, which draw the field.
 * @param keys    The keys the site registered the Section and the Heading under.
 */
const withPageSections = (
	usePage: () => PuckPage,
	puck: PuckControls,
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
			links: linksField(
				// WHY the cast: puckFields() makes a links prop an array field (fieldOf()).
				config.fields.links as PuckArrayField< Link >,
				useSections,
				puck
			),
		},
	};
};

export default config;
export { withPageSections };
