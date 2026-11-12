/**
 * Sample programs for the stories and tests: the Miller College of Business's bachelor's and
 * master's programs as the Search Service listed them, in the list's order.
 * WHY real records: a story should look like the live list, names of every length included.
 */
import type { Program } from './types.ts';

export const SAMPLE_PROGRAMS: readonly Program[] = (
	[
		[ 868, 'Accounting (BSBA)', 'accounting-bsba' ],
		[ 869, 'Accounting (MSA)', 'accounting-msa' ],
		[ 936, 'Business Administration (MBA)', 'business-administration-mba' ],
		[ 1980, 'Business Analytics (MS)', 'business-analytics-ms' ],
		[ 1067, 'Business Economics (BSBA)', 'business-economics-bsba' ],
		[ 1074, 'Economics (BS)', 'economics-bs' ],
		[ 1164, 'Finance (BSBA)', 'finance-bsba' ],
		[ 1920, 'Financial Technology (MS)', 'fintech-ms' ],
		[ 1253, 'Integrated Business (BSBA)', 'integrated-business-bsba' ],
		[ 1328, 'Management (BSBA)', 'management-bsba' ],
		[ 941, 'Management (MSM)', 'management-msm' ],
		[ 1330, 'Marketing (BSBA)', 'marketing-bsba' ],
		[ 1499, 'Real Estate (BSBA)', 'real-estate-bsba' ],
		[ 1500, 'Real Estate (MSRE)', 'real-estate-msre' ],
		[
			2219,
			'Risk Management and Insurance (BSBA)',
			'risk-management-and-insurance-bsba',
		],
		[
			950,
			'Sport Business Management (MSBM)',
			'sport-business-management-msbm',
		],
	] as const
 ).map( ( [ id, name, slug ] ) => ( {
	id: String( id ),
	name,
	url: `https://www.ucf.edu/degree/${ slug }/`,
} ) );
