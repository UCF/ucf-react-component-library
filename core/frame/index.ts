/**
 * Not a step · a React site's entry, `@ucf/components/react`: presets on a plain React site with
 * no CMS.
 */

export {
	findPreset,
	presetContent,
	renderParts,
	type PartOptions,
} from './render-parts.tsx';
export { frame } from './frame.tsx';
export type { ContentOf, FrameProps, PresetProps } from './types.ts';
export { resolveParts } from './read-parts.ts';
