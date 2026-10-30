# To do

The current goal is a correct development process, not a pipeline. Nothing here is started.

## To do

- **CI.** Tests, lint (JS, CSS, PHP, format), typecheck, a check that built output isn't
  stale, and a release job that publishes the npm package and the plugin builds. Mirror the
  block themes: `npm run check` on every push, `test:stories` and the tiers below on pull
  requests, with the accessibility report as a PR comment.
- **Puck at runtime.** Render each config through Puck's own `<Render>`, and a Playwright smoke
  test of the editor (insert each component, change each field, switch a section's composition,
  no console errors). Needs the playground (below).
- **A real-WordPress tier,** as the block themes have: wp-env with the built plugins and the
  block theme, a seeded page per block per composition, axe at three widths, and the editor
  checked for invalid blocks (the `getBlocks()` check, automated). Covers render.php and the
  plugins' PHP, which nothing tests today.
- **Behavior tests for interactive components.** Keyboard use and screen reader announcements for
  the Degree Finder (its interest combobox, step focus, the progress bar), as `play` functions
  on its stories. The storybook test project already runs every story in headless Chromium, so
  these run in a real browser with no jsdom. Today only each story's rendered state is checked.
- **Story accessibility checks miss the Degree Finder's colors.** Its entrance animations
  start text transparent, and the check skips text it can't see. With white text forced on
  every section, only the first story failed. Tried and not working: waiting on each
  animation's `finished` (some never settle), polling `playState`, `finish()` in `play`, and
  reduced motion on the test browser (which stopped the check entirely). Structural checks
  (alt text, labels) do work. Its color pairs are covered by scripts/tokens.test.mjs.
- **Fonts: reconcile with the block theme.** The library never loads fonts; the host does.
  Today Storybook loads them from Google Fonts and the theme loads its own. Decide who owns
  the list of families and files, and how the theme, Next and Storybook share it.

## Planned next

The playground first, then the schema, which is easiest to verify once the playground exists.

### 1. A Puck playground

The Puck configs (`hosts/puck/config.tsx`) are checked against Puck's own types, and their
`render` against Puck's extra props (`components/shared/puck.test.tsx`). Nothing renders them
in the real Puck editor yet.

- **A small app in `playground/`,** with Vite and `@puckeditor/core` as dev dependencies only, so
  the library itself stays free of Puck. It loads every `hosts/puck/config.tsx`, opens the real
  Puck editor on a saved sample page, and loads `dist/ucf.css` and the compositions so
  sections can be tried.
- **A check:** a test renders each config through Puck's `<Render>` with sample data, so a
  config that no longer fits Puck's current shape fails, not just one that fails TypeScript.

### Done: the block theme builds from `tokens.json`

The theme no longer keeps its own copy of the roles and compositions. This repo's
`npm run build:tokens` writes `dist/theme/` (`_tokens.scss`, `compositions.json`,
`theme-json.json`); the theme's `npm run sync:tokens` copies it into its `tokens/`, its
`_compositions.scss` loops over those maps (now with `field`, panel and bar roles, and Dark Alt),
`ucf_theme_register_composition_styles()` reads `compositions.json`, and `npm run check:tokens`
fails while its `theme.json` presets differ from the kit. Its compiled CSS was diffed before and
after: no existing role changed value except Bold Gold's `raised` (gold to white, intended).

Done on the theme branch `tokens-from-ucf-components` (from `rc-v1.0.0-alpha.3`), not
committed. Still to do:

- **Commit and merge the theme branch,** after its Playwright accessibility suite
  (`npm run test:a11y`, needs `wp-env`) has run on every section. Not run yet.
- **Brighter mode and Dark Alt.** The theme's Brighter variation lightens `.is-style-dark` only;
  decide whether `.is-style-dark-alt` should brighten too.
- **The Styles panel labels are no longer translated** (`__()` needs literals). Fine for an
  English-only site; revisit if the theme is ever translated.
- **When the package is published,** the theme reads `@ucf/components/theme/*` from
  `node_modules` and drops its committed `tokens/` copy.
- **Ownership** is still an open question for Jim (below): this works with this repo as the
  source, and he should agree to that before the branch merges.

### 2. One schema per component

A component's props are written twice: as `block.json` attributes and as Puck fields. A
`schema.ts` per component would hold them once:

```ts
export const schema = {
	programType: {
		type: 'select',
		label: 'Degree type',
		default: '',
		options: [ { value: '', label: 'Ask the visitor' }, … ],
	},
};
```

- **`block.json` attributes,** filled in at build time by the webpack copy step (`block.json`
  itself must stay plain JSON).
- **Puck `fields` and `defaultProps`,** built from it in `hosts/puck/config.tsx` at runtime.
- **The editor's settings panel** in `edit.tsx`, as select and text controls.
- **The TypeScript prop type,** inferred from it.

For content blocks, attribute names are saved in posts, so the schema carries the same
"permanent once used" rule (docs/architecture.md, "Naming"). Stat edits its text inline, so it
would use the schema for attributes only. Verify the generated Puck fields in the playground.

## Noted, not started

- **Live content: content whose data is fetched, rendered on the server.** Once WordPress is split into
  content-type plugins, `ucf-degrees` will need blocks like the theme's degree facts, where
  live data has to be in the HTML. PHP renders it, and a test checks the PHP output against
  the React component's snapshot. It's the hardest of the three kinds. Add a small example
  to `ucf-degrees` to work out the pattern.
- **Plugin distribution through Composer.** UCF sites install plugins with Composer from
  GitHub releases, one plugin per repo. The likely answer: CI pushes each built plugin to its
  own release repo (`ucf-degrees`, `ucf-content`), and sites install from those as they do
  today. Not needed until there's a pipeline.
- **The component layer, made more robust.** (`.ucf-c`, `.ucf-c-panel`) works for now; known gaps:
    - A `ucf-c` component nested inside a `ucf-c-panel` one reads the section's roles, not the
      panel's. On Bold Gold, a Stat inside a white panel would get gold's black rule.
    - No per-component override yet. The plan: an Appearance setting (Follow section, Light,
      Light Alt, Dark, Dark Alt, Bold Gold) that sets `data-ucf-composition` on the component,
      with the component layer honoring it, so the section applies unless the component overrides it.
    - Per-section defaults for a component ("on gold, show as Light Alt") without an editor
      setting, through CSS style queries once browsers support them.

## Considered, not decided

From reviewing whether this works equally well for WordPress and Puck:

- **A Card component.** An image, nested content and a link: the cases Stat avoids, and
  where WordPress and Puck differ most.
- **A Section component** that applies a composition (`.ucf-composition-dark`), so Puck and
  Next editors can choose dark sections the way theme editors do. The classes exist; nothing
  offers them in an editor yet.

## Open questions for Jim

- Where degree data comes from: the WordPress REST API on ucf.edu (his Degree Picker, now
  the Degree Finder here) or the Search Service (the theme). This repo had a Search Service
  client in the Program picker, removed on 2026-10-29 without being committed; switching
  means writing one again.
- **His Degree Picker block, now that this copy is the source.** `components/degree-finder` was
  ported from his `wp-block` branch (commit 43b23e3) and renamed, so it is the copy that keeps
  going here. His plugin still has its own copy and block (`ucf-degree-search/degree-picker`);
  with both plugins active, the inserter shows a Degree Picker and a Degree Finder. Decide
  whether his plugin drops its block in favor of `ucf-degrees`, and tell him his later changes
  now need merging by hand.
- **License.** His package is marked `GPL-3.0-or-later`; this repo is `GPL-2.0-or-later`. A
  GPL-3 file inside makes the combined work GPL-3. Confirm with him which license the
  picker code is under here.
- One npm scope and registry: `@ucf` here, `@ucfweb` in his plan.
- One Storybook for both.
- Who owns the token values. The theme now builds from this repo's `tokens.json` (on its
  `tokens-from-ucf-components` branch); confirm he agrees before that branch merges.
