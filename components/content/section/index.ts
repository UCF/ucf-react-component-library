/**
 * `@ucf/components/section`. SYNC: docs/architecture.md, "What a component exports".
 */
export { default as Section, type SectionProps } from './Section.tsx';

// Its pieces, for a site that builds its own

export { PARTS as SECTION_PARTS } from './Section.parts.ts';
export { PRESETS as SECTION_PRESETS } from './Section.presets.ts';
export {
	COMPOSITIONS,
	type Composition,
} from '../../../integrations/schema/compositions.ts';
