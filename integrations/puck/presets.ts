/**
 * CONTEXT: a component's presets in Puck, as data: a preset picker, and a field for each part's
 * content. Puck stores `{ preset, content }`, the same props a plain React site passes
 * (integrations/react/with-presets.tsx), and renders through the same wrapper, so a Card in Puck
 * and a Card on a Next site are one model.
 *
 * The "Open" preset (an empty name) is the frame with a slot instead: the editor places any
 * components inside, as `children` replace the parts in React.
 *
 * WHY Puck fills content from fields, where WordPress keeps inner blocks: Puck stores props
 * directly, so it can store the data the component takes. docs/architecture.md, "The three
 * layers", says which environment binds to which layer.
 */
import type { Kind, Looks } from '../schema/parts.ts';
import { findPreset } from '../schema/presets.ts';
import type { ContentOf } from '../react/with-presets.tsx';
import type {
	PuckObjectField,
	PuckScalarField,
	PuckSlot,
	PuckSlotField,
} from './config.ts';

/**
 * The props a component's presets add in Puck. WHY listed: they are Puck's and React's, not
 * block attributes; integrations/tests/parity.test.tsx leaves them out of its comparison.
 */
export const PRESET_FIELDS = [ 'preset', 'content', 'blocks' ] as const;

/** The props a component with presets stores in Puck, besides its own. */
export type PresetPuckProps< L extends Looks > = {
	/** A preset's name, or '' for the open frame. */
	preset: string;
	/** Each part's content, by its name in the component's PARTS. */
	content: ContentOf< L >;
	/** The open frame's components. */
	blocks: PuckSlot;
};

/**
 * `eyebrow` → `Eyebrow`.
 *
 * @param name A part's name.
 */
const labelOf = ( name: string ) =>
	name.charAt( 0 ).toUpperCase() + name.slice( 1 );

/**
 * The field for one part's content, by its kind.
 *
 * @param kind  The part's kind.
 * @param label Its label.
 */
function fieldFor( kind: Kind, label: string ) {
	switch ( kind ) {
		case 'text':
		case 'heading':
			return { type: 'text', label } as const;
		case 'link':
		case 'button':
			return {
				type: 'object',
				label,
				objectFields: {
					text: { type: 'text', label: 'Text' },
					url: { type: 'text', label: 'Address (URL)' },
				},
			} as const;
		default:
			return {
				type: 'object',
				label,
				objectFields: {
					url: { type: 'text', label: 'Image URL' },
					alt: {
						type: 'text',
						label: 'Alt text (empty when it is decoration)',
					},
				},
			} as const;
	}
}

/**
 * The preset picker, a field for each part's content, and the open frame's slot.
 *
 * @param looks   The component's PARTS.
 * @param presets Its PRESETS.
 */
export function presetFields< L extends Looks >(
	looks: L,
	presets: readonly { name: string; title: string }[]
): {
	preset: PuckScalarField;
	content: PuckObjectField< ContentOf< L > >;
	blocks: PuckSlotField;
} {
	return {
		preset: {
			type: 'select',
			label: 'Design',
			options: [
				...presets.map( ( { name, title } ) => ( {
					value: name,
					// "Card: Pathway" → "Pathway": the field is already the Card's.
					label: title.replace( /^[^:]*:\s*/, '' ),
				} ) ),
				{ value: '', label: 'Open: place your own components' },
			],
		},
		content: {
			type: 'object',
			label: 'Content',
			objectFields: Object.fromEntries(
				Object.entries( looks ).map( ( [ name, look ] ) => [
					name,
					fieldFor( look.kind, labelOf( name ) ),
				] )
			) as PuckObjectField< ContentOf< L > >[ 'objectFields' ],
		},
		blocks: { type: 'slot' },
	};
}

/**
 * Puck's `resolveData`: when the editor picks a preset, its props replace the look's fields
 * (they may change them after). The content stays: parts with the same name keep their text.
 *
 * @param presets The component's PRESETS.
 */
export function applyPreset< Props extends { preset: string } >(
	presets: readonly { name: string; props: Partial< Props > }[]
) {
	return (
		data: { props: Props },
		{ changed }: { changed: Partial< Record< keyof Props, boolean > > }
	): { props: Partial< Props > } =>
		changed.preset && data.props.preset
			? {
					props: {
						...data.props,
						...findPreset( presets, data.props.preset ).props,
					},
				}
			: data;
}

/**
 * Puck's `resolveFields`: the current preset's parts only, or, for the open frame, the slot and
 * no content fields.
 *
 * @param presets The component's PRESETS.
 * @param fields  Its fields, all of them: presetFields() and its own.
 */
export function presetFieldsFor<
	Props extends { preset: string },
	Fields extends { content: { objectFields: object } },
>(
	presets: readonly { name: string; parts: { part: string }[] }[],
	fields: Fields
) {
	return ( data: { props: Props } ): Fields => {
		const { content, blocks, ...rest } = fields as Fields & {
			blocks: unknown;
		};
		if ( ! data.props.preset ) {
			return { ...rest, blocks } as unknown as Fields;
		}
		// The preset's parts, in its order: the panel reads as the card does, top to bottom.
		const used = [
			...new Set(
				findPreset( presets, data.props.preset ).parts.map(
					( { part } ) => part
				)
			),
		];
		const all = content.objectFields as Record< string, unknown >;
		return {
			...rest,
			content: {
				...content,
				objectFields: Object.fromEntries(
					used.map( ( name ) => [ name, all[ name ] ] )
				),
			},
		} as unknown as Fields;
	};
}
