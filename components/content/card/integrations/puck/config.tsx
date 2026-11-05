/** The Card in Puck, made from its definition (integrations/puck/config.tsx). */
import { puckConfig } from '../../../../../integrations/puck/config.tsx';
import { card } from '../../Card.definition.ts';

const { config, TEMPLATE, withTemplate, withPreset } = puckConfig( card );

export default config;
export { TEMPLATE, withTemplate, withPreset };

/** @deprecated Use withPreset(). Kept while ucf-puck-demo imports it. */
export const withVariation = withPreset;
