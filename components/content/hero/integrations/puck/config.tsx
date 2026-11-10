/** The Hero in Puck, from its port (integrations/puck/config.tsx): its props and a slot. */
import { puckConfig } from '@/integrations/puck/config.js';
import Hero from '../../Hero.tsx';

const { config, TEMPLATE, withTemplate } = puckConfig( Hero );

export default config;
export { TEMPLATE, withTemplate };
