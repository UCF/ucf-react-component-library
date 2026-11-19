/**
 * The site's Degree List settings the editor's preview needs, from
 * `ucf_degrees_degree_list_editor_settings()` in plugins/ucf-degrees/ucf-degrees.php.
 */

export type DegreeListSettings = {
	/** The Search Service's API root, when the site sets its own. */
	apiRoot?: string;
};

declare global {
	interface Window {
		/** Set for the editor by plugins/ucf-degrees/ucf-degrees.php. */
		ucfDegreeListSettings?: DegreeListSettings;
	}
}

/**
 * The settings, or none when the plugin didn't set them (the client's defaults apply).
 *
 * @return The settings.
 */
export function editorSettings(): DegreeListSettings {
	return typeof window === 'undefined'
		? {}
		: ( window.ucfDegreeListSettings ?? {} );
}
