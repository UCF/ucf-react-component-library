/** A program as the Degree List shows it, from client.ts (or its PHP copy, client.php). */
export interface Program {
	/** The Search Service's program ID. */
	id: string;
	/** Plain text, trimmed: "Accounting (BSBA)". */
	name: string;
	/** Its profile page: an http or https URL. */
	url: string;
}

/**
 * Which programs a list shows: any of these colleges, any of these departments and any of these
 * program types, all three at once. An empty or missing filter doesn't narrow the list.
 */
export interface ProgramFilters {
	/** The Search Service's college slugs: `sciences`. */
	colleges?: readonly string[];
	/** The Search Service's department slugs: `accounting-dixon-schl-of`. */
	departments?: readonly string[];
	/** Program types, by their values in PROGRAM_TYPES (client.ts): `bachelors`. */
	programTypes?: readonly string[];
}
