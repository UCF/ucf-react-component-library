/**
 * `@ucf/components/card`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as Card, type CardProps } from './Card.tsx';

// Its pieces, for a site that builds its own

export { PARTS as CARD_PARTS } from './frame/parts.ts';
export { PRESETS as CARD_PRESETS } from './frame/presets.ts';
