# Contributing to the UCF React Component Library

Thank you for your interest in contributing to this project! If you are a developer for UCF and want to contribute to this library, we'd love to hear from you.

This document outlines the best ways to submit new ideas or inform us of bugs. Please take a moment to review these guidelines before submitting new issues or pull requests in order to make the contribution process easy and effective for everyone involved.

## Quick links

- [Using the issue tracker](#using-the-issue-tracker)
- [Bug reports](#bug-reports)
- [Feature requests](#feature-requests)
- [Pull requests](#pull-requests)
- [Tests](#tests)
- [Code standards and style guides](#code-standards-and-style-guides)

---

## Using the issue tracker

The [issue tracker](https://github.com/UCF/ucf-react-component-library/issues) in GitHub is the preferred channel for [bug reports](#bug-reports), [feature requests](#feature-requests) and [submitting pull requests](#pull-requests).

Please do not use the issue tracker for personal support requests.

## Bug reports

A bug is a demonstrable problem that is caused by the code in the repository. Concise and thorough bug reports will help us fix reported problems more quickly and effectively.

### Before submitting a bug report

1. **Use the GitHub issue search** — check if the issue has already been reported. Feel free to comment on the existing issue if it is still open and you have new information to share.
2. **Check if the issue has been fixed** — if you're not running the latest version of the library, please check your code against the repo's `main` branch first.

### Submit a bug report

If you've followed the steps above and have a valid bug report to submit, [create a new issue in GitHub](https://github.com/UCF/ucf-react-component-library/issues/new).

Add a descriptive, understandable title and details about the bug in the description field. Say where it happens: the npm package, a WordPress block (in the editor or on the front end), Puck or Storybook. What steps will reproduce the issue? What browser(s) and OS experience the problem? What would you expect to be the outcome?

## Feature requests

Feature requests are welcome. Before you submit one, take a moment to review [`docs/architecture.md`](docs/architecture.md). A new design for an existing component is usually a variation of a frame (see "Frames"), not a new component, and a new color belongs in the token roles, not in a component's CSS. This keeps the library small and on-brand.

[Submit a feature request](https://github.com/UCF/ucf-react-component-library/issues/new) with a description of what it is for and, if you have one, a screenshot of the design.

## Pull requests

Good pull requests — patches, improvements, new features — are a fantastic help.

Please ask first before embarking on any significant pull request (e.g. implementing features, refactoring code), otherwise you risk spending a lot of time working on something that the project's maintainers might not want to merge.

### Getting started

One React source ships three ways: the `@ucf/components` npm package, one WordPress plugin per content type (`plugins/ucf-content`, `plugins/ucf-degrees`) and a Puck config for each component. [`README.md`](README.md) says where each file lives.

1. Fork and clone the repository.
2. Install dependencies (Node 22.22, 24.15 or 26+; `.nvmrc` pins 24):
    ```
    nvm use
    npm install
    composer install                  # only for npm run lint:php
    npx playwright install chromium   # only for npm run test:stories
    ```
3. Open the catalog:
    ```
    npm run storybook
    ```
    It runs at http://localhost:6006. The **Composition** menu in the toolbar puts every story on each section color.

Generated output is **never committed** and never edited by hand: `dist/`, `plugins/*/build/`, `storybook-static/` and `temp-release/`. CI builds its own.

Other useful scripts:

- `npm run new:component` — start a component: its folder, and every list that names it. See "Adding a component" in the README.
- `npm run deploy:watch` — rebuild on every change and copy into your local WordPress and React sites. Copy `.env.example` to `.env` and set your paths first.
- `npm run build` — tokens, then the npm package, then the plugins.
- `npm run release:temp` — build, then collect every output into `temp-release/`.
- `npm test` — the unit suite, in Node (a few seconds).
- `npm run test:stories` — every story in headless Chromium, on every composition at three widths, with accessibility checks.
- `npm run typecheck` — TypeScript over everything.
- `npm run lint` — ESLint, Stylelint and PHPCS.
- `npm run format` — format everything with Prettier.
- `npm run check` — tests, typecheck, all three linters and the format check.

`composer.json` pins `config.platform.php` to **8.1**. Without it, Composer resolves against whatever PHP the developer happens to be running and can lock a package that needs something newer. Run `composer update` on the pinned platform, not on your own.

### Before you write a component

Decide its **kind** and its **name** first ([`docs/architecture.md`](docs/architecture.md), "Two kinds of component" and "Naming"):

- **Content or interactive** changes what the core may import, how its block is built and whether its markup is frozen.
- **A block's name, and a content block's attribute names, are stored in posts.** They are permanent once a site uses them.
- **A content component's markup is frozen.** Changing it means a major version and a block deprecation ("Changing a content component's markup"). Never update a markup snapshot casually: it means every saved post with that block changes.

### Submitting a pull request

1. Create a new branch off of `main` for your work.
2. Make your changes, following the [code standards](#code-standards-and-style-guides) below.
3. Add tests — see [Tests](#tests) below for what your change needs.
4. Run `npm run check`, and `npm run test:stories` if a story, a component's markup or its CSS changed.
5. If you changed a block, check it in the WordPress editor (see [Tests](#tests)).
6. Open a pull request against `main` with a clear description, following the pull request template.

## Tests

New code ships with its test. The suites in `integrations/tests/` find every component on their own, and `npm run new:component` adds a new one to every list, so much of this is automatic:

| You added                        | You write                                                                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A content component              | Its markup contract, `tests/{Name}.test.tsx` (copy `highlight/tests/Highlight.test.tsx`), and stories for its states                                    |
| An interactive component         | A test for its data client with a fake `fetch` (see `degree-finder/tests/client.test.ts`), and stories for its states                                   |
| A design (variation) for a frame | Nothing, if the frame already has designs: its `tests/variations.test.tsx` reads every entry. A frame's first designs need that test (copy Highlight's) |
| A primitive                      | Stories for its states. The parity and Puck suites pick it up                                                                                           |
| A script in `scripts/`           | A `scripts/{name}.test.mjs`                                                                                                                             |
| A token or role in `tokens.json` | Nothing. The token tests read `tokens.json` and check the contrast of every role pair                                                                   |

[`docs/architecture.md`](docs/architecture.md), "Tests", covers what each suite checks.

Four rules are worth knowing before you write anything:

- **Prove a new test can fail.** Break the code it covers, watch it go red, then restore it. A test that has never failed may be testing nothing.
- **Don't check markup with a block's `isValid`.** `parse()` recovers mismatched markup by migrating it through the block's `deprecated` array and then reports `isValid: true`. Use `isValidBlockContent()` instead, as `integrations/tests/blocks.test.tsx` does.
- **Never verify a block through the front end.** An invalid block still renders there. In the editor, check `wp.data.select( 'core/block-editor' ).getBlocks()` and watch the console for "Updated Block".
- **An accessibility check on the wrong section passes.** Every story runs inside each composition, and `.storybook/vitest.setup.ts` fails a story that didn't render inside the one it was meant to. Anything you add there should hold the same line.

CI runs the unit tests, the typecheck and the build on **every push** (`.github/workflows/ci.yml`), and adds the story tests on **pull requests and main** (`.github/workflows/ci-full.yml`). Linting and formatting run too, but as an advisory job — they report findings and never fail the build. Run them locally anyway; they are clean now, so keep them that way.

Not covered yet, so check these by hand: behavior (keyboard, focus), a block in a running WordPress (`render.php`, the plugins' PHP) and the Puck editor. [`docs/todo.md`](docs/todo.md) lists what is deliberately not done yet.

## Code standards and style guides

This project follows the [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/wordpress-coding-standards/):

- **PHP** — WordPress PHP standards (tabs, Yoda conditions, escaped output). Verified with PHPCS (`npm run lint:php`).
- **JavaScript, TypeScript & JSON** — formatted with Prettier (`npm run format`) and linted with `@wordpress/scripts` (`npm run lint:js`). Don't silence a rule without writing down why.
- **CSS** — colors only as `var(--ucf-c-{role})`, never a raw value or another layer's token. Linted with Stylelint (`npm run lint:css`).
- **Indentation** — tabs, enforced by `.editorconfig`.
- **Comments** — say why, not what, and are tagged (`WHY:`, `FIX:`, `CONTEXT:` and the rest of the vocabulary in the architecture doc). Keep a comment with its code when moving it.

Architectural conventions specific to this library — the three layers, content versus interactive components, slots, primitives, frames, distribution and the token roles — are documented in [`docs/architecture.md`](docs/architecture.md). Please review it before opening a pull request that adds a component, a primitive, a block or a token.
