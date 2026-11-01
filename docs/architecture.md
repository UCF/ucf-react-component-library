# Architecture

The single source for this repo's conventions and the reasoning behind them. `README.md` and
`CLAUDE.md` point here rather than restating it.

---

## One source, two outputs

Every component is written once, as React, in `components/{name}/`. From that:

| Output            | Built by                | For                                       |
| ----------------- | ----------------------- | ----------------------------------------- |
| `@ucf/components` | `npm run build:package` | Any React host: Next, Puck, Remix, Astro… |
| WordPress plugins | `npm run build:plugins` | WordPress, one plugin per content type    |

## The three layers

Read from most portable to least. Each layer works without the ones below it.

1. **Tokens.** `tokens/tokens.json` built to CSS custom properties (`--ucf-color-gold`). Any
   host can read them.
2. **Markup and CSS.** The HTML a component produces, with `ucf-c-` classes, plus its
   `style.css`. Any framework or template language can output that HTML and look the same. The
   markup test's snapshot is the record of it.
3. **The React component.** One convenient way to produce that markup, for React hosts.

**WHY this order matters:** the markup is the real product. React is how we write it today. A
host that can't run React still gets layers 1 and 2: the markup snapshot in each content
component's test is the HTML to copy.

## Two kinds of component

Decided by one question: **does the component's HTML need to be on the page before JavaScript
runs** (for search engines, for visitors without JavaScript, for WordPress to save it)?

- **Content (server): works without JavaScript.** Something people read: a stat, a card, a
  quote, a section. Its HTML is complete before any script runs.
- **Interactive (client): needs JavaScript.** Something people use: a degree finder, a search,
  a filter, a form. Its real UI is built in the browser.

|                 | Content component                                   | Interactive component                                                     |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| Example         | `stat`                                              | `degree-finder`                                                           |
| Renders         | Server: saved in the post or server-rendered        | Client: the browser builds what a visitor uses                            |
| In Next         | Can be a Server Component                           | Needs `'use client'`                                                      |
| Needs its HTML? | Yes                                                 | No: what a visitor uses is what its script builds                         |
| The core may    | Take props and return markup. Nothing else.         | Hold state, run effects, fetch data                                       |
| Runtime imports | None (`import type` only)                           | `react`, and its own modules                                              |
| WordPress block | Static: `save()` stores the core's HTML in the post | Dynamic: `render.php` writes a container, `view.tsx` mounts the component |
| Changing markup | Breaks every saved post without a deprecation       | Free: nothing is saved                                                    |
| Non-React hosts | Copy the markup from its test snapshot              | Not supported; mount it as an island if needed                            |

**WHY a content core imports nothing at runtime:** WordPress's `save()` renders it
synchronously, once, to a string, and stores the result. Anything that varies between renders
(state, effects, data) would produce HTML that no longer matches what was saved.

**WHY an interactive component may share its whole tree:** nothing stores its HTML, so there is nothing for a
later render to disagree with. That is what lets one stateful component run unchanged in the
WordPress editor, on the WordPress front end, in Next and in Puck.

**An accordion is content, not interactive.** So are tabs and a carousel: visitors click them,
but their text must be in the page. The core still only returns markup, with every panel in
it; a separate script (the block's `viewScript`) adds the behavior on top, and the core gets no
state or effects. The rule: **if the behavior only shows or hides what is already in the HTML,
it's content. If it fetches, computes or builds what is shown, it's interactive.**

**WHY "interactive", not "app", "widget", "tool" or "dynamic":** "app" sounds like a whole
application; older WordPress uses "widget" for sidebar widgets, which readers still know;
"tool" sounds internal. "Dynamic" (and "static" for content) is the trap: WordPress and Next
already use both words for how a host builds HTML, not for what a component does. The planned
live content (below) would be a WordPress dynamic block yet follow content rules.

**"Server" and "client" mean where the HTML a visitor needs comes from,** not which machine
runs the code. UPSTREAM: Next renders `'use client'` components on the server too, for the
first load, then the browser takes over. That first HTML is not what the visitor uses, so an
interactive component is still "client."

### A second label: where the data comes from

Kind (content or interactive) says what a component is. **Data** says where what it shows
comes from: **authored** (an editor types it in, it arrives as props) or **live** (fetched from
an API). Together they describe every component, and how each host renders it follows:

|                 | Authored                          | Live                                              |
| --------------- | --------------------------------- | ------------------------------------------------- |
| **Content**     | `stat`, a quote, a card           | **Live content**, not built yet: the degree facts |
| **Interactive** | A calculator that fetches nothing | `degree-finder`                                   |

**Live content is the hard corner.** Its live data must be in the HTML (it is content), so in
WordPress PHP renders it on each request, and PHP can't run React. Its markup exists twice, in
React and in PHP, and a test must compare the two. See `docs/todo.md`.

## Naming

One name per component, spelled the same way in every layer:

| Layer   | Form                         | Example                            |
| ------- | ---------------------------- | ---------------------------------- |
| Folder  | kebab-case                   | `components/stat`                  |
| React   | PascalCase                   | `Stat`                             |
| CSS     | `ucf-c-{name}`, BEM below it | `ucf-c-stat__detail`               |
| Block   | `{plugin}/{name}`            | `ucf-content/stat`                 |
| Display | Title case, short            | "Stat" (Storybook, inserter, Puck) |

- **Content is named for what a reader sees,** a plain noun: Stat, Quote, Card, Section. No
  suffix; how it reads goes in the description ("a fact written as a complete statement").
- **Interactive is named for the subject and the task:** Degree Finder, Tuition Calculator,
  Event Search. WHY not "picker": it reads as one form control, like a date picker, not a
  whole tool.
- **In Storybook, a component sits under its kind** and carries the matching tag:
  `Content (Server)/Stat` with `tags: [ 'server' ]`, `Interactive (Client)/Degree Finder`
  with `tags: [ 'client' ]`. Its first story is `Default`. Section colors are not separate
  stories; the Composition toolbar sets them.
- **Display names can change any time;** nothing stores them. **Block names and a content
  block's attribute names are stored in every post** that uses the block, so once a site uses
  them they are permanent. Settle them before the first deploy.

## A component's folder

```
components/{name}/
  {Name}.tsx            the core
  index.ts              what the npm package exports for it
  style.css             reads --ucf-* only
  example.json          content components: sample props, used by stories, test, inserter
  defaults.ts           interactive components: default props, read by every host
  client.ts             interactive components: the only file that knows its API's response shape
  sample-client.ts      interactive components: the same interface with no network
  types.ts
  {Name}.stories.tsx    Storybook
  *.test.ts(x)          next to what they test
  adapters/
    wp/                 block.json, index.tsx, edit.tsx, and save.tsx or render.php + view.tsx
    puck/config.tsx     a plain object in Puck's ComponentConfig shape
```

Each folder is self-contained, so a component can move into its own package or another repo
without untangling it from the others.

**There is no `next/` adapter.** Next's pieces go in through slots (below), so the library holds
no Next code. A host gets an adapter only when it needs something besides props, like Puck's
config object or WordPress's block files. WHY "adapter" for the folder and "host" for the
platform: `adapters/wp/` is not WordPress, it is the code that plugs the core into WordPress.

## Slots

A slot is a prop that takes something each host provides. The core never checks which host
it is in.

| Slot     | Next passes          | WordPress passes                          | Puck passes |
| -------- | -------------------- | ----------------------------------------- | ----------- |
| `linkAs` | `next/link`          | nothing (default `<a>`)                   | nothing     |
| text     | a string             | a string in `save()`, a field in `edit()` | a string    |
| `client` | a client for its API | nothing (default client)                  | nothing     |

A slot only covers what was made a slot. A core that imports `next/link` directly is tied to
Next, and the WordPress build fails on it.

## Core blocks and our primitives

Decided 2026-10-30. **If a WordPress core block saves just a plain HTML element, use core. If it
needs structure WordPress invents (wrappers, layout classes, inline styles, settings that
change its markup), we own it**, as a component here with the same markup in every host.

| Use core: it is just the element                 | Own it: structure we must control                  |
| ------------------------------------------------ | -------------------------------------------------- |
| Paragraph, Heading, List, Quote, Separator, Code | Section (in place of Group), Columns and Column    |
| Table (styled by `elements.css`; see below)      | Cover / Hero, Buttons and Button, Image and Figure |
|                                                  | Media and text, Gallery, Details / Accordion, Tabs |

- **WHY core for plain text:** Paragraph, Heading and List save bare `<p>`, `<h2>`, `<ul>`, the
  same elements Puck and Next render, so they are already at parity, and rebuilding their
  editing (levels, anchors, splitting, pasting) would gain nothing. `elements.css` styles them in
  React hosts; the theme does in WordPress.
- **WHY our own for the rest:** core's markup carries wrappers and classes we don't choose,
  global styles inject inline CSS, its design controls let editors break the system, and
  WordPress changes it between releases. A core block and a Puck component can never share a
  markup test; ours can (`_config/parity.test.tsx`, `_config/blocks.test.tsx`).
- **Own the block, borrow the editor pieces.** A primitive's `edit` uses Gutenberg's editor
  components (`RichText`, `LinkControl`, `MediaUpload`), so editors keep the familiar tools,
  while `save()` writes our markup. Our Image keeps `wp-image-{id}` on the `<img>`, so WordPress
  still adds responsive sizes and lazy loading when it renders the page.
- **Edge cases:** Table stays core (rebuilding a table editor is a large job); own only a special
  one, such as the theme's Comparison table. Block bindings started as core-block-only; check
  current support for custom blocks before a design relies on them.
- **Keep core out of the way:** allow only core's text blocks plus ours (`allowedBlocks` on our
  containers, the `allowed_block_types_all` filter in the plugin), and turn off core's design
  controls (custom colors, font sizes, spacing, borders) so editors pick our variants.
- **The cost:** our primitives' saved markup is ours to keep stable, with a deprecation when it
  changes. Keep it minimal and semantic; the stored-markup snapshots catch any change.

**Not shadcn or Tailwind for saved blocks.** A block saves its classes into every post. Utility
classes put the styling in the saved markup, so restyling would invalidate posts and need a
deprecation each time; our named classes leave the styling in CSS. Interactive widgets (dialogs,
menus, comboboxes, React-only tabs) may use Radix, unstyled, with our CSS: they are built in the
browser and nothing is saved. Content that only shows or hides what is already in the HTML (tabs
and accordions with editorial text) stays a content block with a small script on top (the
Interactivity API in WordPress), per "Two kinds of component".

## Distribution

### npm: one package

`@ucf/components`, one version, a path per component (`@ucf/components/stat`,
`@ucf/components/degree-finder`, `…/puck`), and one stylesheet, `ucf.css`: tokens, compositions,
the component layer and every component's styles. A site imports it once.

**WHY one package, not one per component:** a package per component costs a version, a
changelog and release tooling per component, and lets components drift onto different
versions of the tokens. That is worth paying only once there's a catalog to manage them. The
direction is: split into per-component packages later, together with Storybook as the
catalog. Until then, keep every component folder self-contained so the split is a move.

**WHY `"private": true`:** nothing publishes yet. Remove it when the release job exists.

`dist/` is ES modules (`dist/package.json` sets `"type": "module"`). It is not committed.

### WordPress: one plugin per content type

`plugins/{plugin}/` is a plugin: its main PHP file, and `plugin.json` listing the components
whose blocks it ships. `build:plugins` builds each into `plugins/{plugin}/build/`.

| Plugin        | Blocks                                    |
| ------------- | ----------------------------------------- |
| `ucf-content` | `ucf-content/section`, `ucf-content/stat` |
| `ucf-degrees` | `ucf-degrees/degree-finder`               |

- **The plugin owns its list,** so a plugin's contents are readable in one place. The build
  fails if a component with a `adapters/wp/` is in no plugin or in two.
- **Each block is namespaced by its plugin,** so blocks from different plugins never clash and
  the name says where to look.
- **`plugins/shared/shared.php` is copied into every plugin** as `build/shared.php`, so each
  plugin installs on its own. With two active, the first copy loaded wins and the second is a
  no-op; keep it backward compatible.
- **Every plugin carries `base.css`** (tokens pointing at the theme, and the component layer)
  under one style handle, so it loads once.

Installed by zip for now (`npm run release:temp` writes them to `temp-release/wordpress/`), or
copied into a development WordPress by `npm run deploy` (or on every change,
`npm run deploy:watch`), which reads the folder from a local `.env` (template:
`.env.example`). The same commands copy the npm package into a local React site; see "Working
against local sites" in the README. How sites will get them through Composer is in
`docs/todo.md`.

## Tokens, roles and fonts

**Component CSS reads `--ucf-*` names only, never `--wp--preset--*`.** That is what lets one
stylesheet work in every host.

**Plain elements are the host's, with one opt-in.** Components style only their own classes;
headings, body copy and links are styled by the host (the block theme in WordPress). For React
hosts, `@ucf/components/elements.css` (`styles/elements.css`) copies the theme's element styles,
scoped to a Section or `.ucf-elements` and at zero specificity, so it never restyles a site's own
chrome or beats a component. Storybook and the Puck demo load it.

**Layout widths are tokens too** (`tokens.json` `layout`: `content` 720px, `wide` 1240px, read as
`--ucf-layout-content` and `--ucf-layout-wide`). In WordPress they point at the active theme's
own `--wp--style--global--content-size` and `wide-size`, from its theme.json `settings.layout`,
so the Section's Default (wideSize) and Constrained (contentSize) widths are always the theme's. Elsewhere they are the token
values, which match the UCF block theme.

- **Tokens** (`--ucf-color-gold`) hold values. React hosts get the values in `ucf.css`. WordPress
  gets `base.css`, in which each token points at the theme's preset
  (`var(--wp--preset--color--gold, #EDB80D)`), so the active `theme.json` wins.
- **Roles** (`--ucf-accent`, `--ucf-body`, `--ucf-muted`, `--ucf-line`) say what a color is
  _for_, on whatever background a component sits on. Components read a role first and fall
  back to a token: `var(--ucf-accent, var(--ucf-color-gold))`.

### Roles are data in tokens.json

`tokens.json` is in the W3C Design Tokens format (DTCG): `$value`, `$description`,
`"{color.gold}"` references, UCF's own fields under `$extensions["edu.ucf"]`. Besides the
primitives it has two role groups, both references to colors and never values:

- **`treatment`**: `light`, `dark`, `gold`. Each gives every role a color. Every treatment
  defines the same roles; the build fails otherwise.
- **`composition`**: `light` (Light - Default), `alt` (Light Alt), `dark` (Dark), `dark-alt` (Dark Alt),
  `gold` (Bold Gold). A background, a text color and a treatment (in `$extensions`), plus an
  optional `raised` override. Each Alt shares its treatment with its base but not its
  background, and overrides `raised` so a panel still shows on it.
- **The slug `alt` stays `alt`,** not `light-alt`: the block theme saves it in posts as the
  `is-style-alt` class.
- **A composition names other compositions for the surfaces inside it** (in `$extensions`).
  One mechanism, two surfaces:

    | Surface | Is                                               | Named by                                                       |
    | ------- | ------------------------------------------------ | -------------------------------------------------------------- |
    | `panel` | An object set on the section (the Degree Finder) | Bold Gold → Light Alt. Others name none.                       |
    | `bar`   | A control bar inside it (the finder's footer)    | Light, Light Alt, Bold Gold → Dark; Dark, Dark Alt → Light Alt |

    The build writes the named composition's roles as `--ucf-panel-{role}` and `--ucf-bar-{role}`,
    and the component layer turns them into `--ucf-c-{role}` (panel first, for `ucf-c-panel`)
    and `--ucf-c-bar-{role}`. So a finder on gold looks exactly as on Light Alt, and its footer is
    black on light sections and gray-050 on dark ones, with no roles of their own.
    WHY one mechanism: each is "a surface that uses another composition's roles". A new kind of
    surface is a new row in build-tokens.mjs, not a set of new roles in every treatment.
    FIX: a composition that names no panel sets each panel role to `initial`, so a Dark section
    inside a Bold Gold one does not inherit Light Alt panels.

Who sets the roles:

| Host          | Outside a section                       | On a section                                                                                           |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Next, Puck, … | `ucf.css` sets the light roles          | `ucf.css`: `.ucf-composition-dark` …                                                                   |
| WordPress     | Unset; components use the light default | The Section block: `base.css`'s `.ucf-composition-dark` …; or the block theme's own `.is-style-dark` … |

**The Section owns sections** in every host. In WordPress it is the `ucf-content/section` block,
which saves `ucf-composition-{slug}` exactly as Puck and Next render it, and the plugins'
`base.css` carries those classes, so it works on any theme. WHY not the block theme's Section
(a core/group variation): this library manages the section so its markup and settings match
in every host; the theme's is expected to go.

**The light roles stay off `:root` in WordPress:** outside a Section the theme decides what the
page is. The block theme also still sets roles for its own `.is-style-*` sections, from this
file: the build writes `dist/theme/` (the role and composition maps as Sass, the composition
labels as JSON, the presets its `theme.json` must hold), and the theme's `npm run sync:tokens`
copies it into its `tokens/`, so both read the same values. Its `npm run check:tokens` fails
while its `theme.json` disagrees.

**`npm test` checks the roles,** in `scripts/tokens.test.mjs`: every text role clears 4.5:1
on its field and on a raised panel, every label on its fill, every control edge 3:1; and every
role a component's CSS reads is one `tokens.json` defines.

**WHY our own script, not Style Dictionary:** three treatments and five compositions don't
need it. The file is in the format Style Dictionary and Terrazzo read, so moving to one is a
change of build tool, not of data. Worth it once there are more outputs than CSS (a Figma
sync, a Sass map for the theme).

### The component layer: one class, every role

Components never read `--ucf-accent` and its fallbacks directly. The build writes the component
layer (part of `ucf.css`, and of WordPress's `base.css`), which sets `--ucf-c-{role}` for every
role on one class, each already resolved with its fallback. A component puts that class on its outer element, and every element inside
inherits the roles: the section's, unless the component is a panel.

| Class          | For                                                    | `--ucf-c-accent` is                                |
| -------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `.ucf-c`       | Sits on the section: a stat, a quote, a heading        | The section's accent, or light's default           |
| `.ucf-c-panel` | Paints its own ground: the Degree Finder, a boxed card | The panel accent, then the section's, then light's |

That split is why, on Bold Gold, a Stat draws a black rule (gold's own accent) while the
Degree Finder shows Light Alt inside (gold's panel composition).

The component layer reads roles and never sets them, so WordPress loads it too, in `base.css`,
without competing with the theme.

**Making a component role-aware:**

1. Decide whether it sits on the section or paints its own ground, and put `ucf-c` or
   `ucf-c-panel` on its outer element, next to its own `ucf-c-{name}` class.
2. Read colors only as `var(--ucf-c-{role})`: no fallbacks, no `--ucf-color-*` for anything
   that should follow the section. A new role in `tokens.json` reaches it with no edit.
3. Check it on every section with Storybook's Composition toolbar. `npm test` already checks
   that every `--ucf-c-*` it reads is a role, that it carries one of the two classes, and the
   contrast of every role pair.

`ucf-c` and `ucf-c-panel` are reserved: no component may be named `panel`.

- **Fonts are loaded by the host page,** never by the library. The token names the family;
  the theme (or the Next layout, or Storybook's `preview-head.html`) loads the files. Content
  components inherit their body font from the page so they fit wherever they're placed.

## Changing a content component's markup

What a content core returns is stored in every WordPress post that uses its block. Changing
it makes those blocks invalid. So:

1. Treat it as a major version.
2. Copy the old markup into a frozen component (`Stat.v1.tsx`) and add a `deprecated` entry
   in `adapters/wp/index.tsx` that renders it.
3. Only then update the snapshot (`npx vitest run -u`).

`npm test` fails on any markup change so this can't happen by accident. Interactive components have
no such rule: nothing is saved.

**Before the first release, the steps don't apply:** no site has saved the markup yet, so a
deprecation would have nothing to migrate. Update the snapshot directly until then.

## Tests

Vitest runs two kinds of project (`vitest.config.mts`): `npm test` runs `unit`, in Node, and
`npm run test:stories` runs `storybook:*`, every story in headless Chromium on every
composition at three widths. They are separate because the browser is slow to start. Run both
before committing a change to a story, markup or CSS.

The tests in `components/_config/` find every component on their own, so a new one is
covered with nothing to add. They are modeled on the UCF Brand Block Theme's suites.

- **Block round-trip** (`_config/blocks.test.tsx`): every block is created, serialized as a post
  stores it, parsed back and checked with `isValidBlockContent()`, the editor's own test, plus a
  snapshot of what a post stores. WHY not the parsed block's `isValid`: `parse()` quietly
  migrates mismatched markup through `deprecated` and reports it valid. WHY the snapshot: a
  renamed class passes the round-trip while invalidating every saved post.
- **WordPress and Puck parity** (`_config/parity.test.tsx`): every component has a block, a Puck
  config and stories; the block attributes, Puck fields and Puck defaults name the same props;
  and a content block saves the same markup Puck renders.
- **Markup contract** (`Stat.test.tsx`): WordPress's serializer and React DOM produce the
  same HTML, and it matches the snapshot. Every content component needs one.
- **Data client** (`client.test.ts`): what it requests and what it keeps, with a fake
  `fetch`. Every interactive component's client needs one.
- **Puck configs** (`_config/puck.test.tsx`): each config fits Puck's own `ComponentConfig`
  (checked by `npm run typecheck`), and its `render` gives the same markup with Puck's extra
  props (`id`, `puck`, `editMode`) as without. Add every new config to the file's list.
- **Every story is a test, on every composition and width** (`@storybook/addon-vitest`): five
  compositions (from `tokens.json`) at 1280, 780 and 360 pixels wide, as the block themes test.
  It must render without error and with no accessibility violation, because preview.ts sets the
  a11y add-on to `error`. WHY every composition: the same component reads different colors on
  each, so passing on Light proves nothing about Dark. `.storybook/vitest.setup.ts` fails a story
  that didn't render inside its project's composition, since a check on the wrong section
  passes. A story that needs the network is tagged `!test` (the Degree Finder's Live Data).
  Every component needs stories that cover its states.
- **Prove a new test can fail.** Break the code it covers, watch it go red, restore.

The accessibility check reads each story's rendered state, not what happens after a click or a
key. Behavior tests (keyboard, focus, announcements) are on the to-do list, as story `play`
functions so they run in the same real browser.

The block round-trip covers what the editor would flag on a saved post. A block's behavior in a
running WordPress (render.php, the plugin's PHP) is still checked by hand. Never verify a block
through the front end: an invalid block still renders there. Ask the editor's store
(`wp.data.select( 'core/block-editor' ).getBlocks()`).

## Gotchas that have already bitten

- **`@wordpress/scripts` 37 runs Vitest, not Jest.** `test-unit-js` needs `vitest`
  installed; `test-unit-jest` is the legacy path.
- **`@wordpress/block-editor` doesn't list its type files.** `tsconfig.json`'s `paths` points
  at them.
- **`@wordpress/blocks` types `example.attributes` as the attribute schema,** not values.
  The Stat block casts.
- **`PlainText`'s generated types have no props.** The Stat edit casts it.
- **The editor canvas is an iframe with its own `Element`.** `instanceof Element` is false
  for anything inside it; check for `closest()`.
- **The webpack config finds wp-scripts' copy plugins by constructor name.** wp-scripts
  requires its own copy of those classes, so `instanceof` against ours doesn't match.
- **JSON imported by a published module needs `with { type: 'json' }`.** Bundlers don't
  care; plain Node refuses without it.
- **The root `package.json` is not `"type": "module"`.** wp-scripts loads the webpack and
  ESLint configs as CommonJS. `dist/package.json` sets it for the package instead.

## Comments

The block theme's vocabulary. Comments say **why**, not what, and each is tagged:

| Tag         | Means                                                 |
| ----------- | ----------------------------------------------------- |
| `WHY:`      | A decision that has a defensible alternative          |
| `FIX:`      | A bug this line prevents, which has actually occurred |
| `A11Y:`     | An accessibility requirement, with the measurement    |
| `UPSTREAM:` | Behavior imposed by WordPress, a library or a service |
| `SYNC:`     | This value must match another place, named            |
| `SPEC:`     | A value that comes from a design, not from reasoning  |
| `PERF:`     | A measured cost, not a guess                          |
| `CONTEXT:`  | A file- or section-level orientation banner           |
