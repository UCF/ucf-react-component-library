/** The Card in Puck, from its port (core/hosts/puck/config.tsx). */
import { puckConfig } from '@/core/hosts/puck/config';
import Card from '../../Card.tsx';

const { config, TEMPLATE, withTemplate, withPreset } = puckConfig( Card );

export default config;
export { TEMPLATE, withTemplate, withPreset };

/** @deprecated Use withPreset(). Kept while ucf-puck-demo imports it. */
export const withVariation = withPreset;
