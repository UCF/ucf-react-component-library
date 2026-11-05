/** The Section in Puck, from its port (integrations/puck/config.tsx): its props and a slot. */
import { puckConfig } from '../../../../../integrations/puck/config.tsx';
import Section from '../../Section.tsx';

const { config, TEMPLATE, withTemplate } = puckConfig( Section );

export default config;
export { TEMPLATE, withTemplate };
