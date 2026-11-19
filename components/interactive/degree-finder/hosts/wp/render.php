<?php
/**
 * Front-end markup for the Degree Finder block.
 *
 * CONTEXT: an interactive block. This writes only a container carrying the finder's props, and
 * view.tsx mounts the React component into it. The link inside is what a visitor without
 * JavaScript, or a search engine, gets; React replaces it on load.
 *
 * @package ucf-degrees
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$ucf_degrees_settings = ucf_degrees_degree_finder_settings();

if ( ! empty( $attributes['programType'] ) ) {
	$ucf_degrees_settings['programType'] = $attributes['programType'];
}

$ucf_degrees_wrapper = get_block_wrapper_attributes(
	array(
		'data-ucf-degree-finder' => wp_json_encode( $ucf_degrees_settings ),
	)
);
?>
<div <?php echo $ucf_degrees_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- UPSTREAM: get_block_wrapper_attributes() escapes each attribute itself. ?>>
	<p>
		<a href="<?php echo esc_url( $ucf_degrees_settings['searchUrl'] ); ?>">
			<?php esc_html_e( 'Explore our Programs', 'ucf-degrees' ); ?>
		</a>
	</p>
</div>
