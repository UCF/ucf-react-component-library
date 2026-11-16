/**
 * `@ucf/components/section-nav`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as SectionNav, type SectionNavProps } from './SectionNav.tsx';

// Its pieces, for a site that builds its own

export { PARTS as SECTION_NAV_PARTS } from './SectionNav.parts.ts';
export { PRESETS as SECTION_NAV_PRESETS } from './SectionNav.presets.ts';

// Its behavior, for a site to run from an effect: the menu button and the section in view
export { enhanceSectionNav } from './behavior.ts';
