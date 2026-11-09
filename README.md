# UCF React Component Library

A framework-agnostic, React-based component library and testbench for UCF websites and
applications.

Components are written once in React and shipped to every place UCF builds pages:

- **WordPress:** as plugins grouped by content type (`ucf-content`, `ucf-degrees`).
- **Next, Puck and other React sites:** as the `@ucf/components` npm package.
- **The UCF block theme:** as a token kit, so its sections share the same colors and roles.
- **Storybook:** the catalog where every component can be seen on every section color.

| Read                                               | For                                                  |
| -------------------------------------------------- | ---------------------------------------------------- |
| [docs/first-component.md](docs/first-component.md) | Building a component, step by step: start here       |
| [docs/architecture.md](docs/architecture.md)       | How the library is built, and the rules it follows   |
| [CONTRIBUTING.md](CONTRIBUTING.md)                 | Issues, pull requests, and what tests a change needs |
| [docs/todo.md](docs/todo.md)                       | Open work                                            |

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
components/*/{name}/ ┬► npm run build:package ──► dist/components/ + dist/ucf.css   npm package
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
integrations/      how a component works in WordPress, Puck and Storybook, written once
                   for every component: what props and parts may declare (schema/), how each
                   environment reads it (wp/, puck/, storybook/), and the tests every
                   component must pass (tests/)
components/        one self-contained folder per component, in a bucket by role:
  primitives/      the pieces components are built from: Button, Image, Heading, Paragraph
                   (Puck places them; WordPress editors use core's blocks instead)
  content/         what editors place, saved as HTML, works without JavaScript: Section,
                   Highlight, Hero, Card
  live/            what editors place, fetched and written by the server, works without
                   JavaScript: Event List
  interactive/     what editors place, built in the browser: Degree Finder
examples/          reference code, not shipped: typechecked, linted and tested, but in no
                   Storybook, package or plugin
  fixed-card/      a Card that owns its parts as fields, with the Image primitive built in
  flexible-card/   the same Card as a frame (a copy of the shipped Card), to compare with
plugins/           one WordPress plugin per content type
  shared/          PHP every plugin carries, copied into each at build time
  ucf-content/     plugin.json lists its blocks: section, highlight, hero, card
  ucf-degrees/     degree-finder
  ucf-events/      event-list
tokens/tokens.json every value, role and composition (W3C Design Tokens format)
scripts/           the token, package, release and deploy scripts, and their tests
.storybook/        the catalog: theme, toolbar, logo
docs/              first-component.md (a walkthrough), architecture.md (how it works),
                   todo.md (open work)
```

## Commands

| Develop                 | Does                                                           |
| ----------------------- | -------------------------------------------------------------- |
| `npm run storybook`     | The catalog at http://localhost:6006                           |
| `npm run deploy:watch`  | Rebuild on every change and copy into your local sites (below) |
| `npm run deploy`        | Build once and copy into your local sites (below)              |
| `npm start`             | Rebuild the plugins on every change, without copying them      |
| `npm run new:component` | Start a component (see docs/first-component.md)                |

| Build                     | Does                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| `npm run build`           | Tokens, then the npm package, then the plugins                    |
| `npm run build:tokens`    | `tokens.json` into `dist/tokens/` and the theme kit `dist/theme/` |
| `npm run build:package`   | The npm package and its one stylesheet, `dist/ucf.css`            |
| `npm run build:plugins`   | Only the WordPress plugins, into `plugins/*/build/`               |
| `npm run build:storybook` | The catalog as a static site in `storybook-static/`               |
| `npm run release:temp`    | Build, then collect every output into `temp-release/` (see below) |

| Check                  | Does                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| `npm run check`        | Everything below except `test:stories`: run before committing                     |
| `npm test`             | Unit tests: markup, data clients, Puck configs, tokens (Node)                     |
| `npm run test:stories` | Every story, on every composition at three widths, with accessibility checks      |
| `npm run typecheck`    | TypeScript over everything                                                        |
| `npm run lint`         | All three linters: `lint:js` (ESLint), `lint:css` (Stylelint), `lint:php` (PHPCS) |
| `npm run format:check` | Prettier                                                                          |

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
activate, then add blocks from the inserter's **UCF Content**, **UCF Live** and **UCF
Interactive** categories (grouped by kind, as Storybook groups them). A template such as "Card: Pathway" is
a variation of its block, listed under the block's name.

To work on blocks in a development WordPress, see "Working against local sites" below.

Check a block in the editor, never on the front end, where an invalid block still renders:
`wp.data.select( 'core/block-editor' ).getBlocks()` in the console, and watch for "Updated Block".

### In the block theme

The theme takes its section colors from this repo. After changing `tokens.json`, run
`npm run release:temp`, copy the files in `temp-release/theme/` into the theme's `tokens/`
folder, then run the theme's `npm run build`. Its `npm run check:tokens` fails while its
`theme.json` presets disagree with the kit.

### In Next, Puck or another React site

To work against a local React site as you change components, see "Working against local
sites" below. Otherwise, copy the `.tgz` into the site and install it:

```sh
npm install ./ucf-components-{version}.tgz
```

```tsx
import { Section } from '@ucf/components/section';
import { Highlight } from '@ucf/components/highlight';
import { DegreeFinder } from '@ucf/components/degree-finder';
import '@ucf/components/ucf.css'; // tokens, compositions, the component layer, every component
import '@ucf/components/elements.css'; // optional: the block theme's headings and copy, in a Section

<Section composition="dark">
	<Highlight>
		<p className="ucf-c-highlight__statement">Florida’s largest university</p>
	</Highlight>
</Section>
<Section composition="light" width="wide">
	<DegreeFinder programType="master" />
</Section>
```

No CMS is needed: every component is plain React. A component with presets (the Card, so far)
also takes a preset by name and each part's content, so a site passes data and gets the same
design WordPress and Puck offer:

```tsx
import { Card } from '@ucf/components/card';

<Card
	preset="pathway"
	content={ {
		eyebrow: 'Transfer',
		display: 'I am transferring from a college',
		description: 'Credits, deadlines and the advisors who help.',
		link: { text: 'Transfer admission', url: '/transfer' },
	} }
/>
// Props win over the preset's: the pathway card on Bold Gold.
<Card preset="pathway" composition="gold" content={ { … } } />
// Children replace the preset's parts: the Card is still an open frame.
<Card preset="pathway">…</Card>
```

The preset sets the starting props and the parts, in its order and looks; `content` fills each
part by its name in `CARD_PARTS` (TypeScript checks the names, and that a link is
`{ text, url }`). A part with no content is left out, so sample copy can't reach a live page;
`sample` shows the preset's sample text and images, for prototyping. To place the parts yourself,
use the classes in `CARD_PARTS` (`CARD_PARTS.eyebrow.className`), or `presetContent()` from
`@ucf/components/react`.

The site loads the UCF fonts (Oswald, Montserrat, Roboto Mono). In Puck, each component's
config is the default export of `@ucf/components/{name}/puck`:

```tsx
import section from '@ucf/components/section/puck';
import highlight from '@ucf/components/highlight/puck';
import degreeFinder from '@ucf/components/degree-finder/puck';

const config = {
	components: {
		Section: section,
		Highlight: highlight,
		DegreeFinder: degreeFinder,
	},
};
// Section has a slot: other components are dropped inside it and take on its composition.
```

Primitives are at `@ucf/components/primitives/{name}/puck`. Register them as `Button`, `Image`,
`Heading` and `Paragraph`: the frames' starting templates name them by those keys.

```tsx
import card, { withPreset, withTemplate } from '@ucf/components/card/puck';

const config = {
	components: {
		// The Card stores its design and its content as data: a Design picker and a field for
		// each of the design's parts, rendered as the Card is on a React site. It needs no
		// primitives registered. In the editor, an empty part shows the design's sample text;
		// published, it is left out.
		Card: card,
		// Each design as its own Puck component, starting on it.
		PathwayCard: withPreset( 'pathway' ),
		// The "Open" design is the frame with a slot, for any components: this one starts
		// with the default design's parts as primitives (register them, as above).
		OpenCard: withTemplate(),
	},
};
```

## Working against local sites

To see changes in a local WordPress or React site while you work, tell this repo where they
are once:

```sh
cp .env.example .env   # then set WP_PLUGINS_DIR, PACKAGE_DIR, or both
npm run deploy:watch   # leave running; Ctrl-C stops it
```

| Setting          | Points at                                              | Gets                                      |
| ---------------- | ------------------------------------------------------ | ----------------------------------------- |
| `WP_PLUGINS_DIR` | A WordPress install's `wp-content/plugins`             | The plugins, replaced in place            |
| `PACKAGE_DIR`    | A folder in a React site, e.g. `vendor/ucf-components` | The npm package (`package.json`, `dist/`) |

`npm run deploy:watch` rebuilds on every change to `components/` and copies the result to each,
usually a couple of seconds after you save. A Next dev server picks up the package without a
reload; reload the WordPress editor to see block changes. `npm run deploy` does the same once.
Restart it after changing `tokens/tokens.json`, which it doesn't watch.

**A React site installs from that folder,** so list it in the site's `package.json` and run
`npm install` once:

```json
"@ucf/components": "file:./vendor/ucf-components"
```

WHY a copy inside the site, not a link to this repo: a link would load React from this repo's
`node_modules`, and two copies of React break every hook. The copied `package.json` also leaves
out `devDependencies`, which npm would otherwise install for a local folder.

**It refuses a wrong path** rather than delete something: `WP_PLUGINS_DIR` must be named `plugins`
with a `themes` folder beside it, and `PACKAGE_DIR` must be new or hold an earlier copy of this
package. In WordPress it replaces only this repo's plugins, and skips one that is symlinked in.
`.env` is never committed, so each person sets their own paths.

## Anatomy of a component

A component is one folder, `components/{bucket}/{name}/`, where the bucket is its role:
`primitives`, `content`, `live` or `interactive`. One file in it is the component itself, the
**core**. Every other file either connects the core to a platform (an **adapter**, for a
**host** such as WordPress or Puck) or ships it to an output. Outside the folder, only two lists
name it: `package.json` `exports` and one plugin's `plugin.json` (`npm run new:component`
adds both).

```
components/{bucket}/{name}/
  {Name}.tsx ─────────────┬─► index.ts ──────────► npm: @ucf/components/{name}
   the core               ├─► integrations/puck/ ─────► npm: @ucf/components/{name}/puck
                          ├─► integrations/wp/ ───────► WordPress: the plugin whose plugin.json lists it
                          └─► integrations/storybook/ ► Storybook
  style.css ──────────────┬─► npm: concatenated into ucf.css
                          └─► WordPress: imported by integrations/wp/, built into the block's CSS
```

### The core

`{Name}.tsx` is plain React: props in, markup out. Every host renders this same file, so the
HTML is the same everywhere. What it may do depends on its kind:

|                 | **Content (server)**: `highlight`             | **Live (server)**: `event-list`                              | **Interactive (client)**: `degree-finder`      |
| --------------- | --------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| Its HTML        | Must exist before JavaScript runs             | Must exist before JavaScript runs, from fetched data         | Built in the browser                           |
| The core may    | Take props and return markup, nothing else    | The same: the fetched data arrives as a prop                 | Hold state, run effects, fetch data            |
| Runtime imports | None (`import type` only)                     | None (`import type` only)                                    | `react` and its own files                      |
| First line      | Nothing special                               | Nothing special                                              | `'use client';`                                |
| Extra files     | `{Name}.props.ts`, `.parts.ts`, `.presets.ts` | `{Name}.props.ts`, `client.ts`, `types.ts`, `sample-data.ts` | `defaults.ts`, `client.ts`, `sample-client.ts` |

Anything that differs between hosts comes in through a **slot**: a content component's areas
(`area( 'content', … )` in the Section, Hero, Highlight and Card) take WordPress's inner-blocks
element or Puck's slot, and are a `<div>` elsewhere; the Hero's `media` area takes WordPress's
image picker. A core never imports a host or checks which one it is in. If it needs
something a host has, add a slot.

### Adapters

A **host** is a platform that renders components: WordPress, Puck, Next. An **adapter** is the
thin layer between a host and the core: it takes content from wherever that host keeps it and
passes it to the core as props. A host gets an adapter folder (`integrations/wp/`,
`integrations/puck/`) only when it needs files besides props.

- **`integrations/wp/`: the WordPress block.** `block.json` names the block (`{plugin}/{name}`, in the
  **UCF Content**, **UCF Live** or **UCF Interactive** inserter category, by kind) and declares the attributes WordPress stores. `index.tsx`
  registers it, with its icon from `@wordpress/icons` (and its templates as variations, if it
  has any). `edit.tsx` renders the core in the editor, with fields in its slots. Then,
  by kind:
    - **Content: `save.tsx`** renders the core with the saved strings. WordPress stores that HTML
      in the post, which is why a content component's markup is frozen once a site uses it.
    - **Live: `render.php` + `client.php` + `markup.php`.** On each request PHP fetches the
      data (cached), and writes the whole HTML: the same markup as the core, in PHP, because
      PHP can't run React. `tests/{Name}.php.test.tsx` runs the PHP and fails when its HTML
      differs from the core's. Nothing is saved but the attributes, so the markup isn't frozen.
    - **Interactive: `render.php` + `view.tsx`.** PHP writes an empty container carrying the
      props as JSON (plus a plain link for visitors without JavaScript), and `view.tsx` mounts
      the core into it in the browser. `settings.ts` reads that JSON.
- **`integrations/puck/config.tsx`: the Puck config.** A plain object in Puck's shape
  ([integrations/puck/types.ts](integrations/puck/types.ts)): `fields` for the editor,
  `defaultProps`, and `render`, which renders the core. Typed against that local copy so the
  library needs no Puck dependency. `render` passes the core only its own props: Puck also
  sends `id`, `puck` and `editMode`, which would otherwise end up in the markup.
- **Next and other React sites have no adapter.** They render the core directly from
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

| Host          | How a section gets its composition                                           |
| ------------- | ---------------------------------------------------------------------------- |
| Next, Puck, … | The Section component (`ucf-composition-{slug}`); none means Light - Default |
| WordPress     | The Section block, in the same way; its classes ship in the plugin           |
| Storybook     | Every story sits in a real Section, set by the **Composition** toolbar menu  |

The roles themselves live in `tokens/tokens.json`. See "Tokens, roles and fonts" in
[architecture.md](docs/architecture.md).

## Adding a component

**[docs/first-component.md](docs/first-component.md) walks you through it,** from
`npm run new:component` to a block in WordPress, step by step. It ends with a table of what to
edit for each later change.

## Before committing

```sh
npm run check
npm run test:stories   # when a story or a component's markup changed
```

GitHub Actions runs the same checks: `ci.yml` on every push (tests, typecheck and build block;
lint and formatting are advisory), and `ci-full.yml` on pull requests and `main` (the story
accessibility checks). All are clean now; keep them that way. Never update a content component's markup snapshot
casually: every saved post with that block changes. Follow "Changing a content component's
markup" in [architecture.md](docs/architecture.md).
