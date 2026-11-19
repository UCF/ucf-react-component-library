/**
 * `@ucf/components/hero`. SYNC: docs/architecture.md, "What a component exports".
 */
export {
	default as Hero,
	type HeroLayout,
	type HeroProps,
	type HeroTone,
} from './Hero.tsx';

// Its pieces, for a site that builds its own

export { PARTS as HERO_PARTS } from './frame/parts.ts';
export { PRESETS as HERO_PRESETS } from './frame/presets.ts';
