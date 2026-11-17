/**
 * `@ucf/components/primitives/accordion`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as Accordion, type AccordionProps } from './Accordion.tsx';

// Its pieces, for a site that builds its own

export { PROPS as ACCORDION_PROPS } from './Accordion.props.ts';
export { PARTS as ACCORDION_PARTS } from './Accordion.parts.ts';
export { PRESETS as ACCORDION_PRESETS } from './Accordion.presets.ts';

// Its script, for a site to run from an effect
export { enhanceAccordion } from './behavior.ts';
