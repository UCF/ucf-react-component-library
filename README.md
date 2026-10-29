# UCF React Component Library

A framework-agnostic, React-based component library and testbench for UCF websites and
applications.

Components are written once in React and shipped to every place UCF builds pages:

- **WordPress:** as plugins grouped by content type (`ucf-content`, `ucf-degrees`).
- **Next, Puck and other React sites:** as the `@ucf/components` npm package.
- **The UCF block theme:** as a token kit, so its sections share the same colors and roles.
- **Storybook:** the catalog where every component can be seen on every section color.

How it works and why: [docs/architecture.md](docs/architecture.md). What's next:
[docs/todo.md](docs/todo.md).

## Quick start

Node 22.22, 24.15 or 26+ (`.nvmrc` pins 24).

```sh
nvm use
npm install
composer install          # only for `npm run lint:php`
npx playwright install chromium   # only for `npm run test:stories`
npm run storybook         # the catalog at http://localhost:6006
```

In Storybook, the **Composition** menu in the toolbar puts every story on Light - Default,
Light Alt, Dark, Dark Alt or Bold Gold.

## How it all flows

Two sources feed every output: `tokens/tokens.json` (every value, plus the roles and
compositions built on them) and `components/` (one folder per component).

```
tokens/tokens.json ──► npm run build:tokens ──► dist/tokens/base.css       tokens, compositions,
        │                                        │                          the component layer
        │                                        ├► dist/tokens/base-wp.css  the same for WordPress
        │                                        └► dist/theme/              the block theme's kit
        │                                                │
        │                                                └──► block theme: its tokens/ folder
        ▼
components/{name}/ ──┬► npm run build:package ──► dist/{name}/ + dist/ucf.css   npm package
                     │                                 └─► Next, Puck: import from @ucf/components
                     ├► npm run build:plugins ──► plugins/{plugin}/build/       WordPress plugins
                     │                                 └─► npm run release:temp: temp-release/wordpress/*.zip
                     └► npm run storybook ──────► the catalog
```

`npm run build` runs tokens, then the package, then the plugins. Everything the scripts write
(`dist/`, `plugins/*/build/`, `temp-release/`, `storybook-static/`) is generated: never edit or
commit it.

**Colors never live in a component.** A component reads roles such as `--ucf-c-accent`, and the
section it sits in decides what they are. Change a color or role in `tokens.json`, run
`npm run build:tokens`, and every component, every host and (after its sync) the block theme
follow. `npm test` checks the contrast of every role pair whenever `tokens.json` changes.

## Layout

```
components/        one self-contained folder per component
  shared/          the Puck config shape, written out so the library needs no Puck dependency
  stat/            a content component: works without JavaScript, saved as HTML
  degree-finder/   an interactive component: built in the browser
plugins/           one WordPress plugin per content type
  shared/          PHP every plugin carries, copied into each at build time
  ucf-content/     plugin.json lists its blocks: stat
  ucf-degrees/     degree-finder
tokens/tokens.json every value, role and composition (W3C Design Tokens format)
scripts/           the token, package and release scripts, and the token tests
.storybook/        the catalog: theme, toolbar, logo
docs/              architecture.md (how and why), todo.md (what's next)
```

## Commands

| Command                   | Does                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| `npm run storybook`       | The catalog at http://localhost:6006                              |
| `npm run build`           | Tokens, then the npm package, then the plugins                    |
| `npm run build:tokens`    | `tokens.json` into `dist/tokens/` and the theme kit `dist/theme/` |
| `npm run build:package`   | The npm package and its one stylesheet, `dist/ucf.css`            |
| `npm run build:plugins`   | Only the WordPress plugins, into `plugins/*/build/`               |
| `npm start`               | Rebuild the plugins on every change                               |
| `npm run release:temp`    | Build, then collect every output into `temp-release/` (see below) |
| `npm run build:storybook` | The catalog as a static site in `storybook-static/`               |
| `npm test`                | Unit tests: markup, data clients, tokens and contrast (Node)      |
| `npm run test:stories`    | Every story in headless Chromium, with accessibility checks       |
| `npm run typecheck`       | TypeScript over everything                                        |
| `npm run lint:js`         | ESLint                                                            |
| `npm run lint:css`        | Stylelint                                                         |
| `npm run lint:php`        | PHPCS, WordPress standard                                         |
| `npm run format:check`    | Prettier                                                          |

## Using it

```sh
npm run release:temp
```

That builds everything and collects it into `temp-release/`, one folder for each kind of site,
with a README that explains each. Hand over the folder, or the part someone needs.

**These builds are temporary.** They stand in for a real release until we decide how the plugins
and package are published (docs/todo.md). They are generated and never committed, and the "temp"
names go away when a release pipeline replaces them.

| Folder                                            | For                              |
| ------------------------------------------------- | -------------------------------- |
| `temp-release/wordpress/{plugin}.zip`             | WordPress: one zip per plugin    |
| `temp-release/react/ucf-components-{version}.tgz` | Next, Puck or another React site |
| `temp-release/theme/`                             | The block theme's token kit      |

### In WordPress

Upload each zip under **Plugins → Add New → Upload** (or unzip into `wp-content/plugins/`),
activate, then add blocks from the **UCF** category of the inserter.

To work on a block, copy or symlink `plugins/{plugin}` into a development WordPress's
`wp-content/plugins/` and leave `npm start` running. If WordPress runs in a container, a symlink
to a folder outside what the container mounts won't resolve; copy instead.

Check a block in the editor, never on the front end, where an invalid block still renders:
`wp.data.select( 'core/block-editor' ).getBlocks()` in the console, and watch for "Updated Block".

### In the block theme

The theme takes its section colors from this repo. After changing `tokens.json`, run
`npm run release:temp`, copy the files in `temp-release/theme/` into the theme's `tokens/`
folder, then run the theme's `npm run build`. Its `npm run check:tokens` fails while its
`theme.json` presets disagree with the kit.

### In Next, Puck or another React site

Copy the `.tgz` into the site and install it:

```sh
npm install ./ucf-components-{version}.tgz
```

```tsx
import Link from 'next/link';
import { Stat } from '@ucf/components/stat';
import { DegreeFinder } from '@ucf/components/degree-finder';
import '@ucf/components/ucf.css'; // tokens, compositions, the component layer, every component

<Stat linkAs={ Link } statement="…" />
<section className="ucf-composition-dark">
	<Stat linkAs={ Link } statement="…" />
</section>
<DegreeFinder programType="master" />
```

The site loads the UCF fonts (Oswald, Montserrat, Roboto Mono). In Puck, each component's
config is the default export of `@ucf/components/{name}/puck`:

```tsx
import stat from '@ucf/components/stat/puck';
import degreeFinder from '@ucf/components/degree-finder/puck';

const config = { components: { Stat: stat, DegreeFinder: degreeFinder } };
```

## Adding a component

**1. Decide its kind and name.** This decides what its core may do and how its block is built
([architecture.md](docs/architecture.md), "Two kinds of component" and "Naming").

| Kind                     | Its HTML                          | The core may                       | Example         |
| ------------------------ | --------------------------------- | ---------------------------------- | --------------- |
| **Content (server)**     | Must exist before JavaScript runs | Take props and return markup, only | `stat`          |
| **Interactive (client)** | Built in the browser              | Hold state, run effects, fetch     | `degree-finder` |

Content is a plain noun (Quote, Card); interactive is subject plus task (Tuition Calculator).
One name everywhere: folder `quote`, React `Quote`, CSS `ucf-c-quote`, block `ucf-content/quote`.
Block names are permanent once a site uses them, so settle them first.

**2. Create `components/{name}/`.** Copy the closer of the two existing components:

```
components/{name}/
  {Name}.tsx            the core. Content: no runtime imports. Interactive: 'use client' first.
  index.ts              what the npm package exports
  style.css             colors as var(--ucf-c-{role}) only
  {Name}.stories.tsx    title 'Content (Server)/{Name}' or 'Interactive (Client)/{Name}',
                        tags [ 'server' ] or [ 'client' ], first story `Default`
  example.json          content: sample props, shared by the story, the test and the inserter
  {Name}.test.tsx       content: the markup contract (copy Stat.test.tsx)
  defaults.ts           interactive: default props
  client.ts             interactive: the only file that knows its API's response shape
  client.test.ts        interactive: what it requests and keeps, with a fake fetch
  sample-client.ts      interactive: the same interface with no network, for stories
  hosts/puck/config.tsx a plain object in Puck's shape (see components/shared/puck.ts)
  hosts/wp/             block.json, index.tsx, edit.tsx, then
                        content:     save.tsx
                        interactive: render.php, view.tsx, settings.ts
```

**3. Make it follow the section colors.** Put one class on its outer element, beside its own:

- `ucf-c` if it sits on the section (a stat, a quote).
- `ucf-c-panel` if it paints its own background (a finder, a boxed card). On Bold Gold it then
  looks as it does on Light Alt.

Then read colors only as `var(--ucf-c-accent)`, `var(--ucf-c-body)` and so on, plus
`var(--ucf-c-bar-*)` for a control bar. Never a hex value, never a fallback chain.

**4. Wire it in.**

- `package.json` `exports`: add `./{name}` and `./{name}/puck` (and `./{name}/example.json`
  for a content component).
- One `plugins/*/plugin.json`: add the name to `blocks`, and name the block after that plugin
  (`ucf-degrees/…`). The build fails if a block is in no plugin, or in two.
- Interactive blocks with site settings: a settings function in that plugin's main PHP file,
  like `ucf_degrees_degree_finder_settings()`.

**5. Check it.** In Storybook, open it on every composition from the toolbar. Then run
everything below. New tests must be shown to fail: break the code, watch it go red, restore.

## Before committing

```sh
npm test && npm run typecheck && npm run lint:js && npm run lint:css \
  && npm run lint:php && npm run format:check
npm run test:stories   # when a story or a component's markup changed
```

All are clean now; keep them that way. Never update a content component's markup snapshot
casually: every saved post with that block changes. Follow "Changing a content component's
markup" in [architecture.md](docs/architecture.md).
