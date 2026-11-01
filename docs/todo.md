# To do

The current goal is a correct development process, not a pipeline.

## To do

- **A release job.** CI checks every push (`.github/workflows/ci.yml`) and every pull request
  (`ci-full.yml`), but nothing publishes the npm package or the plugin builds yet;
  `npm run release:temp` stands in.
- **Fonts: reconcile with the block theme.** The library never loads fonts; the host does.
  Today Storybook loads them from Google Fonts and the theme loads its own. Decide who owns
  the list of families and files, and how the theme, Next and Storybook share it.

## Testing: what's left to match the brand block theme

Good enough to build components on today: CI on every push and pull request, block round-trips
with `isValidBlockContent()` and stored-markup snapshots, WordPress and Puck parity, and axe on
every story on every composition at three widths, with guards against checking the wrong thing
(docs/architecture.md, "Tests"). What the UCF Brand Block Theme has, or both lack, that this
doesn't yet, roughly in the order worth doing:

1. **A version check.** The theme's CI fails when `style.css` and `package.json` disagree. Here,
   each plugin's `Version:` header and `package.json` are kept in step by hand. Small; catches
   a release that reports the wrong version.
2. **Behavior tests for interactive components.** Keyboard use and screen reader announcements
   for the Degree Finder (its interest combobox, step focus, the progress bar), as `play`
   functions on its stories, so they run in the same real browser. Neither theme has these;
   today only each story's rendered state is checked.
3. **Story accessibility checks miss the Degree Finder's colors.** Its entrance animations
   start text transparent, and the check skips text it can't see. With white text forced on
   every section, only the first story failed. Tried and not working: waiting on each
   animation's `finished` (some never settle), polling `playState`, `finish()` in `play`, and
   reduced motion on the test browser (which stopped the check entirely). Structural checks
   (alt text, labels) do work. Its color pairs are covered by scripts/tokens.test.mjs.
4. **Puck at runtime.** Render each config through Puck's own `<Render>`, and a Playwright smoke
   test of the editor (insert each component, change each field, switch a section's
   composition, no console errors). Needs the playground (below).
5. **A real-WordPress tier,** as the block themes have: wp-env with the built plugins and the
   block theme, a seeded page per block per composition, axe at three widths, the theme's
   guards (HTTP status, the composition class present, zero tests is a failure), and the editor
   checked for invalid blocks (the `getBlocks()` check, automated). Catches theme CSS
   interacting with a block, which stories can't. Worth it once more blocks render on the
   server.
6. **PHP tests.** `render.php` and the plugins' PHP are only linted. The theme has a fast unit
   tier (PHPUnit with stubs, no WordPress) and an integration tier under wp-env; start with the
   unit tier for `render.php`'s output and the settings functions.
7. **An accessibility report on pull requests.** The theme posts axe's results as a PR comment,
   and records axe's `incomplete` results ("a human has to look at this") as notes instead of
   dropping them. Here a failure shows only in the job log.
8. **Visual regression.** Neither theme has it. Screenshot comparisons per story and
   composition would catch a layout or spacing change that passes every other check, at the
   cost of approving new screenshots on every intended design change. Worth it once there are
   more components.

## Planned next

The playground first, then the schema, which is easiest to verify once the playground exists.

### 1. A Puck playground

The Puck configs (`adapters/puck/config.tsx`) are checked against Puck's own types, and their
`render` against Puck's extra props (`components/_config/puck.test.tsx`). Nothing renders them
in the real Puck editor yet.

- **A small app in `playground/`,** with Vite and `@puckeditor/core` as dev dependencies only, so
  the library itself stays free of Puck. It loads every `adapters/puck/config.tsx`, opens the real
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
- **Puck `fields` and `defaultProps`,** built from it in `adapters/puck/config.tsx` at runtime.
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

## Primitives to build

Per docs/architecture.md, "Core blocks and our primitives": we own every block that needs
structure; core is used for plain text only. Roughly in order of need:

1. **Button**, with a Buttons group: variants from the hero screenshots (gold fill, outline on
   dark, a trailing arrow). `RichText` for the label and `LinkControl` for the link in the
   editor; one markup in every host. Unblocks the hero, cards and the theme patterns with
   buttons.
2. **Image** (and Figure, with a caption): `MediaUpload` and the media library in WordPress,
   saving the attachment ID with `wp-image-{id}` on the `<img>`; the host's image component
   (`next/image`) through a slot in React. Unblocks the photo patterns.
3. **Columns and Column:** a column count, ratio, gap and the width at which they stack; a
   Puck slot per column. Match P1's Columns setting names (2–4 columns, ratio, gap, vertical
   alignment) for parity.
4. **Cover / Hero frame:** see the hero write-up (media, scrim, height, split, patterns inside).
5. **Lock core down** in the plugin: the allowed block list and core's design controls off.
   Do it alongside the first primitive so editors meet ours, not core's.

The Section already exists (frozen until compared with P1's Container, below).

## Element styles

`styles/elements.css` (`@ucf/components/elements.css`, opt-in) gives React hosts the block
theme's headings, body copy, links and captions, inside a Section or `.ucf-elements`. Storybook
and the Puck demo load it. It matches dev-ucf-main.pantheonsite.io (an h2: Oswald 600,
uppercase, 48px at 1440px wide, 32px at 390px), but its rules are copied by hand from the
theme's theme.json `styles.elements` and src/scss/_typography.scss, so they can drift.

- **One source for both.** Move the element styles into `tokens.json` as data, and generate
  this stylesheet and the theme's theme.json `styles.elements` from it, as the compositions
  already are. Needs the theme's sync updated, and Jim's agreement.
- **Or a different approach: Tailwind.** Generate a Tailwind preset from `tokens.json` (colors,
  roles, fonts, sizes, spacing, layout widths), so React sites style pages and their own
  markup with the same values, and headings come from a typography preset rather than global
  element rules. Worth weighing before the element styles grow:
    - For: one vocabulary for site builders in Next; utilities compose without new CSS files;
      Tailwind's typography plugin (`prose`) is a known way to style copy a site doesn't
      control (a CMS's body text).
    - Against: WordPress doesn't use Tailwind, so the theme and plugins would still need the
      plain CSS; components would carry two styling systems or stay on plain CSS; the role
      model (a composition re-pointing `--ucf-*` for everything inside) has to survive the
      translation, as CSS variables in the preset rather than fixed colors.
    - A middle way: keep components and the element styles in plain CSS, and ship a Tailwind
      preset only as a convenience for sites, reading the same `--ucf-*` variables.

## Section

Built: `components/section`, with a WordPress block (`ucf-content/section`, inner blocks), a
Puck config (a slot) and its composition classes in the plugins' `base.css`.

**On hold (2026-10-30): don't extend the Section further yet.** UCF will likely build on
Pantheon's P1 starter kit (`pnpm create @pantheon-systems/p1-starter-kit`: Next.js 16, Puck
^0.21, Tailwind v4, a shadcn-style block library at components.p1.pantheon.io), and keep this
Section at parity with its base layout blocks. Compare the two before adding settings. Also
check there: our configs against Puck 0.21 (the type test pins 0.24), and that Tailwind's
layered reset doesn't override `ucf.css` and `elements.css`.

Still to do:

- **Remove the block theme's Section** (its core/group variation and `src/scss/_section.scss`)
  once sites use this one, and let the theme take its section layout from here. Until then its
  `.ucf-section` rules also match this block; they read the same tokens.
- **The gap between blocks is copied, not a token:** the theme's `blockGap` (spacing 40). The
  two widths are tokens now (`tokens.json` `layout`, following the theme's `settings.layout` in
  WordPress); make the gap one too.
- **The theme's `check:tokens` doesn't compare `layout` yet.** The kit's `theme-json.json` now
  has `layout` (contentSize, wideSize), but the theme's tools/sync-tokens.js only checks the
  keys it knows. Add it there, so the theme fails while its `theme.json` widths disagree.
- **What may go inside.** Any block can today. Decide whether a Section may hold another
  Section, and whether to limit it to UCF blocks (`allowedBlocks`, and Puck's `allow`).

## Considered, not decided

From reviewing whether this works equally well for WordPress and Puck:

- **A Card component.** An image, nested content and a link: the cases Stat avoids, and
  where WordPress and Puck differ most.

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
