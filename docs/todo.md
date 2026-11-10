# To do

Open work only. When something is done, delete it here; the commit and pull request say what
changed. How things work today is in [architecture.md](architecture.md).

The current goal is a correct development process, not a pipeline.

## Next

1. **A Puck playground.** The Puck configs are checked against Puck's types
   (`integrations/tests/puck.test.tsx`), but nothing renders them in the real Puck editor.

    - A small app in `playground/`, with Vite and `@puckeditor/core` as dev dependencies only,
      so the library itself stays free of Puck. It loads every `integrations/puck/config.tsx`,
      opens the Puck editor on a saved sample page, and loads `dist/ucf.css` and the
      compositions.
    - A test that renders each config through Puck's `<Render>` with sample data, so a config
      that no longer fits Puck's current shape fails.

1. **Finish moving every component onto prop definitions and `frame()`.**

    - Remove the `example.json` handling for content components from `blocks.test.tsx`,
      `parity.test.tsx` and `scripts/build-package.mjs` (no component has one now), and
      `imageId` from `WORDPRESS_ONLY` in `parity.test.tsx` (the Hero's and Card's are in their
      props).
    - A `README.md` for the Hero and the Section, as the Card has.
    - The Hero's designs as presets; it has only `DEFAULT_PRESET`. P1's layouts (split, full
      image, text only) may be worth naming.
    - The examples (`examples/fixed-card`, `examples/flexible-card`) use `innerAs`; move them to
      areas.
    - The Degree Finder onto the translators (architecture.md, "One definition, one
      translator per environment"): the WordPress translator's interactive path (`render.php`
      and `view.tsx`). Primitives with no content of their own stay plain components
      (architecture.md, "Primitives").
    - Drop the deprecated `withVariation` from the Card's and Highlight's Puck configs once
      ucf-puck-demo uses `withPreset`.

1. **ucf-puck-demo:** its saved page keeps the Card's, Highlight's, Hero's and Section's slots
   under `content`; they are `blocks` now. The Highlight's designs are data (a Design picker),
   and `HERO_PARTS` is each part's kind and class. Reset the page after deploying.
1. **Try WordPress pattern overrides** (6.6+) for the Card's presets: they store per-instance
   content for named blocks inside a synced pattern, much as `content` does by part name
   (architecture.md, "How content reaches a frame").

## The Event List

`components/live/event-list` (block `ucf-events/event-list`, plugin `ucf-events`) replaces the
UCF Events Plugin's `[ucf-events]` shortcode. To finish:

- **Check it in a real WordPress.** Install `ucf-events`, add the block, and check
  `getBlocks()` in the editor and the page's HTML. Its PHP test runs against stubs. Also check
  the editor preview loads the feed from the editor's origin (the feed allows any origin).
- **Settle its names before any site uses it:** the block `ucf-events/event-list` and its
  attributes (`feedUrl`, `limit`, `offset`, `title`, `columns`, `dates`,
  `descriptions`, `emptyMessage`) are permanent once saved in a post.
- **Its look against the theme's Events block,** in Storybook and on a page: the date block,
  spacing, and the AP date and time.
- **Event structured data.** The theme writes schema.org `Event` nodes for its mock events
  (`ucf_theme_structured_data()`). Decide who writes them for this block: `render.php` when the
  theme's function exists, or the theme from a filter.
- **Puck on the server.** The Puck config fetches in the browser, which is right in the editor;
  a Puck site rendering a saved page should fetch on the server (Puck's async `resolveData`, or
  the site's Server Component). Work it out in the playground.
- **Migrating shortcodes.** Pages that use `[ucf-events]` keep working while both plugins are
  active. A transform from the shortcode block to this one would move them over.
- **The degree facts** are the next live component, in `ucf-degrees`.

## Release

- **A release job.** CI checks every push (`ci.yml`) and pull request (`ci-full.yml`), but
  nothing publishes the npm package or the plugins; `npm run release:temp` stands in.
- **Plugin distribution through Composer.** UCF sites install plugins with Composer from GitHub
  releases, one plugin per repo. Likely: CI pushes each built plugin to its own release repo,
  and sites install from those. Not needed until there's a pipeline.
- **A version check.** Each plugin's `Version:` header and `package.json` are kept in step by
  hand; CI should fail when they disagree, as the block theme's does.

## The block theme and tokens

The theme builds its roles and compositions from this repo's `tokens.json`, on its branch
`tokens-from-ucf-components`. To finish:

- **Merge the theme branch** after its Playwright accessibility suite (`npm run test:a11y`,
  needs `wp-env`) has run on every section.
- **Brighter mode and Dark Alt.** The theme's Brighter variation lightens `.is-style-dark` only;
  decide whether `.is-style-dark-alt` should brighten too.
- **The Styles panel labels aren't translated** (`__()` needs literals). Fine for an
  English-only site.
- **Once the package is published,** the theme reads `@ucf/components/theme/*` from
  `node_modules` and drops its `tokens/` copy.
- **Fonts.** The library never loads fonts; the host does. Storybook loads them from Google
  Fonts and the theme loads its own. Decide who owns the list of families and files, and how
  the theme, Next and Storybook share it.

## Testing

Good enough to build on today (architecture.md, "Tests"). Missing, in the order worth doing:

1. **Behavior tests for interactive components.** Keyboard use and screen reader announcements
   for the Degree Finder (its interest combobox, step focus, the progress bar), as `play`
   functions on its stories.
1. **The Degree Finder's colors aren't checked in its stories.** Its entrance animations start
   text transparent, and the accessibility check skips text it can't see. These don't work:
   waiting on each animation's `finished` (some never settle), polling `playState`, `finish()`
   in `play`, and reduced motion in the test browser (which stops the check entirely).
   Structural checks (alt text, labels) do work, and `scripts/tokens.test.mjs` covers its color
   pairs.
1. **Puck at runtime.** Render each config through Puck's `<Render>`, and a Playwright smoke test
   of the editor. Needs the playground.
1. **A real-WordPress tier,** as the block themes have: wp-env with the built plugins and the
   theme, a seeded page per block per composition, axe at three widths, and the editor checked
   for invalid blocks (the `getBlocks()` check, automated).
1. **PHP tests.** A live component's PHP markup is compared with its React markup
   (`tests/{Name}.php.test.tsx`); the rest of `render.php` and the plugins' PHP is only linted.
   Start with a unit tier (PHPUnit with stubs, no WordPress) for `render.php`'s output and the
   settings functions.
1. **An accessibility report on pull requests,** posting axe's results as a comment and keeping
   its `incomplete` results as notes.
1. **Visual regression:** screenshot comparisons per story and composition. Worth it once there
   are more components.

## Primitives to build

**Core's text blocks as primitives, for Puck** (WordPress keeps the core blocks). Each one's CSS
reproduces what the theme renders for the core block, measured on a page of every style, then
becomes the theme's through `scripts/core-css.mjs`. Built: Separator, Code, Quote, Pullquote, List
and Table. Next: extend `core-css.mjs` to inner elements and pseudo-elements (`> li::before`,
`> code`, `thead th`) and sync them. Where ours differs from the theme, syncing changes the theme:

- **Stripes on a dark section:** core bands rows in a fixed light gray, so white text on them
  can't be read. Ours bands in the `raised` role.
- **Compare on a phone:** the theme holds the first column but not its header cell, which scrolls
  away. Ours holds both.
- **A captioned table's role (the theme's `includes/tables.php`, not synced):** it gives every
  table's figure `role="region"`, which axe rejects on a figure with a caption
  (`aria-allowed-role`). Ours adds the role only when there is no caption.

Still to do for the Table. Its job for now is to carry the theme's table styles to both hosts;
WordPress editors use core Table, whose editing already covers these. Puck's table editing waits
until it is needed:

- **Compare reads as a restyle:** it is the theme's comparison table (two to four options side by
  side, the questions in the first column, at full width; the theme's `patterns/comparison.php`),
  but its story and Puck show the deadlines sample, which isn't a comparison. Give it the
  pattern's content, and say what each style is for in the Style field's help.
- **Fixed-width columns:** core's default (`hasFixedLayout`) gives equal columns that wrap long
  words; ours sizes columns to their content, as core does with the setting off.
- **Header cells in the body and a footer row:** the theme styles both; the rows format can't
  write them.
- **Numbers in a column:** the theme sets a right-aligned column (core's column alignment) in the
  mono face. Ours has no alignment setting yet.
- **The Compare caption** scrolls sideways with the table on a phone, in the theme and ours. It
  could sit outside the scrolling area, which needs a wrapper core doesn't write.

Components are built from primitives in `components/primitives/` (architecture.md,
"Primitives"). Roughly in order of need:

1. **Button** (built, used by the Hero). Still to do:

    - A Buttons group, the trailing-arrow variant from the hero designs, and `RichText` for the
      label if editors need bold or italics.
    - The theme to use its generated CSS (`dist/theme/_core-blocks.scss`, from this
      primitive's `style.css`) in place of its own `src/scss/_buttons.scss`: `tools/sync-tokens.js`
      copies the file, `main.scss` loads it. Show Jim first: it moves the core Button's look from
      the theme to the library. On the theme's pages it matches every core Button at rest and on
      hover but one way: Outline buttons get the Fill's padding, as the theme intends; core's own
      Outline style shrinks it today.
    - PERF: its CSS ships with each block that uses it. Once several blocks use primitives, put
      every primitive's `style.css` in the plugins' shared `base.css`, which loads once.
    - Behavior for interactive pieces: pick an unstyled library (React Aria first, Base UI as
      the fallback) by trying it on the Degree Finder's interest combobox.

1. **Image** (built, used by the Card). Still to do: a Figure with a caption; the host's image
   component (`next/image`) through a slot; and moving the Hero onto it.
1. **Columns in WordPress** (the primitive is built, for Puck and React sites). WordPress
   editors place core Columns in a Section. Still to do:

    - The theme's core Columns styles to match the primitive's: its gaps (spacing 40, 60, 80)
      and its stacking (one column below 36rem of Columns), so a layout looks the same in both.
    - A `columns` part kind for frames' templates, written to core Columns in WordPress:
      `distribution` as each Column's width (`2:1` is 66.66% and 33.33%), `gap` as
      `style.spacing.blockGap`, `valign` as `verticalAlignment`.

1. **Cover / Hero frame:** media, scrim, height, split, patterns inside.
1. **Lock core down** in the plugin: the allowed block list, and core's design controls off.
   Do it alongside the next primitive.
1. **Heading and Paragraph** (built, for the frames' Puck templates). Their rules copy
   the values in `tokens/elements.json` (`SYNC:`); generate their CSS from it, as elements.css
   is. Decide whether Paragraph needs a Lead size.

## Section

**On hold: don't add settings to the Section yet.** UCF will likely build on Pantheon's P1
starter kit (Next.js 16, Puck 0.21, Tailwind v4), and the Section should match its base layout
blocks. Compare the two first. Also check our configs against Puck 0.21 (the type test pins
0.24), and that Tailwind's reset doesn't override `ucf.css` and `elements.css`.

- **Remove the block theme's Section** (its core/group variation and `_section.scss`) once
  sites use this one. Until then its `.ucf-section` rules also match this block.
- **The gap between blocks is copied, not a token:** the theme's `blockGap` (spacing 40).
- **The theme's `check:tokens` doesn't compare `layout`.** Add it to the theme's
  `tools/sync-tokens.js`, so the theme fails while its `theme.json` widths disagree.
- **What may go inside.** Decide whether a Section may hold another Section, and whether to
  limit it to UCF blocks (`allowedBlocks`, and Puck's `allow`).

## Element styles

`tokens/elements.json` is the one source for the element styles (architecture.md, "Tokens,
roles and fonts"). The theme's side is still to do, on its `tokens-from-ucf-components` branch,
with Jim's agreement:

- **Check `styles` in `tools/sync-tokens.js`:** compare theme.json `styles.typography` and
  `styles.elements` with the kit's `styles`, as it compares presets, so the theme fails while
  they differ.
- **Read the link tokens in `src/scss/_typography.scss`:** `var(--wp--custom--link-underline)`,
  `link-underline-hover` and `link-underline-offset` in place of `1px`, `2px` and `0.2em`, after
  `sync:tokens` adds them to theme.json `settings.custom`.
- **The button element** (theme.json `styles.elements.button`) joins elements.json with the
  Button primitive's move to the library.
- **A Tailwind preset** from `tokens.json`, so React sites style pages with the same values.
  WordPress doesn't use Tailwind, so the theme and plugins would still need the plain CSS. A
  middle way: keep components on plain CSS, and ship a preset only as a convenience for sites,
  reading the same `--ucf-*` variables.

## Noted, not started

- **The component layer, made more robust:**
    - A `ucf-c` component inside a `ucf-c-panel` one reads the section's roles, not the panel's.
    - A per-component Appearance setting (Follow section, Light, … Bold Gold) that sets
      `data-ucf-composition`, honored by the component layer.
    - Per-section defaults for a component, through CSS style queries once browsers support
      them.
