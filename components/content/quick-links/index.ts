/**
 * `@ucf/components/quick-links`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as QuickLinks, type QuickLinksProps } from './QuickLinks.tsx';

// Its pieces, for a site that builds its own

export { PARTS as QUICK_LINKS_PARTS } from './frame/parts.ts';
export { PRESETS as QUICK_LINKS_PRESETS } from './frame/presets.ts';
