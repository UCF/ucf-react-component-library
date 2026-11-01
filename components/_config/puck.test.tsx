/**
 * CONTEXT: checks every Puck config against the real Puck, which the library itself never
 * imports (components/_config/puck.ts).
 *
 *   - Types: each config must be assignable to Puck's own `ComponentConfig`. This is checked by
 *     `npm run typecheck`, not by the test run: a config that no longer fits Puck's shape is a
 *     type error here.
 *   - Render: Puck calls `render` with its own props (`id`, `puck`, `editMode`) beside the
 *     component's. None of them may reach the markup.
 *
 * SYNC: add each new `adapters/puck/config.tsx` to CONFIGS.
 * UPSTREAM: `@puckeditor/core` is a dev dependency only, for this file.
 */
import type { ComponentConfig } from '@puckeditor/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import degreeFinder from '../degree-finder/adapters/puck/config.tsx';
import section from '../section/adapters/puck/config.tsx';
import stat from '../stat/adapters/puck/config.tsx';
import type { PuckComponentConfig } from './puck.ts';

type PropsOf< Config > =
	Config extends PuckComponentConfig< infer Props > ? Props : never;

const CONFIGS = {
	Stat: stat,
	'Degree Finder': degreeFinder,
	Section: section,
};

// The type check. WHY one line per config: each is its own Props, and a mismatch then names
// the config that broke.
stat satisfies ComponentConfig< PropsOf< typeof stat > >;
degreeFinder satisfies ComponentConfig< PropsOf< typeof degreeFinder > >;
section satisfies ComponentConfig< PropsOf< typeof section > >;

// What Puck adds to every render call (PuckComponent in @puckeditor/core).
const puckProps = {
	id: 'Stat-1234',
	editMode: true,
	puck: {
		isEditing: true,
		metadata: {},
		dragRef: null,
		renderDropZone: () => null,
	},
};

describe.each( Object.entries( CONFIGS ) )(
	'the %s Puck config',
	( _, config ) => {
		it( 'renders the same markup with or without Puck’s own props', () => {
			// UPSTREAM: Puck hands `render` a component for each slot prop, not the stored list.
			const Slot = ( slotProps: object ) => <div { ...slotProps } />;
			const props = Object.fromEntries(
				Object.entries( config.defaultProps ).map(
					( [ key, value ] ) => [
						key,
						( config.fields as Record< string, { type: string } > )[
							key
						]?.type === 'slot'
							? Slot
							: value,
					]
				)
			);
			const plain = renderToStaticMarkup(
				config.render( props as never )
			);
			const inPuck = renderToStaticMarkup(
				config.render( { ...props, ...puckProps } as never )
			);

			expect( inPuck ).toBe( plain );
		} );
	}
);
