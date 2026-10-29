/**
 * ESLint: the wp-scripts default flat config, plus two local rules.
 */
const wpConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...wpConfig,
	{
		ignores: [
			'dist/**',
			'temp-release/**',
			'plugins/*/build/**',
			'storybook-static/**',
		],
	},
	{
		// WHY: command-line scripts whose job is to print. Nothing in scripts/ ships.
		files: [ 'scripts/**' ],
		rules: { 'no-console': 'off' },
	},
];
