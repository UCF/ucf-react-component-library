/**
 * CONTEXT: a component's kind, read from its block.json (docs/architecture.md, "Three kinds of
 * component"). The kind is also its bucket under components/ and its inserter category.
 *
 *   content      no `render`: save() stores the HTML in the post.
 *   live         `render` and no `viewScript`: render.php writes the whole HTML on each request.
 *   interactive  `render` and a `viewScript`: render.php writes a container, the browser builds it.
 *
 * WHY from block.json: it is what WordPress itself reads, so the kind can't disagree with how
 * the block is actually built. integrations/tests/{parity,blocks}.test.tsx check every block.
 */

export type Kind = 'content' | 'live' | 'interactive';

/**
 * A block's kind.
 *
 * @param json            The block's block.json.
 * @param json.render     Its render.php, if WordPress renders it on the server.
 * @param json.viewScript Its front-end script, if the browser builds it.
 * @return Its kind.
 */
export function kindOf( json: {
	render?: string;
	viewScript?: string | string[];
} ): Kind {
	if ( ! json.render ) {
		return 'content';
	}
	return json.viewScript ? 'interactive' : 'live';
}

/**
 * Each kind's inserter category.
 * SYNC: ucf_components_block_category() in plugins/shared/shared.php.
 */
export const CATEGORY_OF: Record< Kind, string > = {
	content: 'ucf-content',
	live: 'ucf-live',
	interactive: 'ucf-interactive',
};
