/** The Section in Puck, from its port (core/hosts/puck/config.tsx): its props and a slot. */
import { puckConfig } from '@/core/hosts/puck/config';
import Section from '../../Section.tsx';

const { config, TEMPLATE, withTemplate } = puckConfig( Section );

export default config;
export { TEMPLATE, withTemplate };
