<?php
/**
 * The Degree List on the page.
 *
 * CONTEXT: a live block. On each request this reads the programs (cached; client.php) and writes
 * the whole list, so it is in the page with no JavaScript. Nothing is saved in the post but the
 * block's attributes.
 *
 * SYNC: DegreeList.tsx, element for element and class for class. tests/DegreeList.php.test.tsx
 * runs this file and fails when its HTML differs from React's. Whitespace between tags doesn't
 * count: each sits between block or list items, where browsers don't show it.
 *
 * @package ucf-degrees
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/client.php';

$ucf_degrees_degree_list_programs = ucf_degrees_degree_list_programs(
	ucf_degrees_degree_list_fetch(
		array(
			'colleges'     => $attributes['colleges'] ?? array(),
			'departments'  => $attributes['departments'] ?? array(),
			'programTypes' => $attributes['programTypes'] ?? array(),
		),
		ucf_degrees_degree_list_settings()
	)
);

// SYNC: headingOf() in DegreeList.tsx trims the same four characters.
$ucf_degrees_degree_list_title = trim( (string) ( $attributes['title'] ?? '' ), " \t\n\r" );
$ucf_degrees_degree_list_empty = (string) ( $attributes['emptyMessage'] ?? '' );

// SYNC: data-columns in DegreeList.tsx, written only when not the default.
$ucf_degrees_degree_list_wrapper = array( 'class' => 'ucf-c ucf-c-degree-list' );
if ( in_array( $attributes['columns'] ?? '1', array( '2', '3' ), true ) ) {
	$ucf_degrees_degree_list_wrapper['data-columns'] = $attributes['columns'];
}
?>
<div <?php echo get_block_wrapper_attributes( $ucf_degrees_degree_list_wrapper ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WordPress escapes each attribute. ?>>
	<?php if ( '' !== $ucf_degrees_degree_list_title ) : ?>
		<h2 class="ucf-c-degree-list__heading ucf-c ucf-c-heading"><?php echo esc_html( $ucf_degrees_degree_list_title ); ?></h2>
	<?php endif; ?>
	<?php if ( $ucf_degrees_degree_list_programs ) : ?>
		<ul class="ucf-c-degree-list__items">
			<?php foreach ( $ucf_degrees_degree_list_programs as $ucf_degrees_degree_list_program ) : ?>
				<li class="ucf-c-degree-list__item"><a href="<?php echo esc_url( $ucf_degrees_degree_list_program['url'] ); ?>"><?php echo esc_html( $ucf_degrees_degree_list_program['name'] ); ?></a></li>
			<?php endforeach; ?>
		</ul>
	<?php elseif ( '' !== $ucf_degrees_degree_list_empty ) : ?>
		<p class="ucf-c-degree-list__empty"><?php echo esc_html( $ucf_degrees_degree_list_empty ); ?></p>
	<?php endif; ?>
</div>
