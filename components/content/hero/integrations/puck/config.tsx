/** The Hero in Puck, from its port (core/hosts/puck/config.tsx): its props and a slot. */
import { puckConfig } from '@/core/hosts/puck/config';
import Hero from '../../Hero.tsx';

const { config, TEMPLATE, withTemplate } = puckConfig( Hero );

export default config;
export { TEMPLATE, withTemplate };
