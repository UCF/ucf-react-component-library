/**
 * `@ucf/components/card`. SYNC: docs/architecture.md, "What a component exports".
 */
import {
	presetComponent,
	type PresetComponent,
	type WithPresetsProps,
} from '../../../integrations/react/component.tsx';
import { card } from './Card.definition.ts';
import type { PARTS } from './Card.parts.ts';
import type { CardProps } from './Card.tsx';

// The component

/** The Card's props: the frame's, plus `preset`, `content` and `sample`. */
export type CardPresetProps = WithPresetsProps< CardProps, typeof PARTS >;

/** `<Card preset="pathway" content={ { eyebrow: 'Transfer' } } />`, or any content inside. */
export const Card: PresetComponent< CardPresetProps > = presetComponent( card );

export type { CardProps };

// Its pieces, for a site that builds its own

export { PARTS as CARD_PARTS } from './Card.parts.ts';
export { PRESETS as CARD_PRESETS } from './Card.presets.ts';
export { card as CARD_DEFINITION };
