/**
 * WordPress: every icon a block or preset names (`wpIcon`).
 *
 * WHY a list, not `import * as`: the icons are bundled into the plugins, so only these ship.
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
