/**
 * The Accordion Item in Puck, from its port (integrations/puck/config.tsx): its question and
 * heading level as fields, and a slot for its answer.
 */
import { puckConfig } from '@/integrations/puck/config';
import AccordionItem from '../../AccordionItem.tsx';

const { config, withTemplate } = puckConfig( AccordionItem );

export default config;
export { withTemplate };
