/**
 * `@ucf/components/primitives/accordion-item`. SYNC: docs/architecture.md, "What a component
 * exports".
 */
export {
	default as AccordionItem,
	type AccordionItemProps,
} from './AccordionItem.tsx';

// Its pieces, for a site that builds its own

export { PROPS as ACCORDION_ITEM_PROPS } from './props.ts';
export { PARTS as ACCORDION_ITEM_PARTS } from './frame/parts.ts';
export { PRESETS as ACCORDION_ITEM_PRESETS } from './frame/presets.ts';
