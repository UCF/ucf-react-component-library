/**
 * CONTEXT: what a plain React site imports to render presets without a CMS:
 * `@ucf/components/react`. A component with presets already takes `preset` and `content`
 * (with-presets.tsx); parts.tsx is the lower level, for a site that places the parts itself.
 */
export {
	findPreset,
	presetContent,
	renderParts,
	type PartOptions,
} from './parts.tsx';
export {
	withPresets,
	type ContentOf,
	type PresetProps,
} from './with-presets.tsx';
export { resolveParts } from '../schema/parts.ts';
