/**
 * CONTEXT: the shapes the Degree Finder works with. These are the component's own shapes, not
 * the API's: client.ts is the only file that knows what the REST API returns.
 */

export interface ProgramType {
	slug: string;
	name: string;
	plural: string;
	count: number;
	children: ProgramType[];
}

/**
 * A program type offered on the first step, with the label visitors see, e.g.
 * { slug: 'bachelor', label: 'Bachelors' }.
 */
export interface ProgramTypeOption {
	slug: string;
	label: string;
}

export interface Interest {
	slug: string;
	name: string;
}

export interface Degree {
	id: number;
	title: string;
	url: string;
}

export interface RequestOptions {
	signal?: AbortSignal;
}

/**
 * Where the finder gets its data. A prop, so Storybook and tests can pass sample data, and so
 * the data source can change without touching the component.
 */
export interface DegreeClient {
	getProgramTypes: ( options?: RequestOptions ) => Promise< ProgramType[] >;
	getInterests: (
		programType: string,
		options?: RequestOptions
	) => Promise< Interest[] >;
	getDegrees: (
		programType: string,
		interests: string[],
		options?: RequestOptions
	) => Promise< Degree[] >;
}
