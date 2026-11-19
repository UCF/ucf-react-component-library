/**
 * CONTEXT: the Section Nav in Puck.
 *
 *   config               links typed by hand
 *   withPageSections()   links filled from the page's Sections:
 *
 *     import { AutoField, Button, createUsePuck, FieldLabel } from '@puckeditor/core';
 *
 *     const usePuck = createUsePuck();
 *     withPageSections(
 *       () => usePuck( ( puck ) => puck.appState.data ),
 *       { AutoField, FieldLabel, Button }
 *     );
 *
 * WHY the site passes these in: the library doesn't import Puck.
 */
import { useMemo } from 'react';

import { puckConfig } from '@/core/hosts/puck/config';
import type { PuckArrayField, PuckControls } from '@/core/hosts/puck/types';
import type { Link } from '@/core/hosts/prop-definitions';
import SectionNav from '../../SectionNav.tsx';
import { linksField } from './links-field.tsx';
import {
	puckSectionLinks,
	type PuckPage,
	type SectionKeys,
} from './section-links.ts';

const { config } = puckConfig( SectionNav );

/**
 * The config, with links filled from Sections that have an HTML anchor.
 *
 * @param usePage A hook returning Puck's page data.
 * @param puck    Puck's `AutoField`, `FieldLabel` and `Button`.
 * @param keys    The site's component keys for Section and Heading.
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
				// WHY the cast: fieldOf() makes a links prop an array field.
				config.fields.links as PuckArrayField< Link >,
				useSections,
				puck
			),
		},
	};
};

export default config;
export { withPageSections };
