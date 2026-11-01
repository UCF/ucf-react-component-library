/// <reference types="vite/client" />
// WHY vite/client: Storybook and the tests are built by Vite, which provides `import.meta.env`
// and `import.meta.glob` (used by components/_config/*.test.tsx to find every component).

/** Set per story-test project in vitest.config.mts; unset in Storybook itself. */
interface ImportMetaEnv {
	readonly VITE_UCF_COMPOSITION?: string;
}
