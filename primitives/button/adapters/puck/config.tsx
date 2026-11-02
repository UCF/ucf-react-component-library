/**
 * The Button for Puck, where editors place it on its own: Puck has no core blocks.
 *
 * SPEC: the fields are core Button's in the UCF theme: text, link, open in a new tab, its
 * styles (Fill, Outline, Text) and its sizes (core's font size: Small, Body).
 */
import Button from '../../Button.tsx';
import example from '../../example.json' with { type: 'json' };
// WHY a type from components/: the one copy of Puck's config shape. Types only; erased at build.
import type { PuckComponentConfig } from '../../../../components/_config/puck.ts';

type Props = {
	text: string;
	url: string;
	linkTarget: string;
	variant: 'fill' | 'outline' | 'text';
	fontSize: '' | 'small' | 'body';
};

const config: PuckComponentConfig< Props > = {
	label: 'Button',
	fields: {
		text: { type: 'text', label: 'Text' },
		url: { type: 'text', label: 'Link' },
		linkTarget: {
			type: 'radio',
			label: 'Opens in',
			options: [
				{ value: '', label: 'Same tab' },
				{ value: '_blank', label: 'New tab' },
			],
		},
		variant: {
			type: 'radio',
			label: 'Style',
			options: [
				{ value: 'fill', label: 'Fill' },
				{ value: 'outline', label: 'Outline' },
				{ value: 'text', label: 'Text' },
			],
		},
		fontSize: {
			type: 'radio',
			label: 'Size',
			options: [
				{ value: '', label: 'Default' },
				{ value: 'small', label: 'Small' },
				{ value: 'body', label: 'Large' },
			],
		},
	},
	defaultProps: example as Props,
	// FIX: only the Button's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup (see PuckRenderProps in components/_config/puck.ts).
	render: ( { text, url, linkTarget, variant, fontSize } ) => (
		<Button
			text={ text }
			url={ url }
			linkTarget={ linkTarget }
			variant={ variant }
			fontSize={ fontSize }
		/>
	),
};

export default config;
