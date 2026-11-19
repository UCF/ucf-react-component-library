/**
 * The Code's props, in the order Puck shows them. Its Puck fields, its story controls and their
 * defaults are built from these (core/hosts/prop-definitions.ts says how).
 *
 * SPEC: core Code's one attribute, `content`, so an editor who knows core's knows ours
 * (docs/architecture.md, "Primitives").
 */
import type { PropDefinitions, PropsOf } from '@/core/hosts/prop-definitions';

export const PROPS = {
	/** The code, as written: its line breaks and spaces are kept. */
	content: {
		type: 'text',
		label: 'Code',
		panel: 'Code',
		control: 'multiline',
		default: 'const credits = 120;\nconsole.log( credits );',
	},
} as const satisfies PropDefinitions;

/** The props above, typed. */
export type CodeEditableProps = PropsOf< typeof PROPS >;
