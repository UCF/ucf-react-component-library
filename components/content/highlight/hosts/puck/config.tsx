/** The Highlight in Puck, from its port (core/hosts/puck/config.tsx). */
import { puckConfig } from '@/core/hosts/puck/config';
import Highlight from '../../Highlight.tsx';

const { config, TEMPLATE, withTemplate, withPreset } = puckConfig( Highlight );

export default config;
export { TEMPLATE, withTemplate, withPreset };

/** @deprecated Use withPreset(). Kept while ucf-puck-demo imports it. */
export const withVariation = withPreset;
