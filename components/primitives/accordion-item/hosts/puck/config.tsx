/**
 * The Accordion Item in Puck, from its port (core/hosts/puck/config.tsx): its question and
 * heading level as fields, and a slot for its answer.
 */
import { puckConfig } from '@/core/hosts/puck/config';
import AccordionItem from '../../AccordionItem.tsx';

const { config, withTemplate } = puckConfig( AccordionItem );

export default config;
export { withTemplate };
