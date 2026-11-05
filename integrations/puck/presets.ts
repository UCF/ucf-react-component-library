/**
 * Puck: a component's presets, as data.
 *
 * A Design picker and a field per part; Puck stores `{ preset, content }`, as a React site passes
 * them. The "Open" design is a slot instead.
 */

import type { Kind, PartDefinitions } from '../schema/parts.ts';
import { findPreset } from '../schema/presets.ts';
import type { ContentOf } from '../react/frame.tsx';
import type {
	PuckObjectField,
	PuckScalarField,
	PuckSlot,
	PuckSlotField,
} from './types.ts';

// ── Fields ─────────────────────────────────────────────────────────────────────────────────────

/** The props a component's presets add in Puck. */
export const PRESET_FIELDS = [ 'preset', 'content', 'blocks' ] as const;

/** The props a component with presets stores in Puck, besides its own. */
export type PresetPuckProps< Parts extends PartDefinitions > = {
	/** A preset's name, or '' for the open frame. */
	preset: string;
	/** Each part's content, by its name in the component's PARTS. */
	content: ContentOf< Parts >;
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
 * @param partDefinitions The component's PARTS.
 * @param presets         Its PRESETS.
 */
export function presetFields< Parts extends PartDefinitions >(
	partDefinitions: Parts,
	presets: readonly { name: string; title: string }[]
): {
	preset: PuckScalarField;
	content: PuckObjectField< ContentOf< Parts > >;
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
				Object.entries( partDefinitions ).map(
					( [ name, definition ] ) => [
						name,
						fieldFor( definition.kind, labelOf( name ) ),
					]
				)
			) as PuckObjectField< ContentOf< Parts > >[ 'objectFields' ],
		},
		blocks: { type: 'slot' },
	};
}

// ── When a field changes ───────────────────────────────────────────────────────────────────────
//
// Puck calls these as the editor works.

/**
 * Puck's `resolveData`: when the editor picks a preset, its props replace the look's fields (they
 * may change them after).
 *
 * @param presets The component's PRESETS.
 */
export function applyPreset< StoredProps extends { preset: string } >(
	presets: readonly { name: string; props: Partial< StoredProps > }[]
) {
	return (
		data: { props: StoredProps },
		{
			changed,
		}: { changed: Partial< Record< keyof StoredProps, boolean > > }
	): { props: Partial< StoredProps > } =>
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
 * Puck's `resolveFields`: the current preset's parts only, or, for the open frame, the slot and no
 * content fields.
 *
 * @param presets The component's PRESETS.
 * @param fields  Its fields, all of them: presetFields() and its own.
 */
export function presetFieldsFor<
	StoredProps extends { preset: string },
	Fields extends { content: { objectFields: object } },
>(
	presets: readonly { name: string; parts: readonly { part: string }[] }[],
	fields: Fields
) {
	return ( data: { props: StoredProps } ): Fields => {
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
