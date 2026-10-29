/**
 * Stylelint configuration.
 *
 * WHY the plain `@wordpress/stylelint-config` and not the stylistic preset: Prettier owns
 * whitespace here (`npm run format:check`), and the stylistic rules contradict it on any
 * declaration long enough to wrap. The block theme made the same call for the same reason
 * (.stylelintrc.js there).
 *
 * `selector-class-pattern` is off because BEM's `__` and `--` fail the default pattern, and a
 * project config replaces the wp-scripts default rather than merging with it.
 *
 * `rule-empty-line-before` and `comment-empty-line-before` are off for the same reason as the
 * stylistic preset: they are whitespace rules, and inside a nested block (`@keyframes`,
 * `@container`, `@media`) they ask for a blank line after the `{` that Prettier removes. The
 * Degree picker was the first stylesheet here with nested blocks.
 */
module.exports = {
	extends: '@wordpress/stylelint-config',
	rules: {
		'selector-class-pattern': null,
		'rule-empty-line-before': null,
		'comment-empty-line-before': null,
	},
};
