/**
 * `@ucf/components/section`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as Section, type SectionProps } from './Section.tsx';

// Its pieces, for a site that builds its own

export { PARTS as SECTION_PARTS } from './frame/Section.parts.ts';
export { PRESETS as SECTION_PRESETS } from './frame/Section.presets.ts';
export { COMPOSITIONS, type Composition } from '@/core/design/compositions';
