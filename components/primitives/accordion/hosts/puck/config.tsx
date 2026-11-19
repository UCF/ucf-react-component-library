/**
 * The Accordion in Puck, from its port (core/hosts/puck/config.tsx): a slot for its items.
 *
 * `config` as it ships names no other component. `withItems()` is how a host uses it: only
 * Accordion Items go in, and a new one starts with two. WHY opt-in: those name the item by the
 * key the host registered it under, which the library can't know (as withTemplate() does).
 */
import { puckConfig } from '@/core/hosts/puck/config';
import type { PuckComponentConfig } from '@/core/hosts/puck/types';
import Accordion from '../../Accordion.tsx';

const { config, withTemplate } = puckConfig( Accordion );

type Stored = typeof config.defaultProps;

/**
 * The Accordion with its items managed, as core Accordion's are: only Accordion Items go in,
 * and a new one starts with two.
 *
 * @param item The key the host registered the Accordion Item under.
 */
const withItems = ( item = 'AccordionItem' ): PuckComponentConfig< Stored > => {
	// WHY no id in the template: Puck gives each inserted item its own.
	const empty = () => ( { type: item, props: { blocks: [] } } );
	const start = withTemplate( [ empty(), empty() ] );
	return {
		...start,
		fields: {
			...start.fields,
			blocks: { type: 'slot', allow: [ item ] },
		} as PuckComponentConfig< Stored >[ 'fields' ],
	};
};

export default config;
export { withTemplate, withItems };
