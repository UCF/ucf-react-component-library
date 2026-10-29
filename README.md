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
| `npm test`                | Unit tests: markup, data clients, Puck configs, tokens (Node)     |
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

## Anatomy of a component

A component is one folder, `components/{name}/`. One file in it is the component itself, the
**core**. Every other file either feeds the core from somewhere (a **host**) or ships it to an
output. Nothing outside the folder needs to change except two lists (step 4 below).

```
components/{name}/
  {Name}.tsx ─────────────┬─► index.ts ──────────► npm: @ucf/components/{name}
   the core               ├─► hosts/puck/ ───────► npm: @ucf/components/{name}/puck
                          ├─► hosts/wp/ ─────────► WordPress: the plugin whose plugin.json lists it
                          └─► {Name}.stories.tsx ► Storybook
  style.css ──────────────┬─► npm: concatenated into ucf.css
                          └─► WordPress: imported by hosts/wp/, built into the block's CSS
```

### The core

`{Name}.tsx` is plain React: props in, markup out. Every host renders this same file, so the
HTML is the same everywhere. What it may do depends on its kind:

|                 | **Content (server)**: `stat`               | **Interactive (client)**: `degree-finder`      |
| --------------- | ------------------------------------------ | ---------------------------------------------- |
| Its HTML        | Must exist before JavaScript runs          | Built in the browser                           |
| The core may    | Take props and return markup, nothing else | Hold state, run effects, fetch data            |
| Runtime imports | None (`import type` only)                  | `react` and its own files                      |
| First line      | Nothing special                            | `'use client';`                                |
| Extra files     | `example.json`: sample props               | `defaults.ts`, `client.ts`, `sample-client.ts` |

Anything that differs between hosts comes in as a prop, a **slot**: Stat's `linkAs` takes
`next/link` in Next and defaults to `<a>` elsewhere; its `statement` takes a string when saved
and a text field in the WordPress editor. A core never imports a host or checks which one it
is in. If it needs something a host has, add a slot.

### Hosts

A host is a thin adapter: it takes content from wherever that platform keeps it and passes it
to the core as props. A platform gets a folder in `hosts/` only when it needs files besides
props.

- **`hosts/wp/`: the WordPress block.** `block.json` names the block (`{plugin}/{name}`, in the
  **UCF** inserter category) and declares the attributes WordPress stores. `index.tsx`
  registers it. `edit.tsx` renders the core in the editor, with fields in its slots. Then,
  by kind:
    - **Content: `save.tsx`** renders the core with the saved strings. WordPress stores that HTML
      in the post, which is why a content component's markup is frozen once a site uses it.
    - **Interactive: `render.php` + `view.tsx`.** PHP writes an empty container carrying the
      props as JSON (plus a plain link for visitors without JavaScript), and `view.tsx` mounts
      the core into it in the browser. `settings.ts` reads that JSON.
- **`hosts/puck/config.tsx`: the Puck config.** A plain object in Puck's shape
  ([components/shared/puck.ts](components/shared/puck.ts)): `fields` for the editor,
  `defaultProps`, and `render`, which renders the core. Typed against that local copy so the
  library needs no Puck dependency. `render` passes the core only its own props: Puck also
  sends `id`, `puck` and `editMode`, which would otherwise end up in the markup.
- **Next and other React sites have no host folder.** They render the core directly from
  `@ucf/components/{name}` and pass their pieces in through slots.

Keep the props each host stores as plain strings with the same names (block attributes, Puck
fields), so content can move between hosts as-is.

### Section colors (compositions)

A component never picks its colors. The **section** it sits in has a composition (Light -
Default, Light Alt, Dark, Dark Alt, Bold Gold), and the composition sets **roles**: what the
accent, body text, muted text, line and so on are on that background. The component only
reads roles, so it fits whatever section it lands in.

The component's part:

- Put one class on its outer element, beside its own `ucf-c-{name}`:
    - `ucf-c` if it sits on the section (a stat, a quote): it uses the section's roles.
    - `ucf-c-panel` if it paints its own background (a finder, a boxed card): it uses the
      section's panel roles, so on Bold Gold it looks as it does on Light Alt.
- In `style.css`, read colors only as `var(--ucf-c-{role})` (`--ucf-c-accent`, `--ucf-c-body`,
  `--ucf-c-muted`…), plus `var(--ucf-c-bar-{role})` for a control bar. Never a hex value or a
  fallback chain; `npm test` fails on a role `tokens.json` doesn't define.

Who sets the section, per host. The slugs are `light`, `alt`, `dark`, `dark-alt` and `gold`:

| Host          | How a section gets its composition                                   |
| ------------- | -------------------------------------------------------------------- |
| Next, Puck, … | A wrapper with `ucf-composition-{slug}`; none means Light - Default  |
| WordPress     | The block theme: an editor picks a section style (`is-style-{slug}`) |
| Storybook     | The **Composition** toolbar menu                                     |

The roles themselves live in `tokens/tokens.json`. See "Tokens, roles and fonts" in
[architecture.md](docs/architecture.md).

## Adding a component

**1. Decide its kind and name.** Kind is the table above: does its HTML need to exist before
JavaScript runs? Content is a plain noun (Quote, Card); interactive is subject plus task
(Tuition Calculator). One name everywhere: folder `quote`, React `Quote`, CSS `ucf-c-quote`,
block `ucf-content/quote`. Block names and a content block's attribute names are stored in
posts, so they are permanent once a site uses them. Settle them first
([architecture.md](docs/architecture.md), "Two kinds of component" and "Naming").

**2. Copy the closer of the two existing components** (`stat` or `degree-finder`) and rename.
Every component has:

```
{Name}.tsx            the core
index.ts              what the npm package exports
style.css             colors as var(--ucf-c-{role}) only
{Name}.stories.tsx    title 'Content (Server)/{Name}' or 'Interactive (Client)/{Name}',
                      tags [ 'server' ] or [ 'client' ], first story `Default`
hosts/puck/config.tsx also add it to CONFIGS in components/shared/puck.test.tsx
hosts/wp/             block.json, index.tsx, edit.tsx, and save.tsx or render.php + view.tsx
```

Plus, for content: `example.json` (shared by the story, the test and the inserter preview) and
`{Name}.test.tsx`, the markup contract (copy `Stat.test.tsx`). For interactive: `defaults.ts`,
`client.ts` (the only file that knows its API's response shape), `client.test.ts` (with a fake
`fetch`) and `sample-client.ts` (the same interface with no network, for stories).

**3. Apply the section colors:** `ucf-c` or `ucf-c-panel` on the outer element, roles only in
`style.css` (see "Section colors" above).

**4. Add it to the two lists.** Storybook and the package build find it on their own; these
don't:

- **`package.json` `exports`:** `./{name}` and `./{name}/puck` (and `./{name}/example.json`
  for content). This is what makes it importable from `@ucf/components`.
- **One `plugins/*/plugin.json`:** add the name to `blocks`, and name the block after that
  plugin (`ucf-degrees/…`). The build fails if a block is in no plugin, or in two. An
  interactive block with site settings also gets a settings function in that plugin's main PHP
  file, like `ucf_degrees_degree_finder_settings()`.

**5. Check it.** In Storybook, open it on every composition from the toolbar. Run
`npm run release:temp` and try the block in WordPress's editor (never judge a block from the
front end). Then run everything below. New tests must be shown to fail: break the code, watch
it go red, restore.

## Before committing

```sh
npm test && npm run typecheck && npm run lint:js && npm run lint:css \
  && npm run lint:php && npm run format:check
npm run test:stories   # when a story or a component's markup changed
```

All are clean now; keep them that way. Never update a content component's markup snapshot
casually: every saved post with that block changes. Follow "Changing a content component's
markup" in [architecture.md](docs/architecture.md).
