/** CONTEXT: the Quick Links in Puck, from its port (core/hosts/puck/config.tsx): its tiles as an array field. */
import { puckConfig } from '@/core/hosts/puck/config';
import QuickLinks from '../../QuickLinks.tsx';

const { config } = puckConfig( QuickLinks );

export default config;
