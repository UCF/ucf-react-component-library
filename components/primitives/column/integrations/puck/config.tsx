/**
 * The Column in Puck, from its port (integrations/puck/config.tsx): a slot for anything.
 *
 * `inColumns()` is how a host uses it beside withColumns() (the Columns's config): a Column holds
 * anything but another Column. WHY opt-in: it names the Column by the host's key.
 */
import { puckConfig } from '@/integrations/puck/config';
import type { PuckComponentConfig } from '@/integrations/puck/types';
import Column from '../../Column.tsx';

const { config, withTemplate } = puckConfig( Column );

type Stored = typeof config.defaultProps;

/**
 * The Column for a host that registers it under `column`: anything goes in but another Column.
 * FIX: a Column dropped on a Columns landed inside one of its Columns, a Column in a Column,
 * where it lays out as nothing. Only the Columns may hold a Column.
 *
 * @param column The key the host registered the Column under.
 */
const inColumns = ( column = 'Column' ): PuckComponentConfig< Stored > => ( {
	...config,
	fields: {
		...config.fields,
		blocks: { type: 'slot', disallow: [ column ] },
	} as PuckComponentConfig< Stored >[ 'fields' ],
} );

export default config;
export { withTemplate, inColumns };
