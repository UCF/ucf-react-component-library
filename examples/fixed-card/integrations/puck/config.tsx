/**
 * The fixed Card example for Puck: a plain config object, so this library needs no Puck dependency.
 *
 * WHY no image ID field: it is the WordPress media library's; Puck sites choose images by URL
 * (`WORDPRESS_ONLY` in integrations/tests/parity.test.tsx).
 */
import FixedCard, { type FixedCardProps } from '../../FixedCard.tsx';
// WHY the attribute: the npm package is plain ES modules, and Node will not import JSON
// without it.
import example from '../../example.json' with { type: 'json' };
import { CHOICES, type ChoiceKey } from '../../options.ts';
import type {
	PuckComponentConfig,
	PuckScalarField,
} from '../../../../integrations/puck/config.ts';

type Props = {
	title: string;
	url: string;
	linkTarget: string;
	meta: string;
	description: string;
	imageUrl: string;
	imageAlt: string;
	headingLevel: NonNullable< FixedCardProps[ 'headingLevel' ] >;
	variant: NonNullable< FixedCardProps[ 'variant' ] >;
	layout: NonNullable< FixedCardProps[ 'layout' ] >;
};

const choice = (
	key: ChoiceKey,
	type: 'select' | 'radio'
): PuckScalarField => ( {
	type,
	label: CHOICES[ key ].label,
	options: CHOICES[ key ].options.map( ( option ) => ( { ...option } ) ),
} );

const config: PuckComponentConfig< Props > = {
	label: 'Fixed card (example)',
	fields: {
		title: { type: 'text', label: 'Title' },
		meta: { type: 'text', label: 'Meta (category · date)' },
		description: { type: 'textarea', label: 'Description' },
		url: { type: 'text', label: 'Link' },
		linkTarget: choice( 'linkTarget', 'radio' ),
		imageUrl: { type: 'text', label: 'Image URL' },
		imageAlt: {
			type: 'text',
			label: 'Image alt text (empty if decorative)',
		},
		headingLevel: choice( 'headingLevel', 'radio' ),
		variant: choice( 'variant', 'radio' ),
		layout: choice( 'layout', 'radio' ),
	},
	defaultProps: example as Props,
	// FIX: only the Card's own props; Puck's `id`, `puck` and `editMode` would reach the
	// markup (see PuckRenderProps in integrations/puck/config.ts).
	render: ( { id, puck, editMode, ...props } ) => <FixedCard { ...props } />,
};

export default config;
