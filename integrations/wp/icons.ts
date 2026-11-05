/**
 * CONTEXT: every icon a block or one of its presets names (`wpIcon` in {Name}.definition.ts and
 * {Name}.presets.ts), by its name in `@wordpress/icons`.
 *
 * WHY here, not in block.json: block.json takes only a Dashicon name, and WordPress's own icon
 * set (the one core's blocks use) has closer pictures.
 * WHY a list, not `import * as icons`: the icons are bundled into the plugins, so only these
 * ship. A name not here fails integrations/tests/presets.test.tsx; add it here.
 */
import {
	alignCenter,
	arrowRight,
	button,
	chartBar,
	cornerTopLeft,
	overlayText,
	people,
	postFeaturedImage,
	sidesLeft,
	sidesTop,
	starFilled,
} from '@wordpress/icons';

export const ICONS: Record< string, JSX.Element > = {
	alignCenter,
	arrowRight,
	button,
	chartBar,
	cornerTopLeft,
	overlayText,
	people,
	postFeaturedImage,
	sidesLeft,
	sidesTop,
	starFilled,
};
