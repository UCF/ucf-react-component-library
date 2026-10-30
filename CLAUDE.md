# UCF React Component Library: working notes

**Read [`docs/architecture.md`](docs/architecture.md) before changing anything.** It is the
single source for this repo's conventions and the reasoning behind them; this file does not
restate them. Read `README.md` first for what the repo is and where each file lives.
[`docs/todo.md`](docs/todo.md) lists what is deliberately not done yet.

## What is in the architecture doc

| Section                               | Covers                                                          |
| ------------------------------------- | --------------------------------------------------------------- |
| One source, two outputs               | npm package, WordPress plugins                                  |
| The three layers                      | Tokens → markup and CSS → React                                 |
| Two kinds of component                | Content (server) vs interactive (client); authored vs live data |
| Naming                                | One name in every layer; which names are permanent              |
| A component's folder                  | What each file is; why there is no `next/` host                 |
| Slots                                 | How host-specific pieces get in                                 |
| Distribution                          | One npm package; one plugin per content type                    |
| Tokens, roles and fonts               | `--ucf-*` only; who sets roles; who loads fonts                 |
| Changing a content component's markup | Major version plus a block deprecation                          |
| Tests                                 | What each component needs                                       |
| Gotchas that have already bitten      | The list not to "clean up"                                      |
| Comments                              | The tag vocabulary                                              |

## Working practices

- **Decide a component's kind and name before writing it.** Content or interactive changes what the core may
  do, how its block is built and whether its markup is frozen. Its block name is permanent
  once a site uses it (see "Naming").
- **A content core imports nothing at runtime.** No `react`, `@wordpress/*` or `next/*`.
  Host pieces come in through slots.
- **Never import a host into a core.** If a core needs something a host provides, add a slot.
- **New code ships with its test,** and a new test must be shown to fail: break the code,
  watch it go red, restore.
- **Never update a markup snapshot casually.** It means every saved post with that block
  changes. Follow "Changing a content component's markup".
- **Never verify a block through the front end.** Invalid blocks still render there. Check
  `wp.data.select( 'core/block-editor' ).getBlocks()` in the editor, and watch the console
  for "Updated Block".
- **Run everything before committing:** `npm run check` (tests, typecheck, all three linters,
  format), and `npm run test:stories` when a story or a component's markup changed. All are
  clean now; keep them that way, and don't silence a rule without writing down why.
- **Generated output is never committed or hand-edited:** `dist/`, `plugins/*/build/`,
  `storybook-static/`.
- **Comments say why, and are tagged.** The vocabulary is in the architecture doc. Keep a
  comment with its code when moving it, including the file paths it names.
