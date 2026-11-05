# Architecture

The single source for this repo's conventions and the reasoning behind them. `README.md` and
`CLAUDE.md` point here rather than restating it.

---

## One source, two outputs

Every component is written once, as React, in `components/{bucket}/{name}/`. From that:

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
| Example         | `highlight`                                         | `degree-finder`                                                           |
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
(state, effects, data) would produce HTML that no longer matches what was saved. "Nothing"
means no host or library code (`react`, `@wordpress/*`, `next/*`); its own files and the plain
data in `integrations/schema/` (its prop definitions' shape, the compositions) are fine, since
they render the same every time. A component never imports another component: what two share
goes in `integrations/`.

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
| **Content**     | `highlight`, a quote, a card      | **Live content**, not built yet: the degree facts |
| **Interactive** | A calculator that fetches nothing | `degree-finder`                                   |

**Live content is the hard corner.** Its live data must be in the HTML (it is content), so in
WordPress PHP renders it on each request, and PHP can't run React. Its markup exists twice, in
React and in PHP, and a test must compare the two. See `docs/todo.md`.

## Naming

One name per component, spelled the same way in every layer:

| Layer   | Form                         | Example                                 |
| ------- | ---------------------------- | --------------------------------------- |
| Folder  | kebab-case, in its bucket    | `components/content/highlight`          |
| React   | PascalCase                   | `Highlight`                             |
| CSS     | `ucf-c-{name}`, BEM below it | `ucf-c-highlight__detail`               |
| Block   | `{plugin}/{name}`            | `ucf-content/highlight`                 |
| Display | Title case, short            | "Highlight" (Storybook, inserter, Puck) |

- **Content is named for what a reader sees,** a plain noun: Highlight, Quote, Card, Section. No
  suffix; how it reads goes in the description ("a fact written as a complete statement").
- **Interactive is named for the subject and the task:** Degree Finder, Tuition Calculator,
  Event Search. WHY not "picker": it reads as one form control, like a date picker, not a
  whole tool.
- **In Storybook, a component sits under its kind** and carries the matching tag:
  `Content (Server)/Highlight` with `tags: [ 'server' ]`, `Interactive (Client)/Degree Finder`
  with `tags: [ 'client' ]`. Its first story is `Default`. A component whose stories are split
  into several files is a group: `Content (Server)/Card/Props`, `…/Card/Presets`,
  `…/Card/Checks`. Section colors are not separate
  stories; the Composition toolbar sets them.
- **Display names can change any time;** nothing stores them. **Block names and a content
  block's attribute names are stored in every post** that uses the block, so once a site uses
  them they are permanent. Settle them before the first deploy.

## A component's folder

```
components/{bucket}/{name}/
  {Name}.tsx             the component: props in, markup out (the markup)
  {Name}.props.ts        its props: each one's type, values, default and field (below)
  {Name}.parts.ts        frames: the content placed inside, each part's kind and class
  {Name}.presets.ts      frames with designs: named combinations of props and parts
  index.ts               what the npm package exports for it
  style.css              reads --ucf-* only
  README.md              its object model, filled in
  defaults.ts            interactive components: default props, read by every host
  client.ts              interactive components: the only file that knows its API's response shape
  sample-client.ts       interactive components: the same interface with no network
  types.ts
  integrations/          where the component runs, one folder per environment:
    wp/                  the WordPress adapter: block.json, index.tsx, edit.tsx, and save.tsx
                         or render.php + view.tsx
    puck/                the Puck adapter: config.tsx, a plain object in Puck's
                         ComponentConfig shape
    storybook/           {Name}.stories.tsx. Split into {Name}.presets.stories.tsx and
                         {Name}.checks.stories.tsx, with shared.tsx, when it has presets or
                         measured checks
  tests/                 every test, mirroring the folder it tests (tests/utils/…), and
                         __snapshots__/; {Name}.test.tsx, {Name}.presets.test.tsx
```

**Components sit in a bucket by role:** `components/primitives/` (the pieces: no block of their
own), `components/content/` (placed by editors, saved as HTML) and `components/interactive/`
(placed by editors, built in the browser). The bucket is the kind, so the folder says which
rules apply (save.tsx or render.php, presets or a client); integrations/tests/parity.test.tsx
fails when a component sits in the wrong one. WHY buckets now, with one interactive component:
more are coming, and moving five is cheaper than moving fifty. WHY the bucket is left out of
every name (block names, `@ucf/components/{name}`, plugin.json): a component that changes kind
moves folder without breaking a site. Names are unique across buckets; scripts/plugins.cjs
(`componentDirs()`) finds a component by name and fails on a duplicate.

WHY one `integrations/` folder: the top level then holds what the component _is_ (markup,
props, parts, presets, styles), and everything about _where it runs_ is bundled in one place.
`wp/` and `puck/` are the component's **adapters** (the word list below). WHY `style.css`, not
`{Name}.css`: WordPress's build (wp-scripts) makes only a
file named `style.css` the block's front-end stylesheet; any other name becomes editor-only.

**A component's `integrations/` mirrors the top-level `integrations/`.** Each of its folders
holds the component's own half (its block, its Puck config, its stories); the folder of the
same name at the top holds the half every component shares. Something about WordPress is in
one of the two `integrations/wp/` folders: `components/content/card/integrations/wp/` for the Card,
`integrations/wp/` for every component.

The Card and the Highlight follow this. The Hero and Section still use the files it replaced
(`options.ts`, `example.json`) and move next (docs/todo.md).

**What every component shares is in `integrations/`,** laid out in the same layers
([integrations/README.md](../integrations/README.md)): what a schema may declare (`schema/`), and how
WordPress, Puck and Storybook read it (`wp/`, `puck/`, `storybook/`). A component's folder
holds only its own decisions.

**One file per kind of definition.** The props are what an editor sets on the component, the
parts are what goes inside it, and the presets are named combinations of the two. Each changes
for its own reason (a new setting, a new look, a new design), so each has its own file. WHY no
separate sample-props file: what a new one starts with is the defaults (in the props), and what
an example looks like is a preset. The Card had one (`example.json`) that was its defaults with one change; it was the boxed card
Puck started with while WordPress started plain.

**Files are named `{Name}.{role}.{ext}`,** as `Card.test.tsx` and `Card.stories.tsx` already
were: the first word is the component, the suffix is what the file defines. Typing `Card.` in
a file finder lists everything that defines the Card. In `integrations/`, each environment's folder has a
main file named for what it produces (`wp/block.tsx`, `puck/config.tsx`, `react/frame.tsx`)
and a `parts` file for how parts render there, mirroring `schema/`.

### The object model

A frame (see "Frames") is its props, its parts, and presets built from both:

```
Component
├─ {Name}.props.ts      PROPS: each prop's key · type · options · default · field
│                       field: label · help · control · panel · hosts
├─ {Name}.parts.ts      PARTS: each part (title, eyebrow, image…): its kind and its class
│                       kinds (image, heading, text, link, button): integrations/schema/parts.ts
└─ {Name}.presets.ts    named combinations of the two
    └─ presets          Preset: name · title · description · wpIcon · props · parts
                        a part in a preset: { part: 'title', text, level }
                        DEFAULT_PRESET: what a new one starts with, and the inserter's preview
```

Each host reads the same objects:

|           | Prop definitions                                                        | Parts                                          | Presets                                                                   |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Component | its prop types (`PropsOf`) and defaults (`PROPS.{key}.default`)         | (its `style.css` styles PARTS)                 |                                                                           |
| WordPress | block.json attributes (written by hand, checked); the sidebar, by panel | `integrations/wp/parts.ts`: kind → core block  | block variations; DEFAULT_PRESET is the block's template and its preview  |
| Puck      | `puckFields()` and `defaultsIn()`                                       | `integrations/puck/parts.ts`: kind → primitive | `withPreset( name )`; `withTemplate()` starts with DEFAULT_PRESET's parts |
| Storybook | `argTypesOf()`, and the defaults as the starting args                   | `integrations/storybook/parts.tsx`             | `{Name}.presets.stories.tsx`                                              |

`integrations/schema/` defines the shape of each: `props.ts` what prop definitions look like
and the functions above; `parts.ts` the part kinds, and `resolveParts()`, which gives the
mappers each part's kind and class from the component's PARTS; `presets.ts` the `Preset` type
and `findPreset()`. A component's three files hold only its own data.
block.json is still written by hand because PHP reads it before any script runs;
parity.test.tsx fails while its attributes differ from the prop definitions.

### Words

One word per idea, in file names, code and comments. They lean on terms developers already
know:

| Word         | Means                                                                           | Where                                    |
| ------------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| **prop**     | a value the component takes; its prop definitions describe the ones editors set | `{Name}.props.ts`                        |
| **field**    | how a prop appears in an editor: label, help, control, panel                    | `{Name}.props.ts`                        |
| **part**     | one piece of content inside a frame: its kind, and the class that styles it     | `{Name}.parts.ts`                        |
| **preset**   | a named mix of props and parts ("Card: Pathway")                                | `{Name}.presets.ts`                      |
| **template** | the parts a new frame starts with: the default preset's                         | `DEFAULT_PRESET`, `withTemplate()`       |
| **mapper**   | turns parts into one host's pieces                                              | `integrations/*/*.mapper.ts`             |
| **adapter**  | the code that plugs the component into one host                                 | `integrations/wp/`, `integrations/puck/` |
| **host**     | a platform that renders components: WordPress, Puck, Next                       |                                          |

Other names for the same things stay where they belong: WordPress calls a preset a
**variation** and a prop an **attribute** (inside `integrations/wp/`); UCF's pages call a preset a
**design** (in comments that cite them, and in editor-facing text). A prop's key is its block
attribute, so a prop named `variant` (the Card's Look) keeps that name.

WHY stories and tests in their own folders: a component's top level then holds only what makes
it (the core, its data, its styles, its adapters), and what shows or checks it sits one level
down. Both stay inside the component's folder, so the folder still moves as one.

Each folder is self-contained, so a component can move into its own package or another repo
without untangling it from the others.

**There is no `next/` adapter.** Next's pieces go in through slots (below), so the library holds
no Next code. A host gets an adapter only when it needs something besides props, like Puck's
config object or WordPress's block files. WHY "adapter" for the code and "host" for the
platform: `integrations/wp/` is not WordPress, it is the code that plugs the core into WordPress.

## What a component exports

A component's package entry (`index.ts`, `@ucf/components/{name}`) exports what a site needs to
use it with no CMS:

| Export           | When                       | Example                              |
| ---------------- | -------------------------- | ------------------------------------ |
| `{Name}`         | always                     | `Card`                               |
| `{Name}Props`    | always (a type)            | `CardProps`                          |
| `{NAME}_PARTS`   | it has `{Name}.parts.ts`   | `CARD_PARTS`: each part's class      |
| `{NAME}_PRESETS` | it has `{Name}.presets.ts` | `CARD_PRESETS`: its designs, as data |

A component built with `frame()` (integrations/react/frame.tsx; see "Built with frame()") takes
`preset`, `content` and `sample` besides its props: a plain React site passes data
(`<Card preset="pathway" content={ { eyebrow: 'Transfer' } } />`) and gets the preset's props and
parts, filled. WHY not a stored `preset` attribute in the CMSs: there an editor changes the
content, so it must stay inner blocks or a slot; a preset only starts it. The Card has it; the
Highlight next (docs/todo.md).

integrations/tests/exports.test.ts checks every component's entry. WHY the name in the constant:
a site imports several components' parts into one file. `@ucf/components/react`
(integrations/react/) turns a preset into content for a plain React site, as WordPress's
variations and Puck's `withPreset()` do in theirs; integrations/tests/react.test.tsx renders
every preset that way. The Hero and Section still export their older extras (`HERO_CHOICES`,
`COMPOSITIONS`) until they move (docs/todo.md).

## Slots

A slot is a prop that takes something each host provides. The core never checks which host
it is in.

| Slot                          | Next passes          | WordPress passes                          | Puck passes |
| ----------------------------- | -------------------- | ----------------------------------------- | ----------- |
| `innerAs` or a `content` area | nothing (`<div>`)    | its inner-blocks element                  | its slot    |
| text                          | a string             | a string in `save()`, a field in `edit()` | a string    |
| `client`                      | a client for its API | nothing (default client)                  | nothing     |

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
  markup test; ours can (`integrations/tests/parity.test.tsx`, `integrations/tests/blocks.test.tsx`).
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

## Primitives

Decided 2026-11-01, refining the section above; narrowed 2026-11-02 by "Frames" below. **Core
blocks are for content editors. The markup a component owns is built from our own
primitives**, in `components/primitives/`, the bucket beside `content/` and `interactive/`. A frame's open content area is editor
content, so in WordPress it holds core blocks (see "Frames").

| Who                                 | In WordPress                    | In Puck and Next |
| ----------------------------------- | ------------------------------- | ---------------- |
| A content editor, or a frame's area | Core blocks (Button, Image…)    | Our primitives   |
| A component's own markup (the Card) | Our primitives, in their markup | Our primitives   |

- **A primitive is a component:** a core, `style.css`, stories, a markup test and a Puck config,
  where Puck editors place it, since Puck has no core blocks. It has **no WordPress block**:
  WordPress editors use core's equivalent. Instead it has `integrations/wp/edit.tsx`, its editing
  version, which our blocks' `edit()` renders where their `save()` renders the plain primitive.
- **Its settings are core's.** Props are named after the equivalent core block's attributes
  (the Button's `text`, `url`, `linkTarget`, and core's Fill and Outline styles), and its editing
  version uses core's tools (`PlainText` or `RichText`, `LinkControl`, `MediaUpload`). An editor
  who knows core's Button knows ours, and content can move between them.
- **Its markup and styles are ours,** from our tokens, the same in every host. Core blocks an
  editor places are styled by the theme; keep the two looking alike through the tokens both
  read.
- **The dependency goes one way:** components import primitives; primitives never import
  components. Both import `integrations/` (primitives only its type-only Puck config shape).
- **WHY primitives rather than each component drawing its own:** one Button in every component
  is what stops buttons and inputs drifting apart. P1 does the same with its `internal/btn`.
- **The cost:** a component saves its primitives' markup inside its own. Changing a primitive's
  markup changes every saved block that uses it, so keep primitives small and plain, restyle in
  CSS (which never touches saved posts), and when the markup must change, keep the old version
  (`Button.v1.tsx`) and give every block that uses it a deprecation. The stored-markup snapshots
  fail for each one, so none is missed.
- **Not for behavior.** Interactive pieces (a combobox, a dialog) take their behavior from an
  unstyled library in interactive components only; not chosen yet (docs/todo.md).

## Frames

Decided 2026-11-02. A content component is one of two shapes:

| Shape     | What it owns                                  | Its content                                  | Examples                                               |
| --------- | --------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| **Fixed** | Its markup, its parts as fields, how they fit | Fields (attributes in WordPress, Puck props) | examples/fixed-card                                    |
| **Frame** | The box: layout, band, image, rule, spacing   | Open: inner blocks in WordPress, a Puck slot | Section, Hero, Highlight, Card; examples/flexible-card |

- **A frame renders its content in one element:** its `content` area (built with `frame()`), or
  `innerAs` (the frames not moved yet). WordPress passes its inner-blocks
  element (in `edit()` and `save()`), Puck its slot, plain React a `<div>`. The markup is the
  same in every host, and each host's editing area is the frame's own element.
- **A new frame starts with a template, never a lock.** WordPress: `useInnerBlocksProps( props,
{ template } )` with core blocks. Puck: `withTemplate()` from the frame's Puck config, with the
  library's primitives under the keys the README gives (`Heading`, `Paragraph`, `Button`,
  `Image`). The plain Puck config starts empty, because a host may register the primitives
  under other names. Editors may change, move or remove anything in it.
- **Presets are data.** Where a frame has several named designs (the Card's story, next step,
  audience, pathway and media cards; the Highlight's statement, key figure, bracket, side rule
  and centered), they are presets, in one list, `{Name}.presets.ts`: each is the frame's props plus its parts by kind, and `DEFAULT_PRESET` is
  the one a new frame starts with. WordPress registers each as a block variation
  (integrations/wp/parts.ts maps parts to core blocks), Puck builds each with
  `withPreset( name )` (integrations/puck/parts.ts maps them to primitives), and the stories render them. A new preset
  is a new entry; tests check each reaches both hosts, names an icon WordPress has, and uses
  only the frame's own props.
- **Parts are named by class.** Where a part has its own look (the Hero's title, the Highlight's
  statement), the template sets a class on it (`PARTS`, in the Card's Card.parts.ts and
  still in the other frames' cores) in both hosts: core's
  "Additional CSS class(es)" in WordPress, the primitive's CSS class field in Puck. The frame's
  CSS styles it as `.ucf-c-{frame} .ucf-c-{frame}__{part}`, two classes, so it wins over the one
  class a core block or a primitive styles itself with.
- **The cost:** nothing makes a Hero have a title or a Highlight a source, an editor can remove the
  class, and nothing else can read the parts as fields. Choose fixed when something must read a
  part (a listing, search) or the design depends on how parts fit (the fixed card's image bleed
  and whole-card link, in examples/fixed-card); choose a frame when the content is meant to vary.
- **Tests:** a frame's markup test renders content through its `content` area (or `innerAs`); blocks.test.tsx checks
  each frame saves and reads back blocks placed inside it; puck.test.tsx checks each template
  names primitives that exist and sets every prop they have.

### Built with frame()

Decided 2026-11-05. A content component's `{Name}.tsx` is a plain React component, passed to
`frame()` (integrations/react/frame.tsx) with what it is (slug, title, kind, `wpIcon`, props,
parts, presets; `ComponentDefinition` in integrations/schema/definition.ts). That gives back a
React component that works on its own, presets included, and `{Name}.port`: the definition, and
`Frame`, the same markup with its areas open for a host to fill.

```tsx
function CardMarkup( { variant, children, area, ...props }: FrameProps< typeof PROPS > ) {
	return (
		<div className="ucf-c-card" …>
			{ area( 'content', { className: 'ucf-c-card__content' }, children ) }
		</div>
	);
}

/** A box with any content inside. … */
const Card = frame( CardMarkup, { slug: 'card', title: 'Card', props: PROPS, parts: PARTS, … } );
export default Card;
```

WHY the component first and frame() last: it reads as the React component it is, as
`memo( Card )` would. WHY a named `const Card`: a hover on `<Card` then lists its props, each
with its values, and the doc comment above it. The props follow the presets: `preset` takes only a preset's name, and
`content` only the parts that preset holds, so `<Card preset="pathway" content={ { tag } } />`
is a type error (the tag is the media tile's). WHY `as const` on `{Name}.presets.ts`: it keeps the
names and parts exact for those types. An area is where content goes: a `<div>` on a React site, or the element a
host passes (`<Card.port.Frame areas={ { content: InnerBlocksArea } } />`). Hosts fill the one
named `content`. WHY: host-only props (`innerAs`, `media`) had become part of the React API;
areas keep them on the port, so every prop a React site sees means something there. WHY `area`
a function, not an `<Area>` component: it needs no React context, so nothing happens that the
file doesn't show. The component may not use hooks: WordPress saves its markup.

The rules that keep frame() small: an area is a name, a class and its children, nothing more; the
port is plain data plus `Frame`; frame() takes no per-component options (a need one component
has goes in its own file).

### One definition, one translator per environment

Decided 2026-11-04. Each environment has one translator that turns any framed component into its
integration, reading its port:

| Environment | Translator                                                                 | A component's file becomes                                        |
| ----------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| React site  | `frame()`, integrations/react/frame.tsx                                    | `const Card = frame( CardMarkup, { … } )` in Card.tsx             |
| Puck        | `puckConfig()`, integrations/puck/config.tsx                               | `puckConfig( Card )` in integrations/puck/config.tsx              |
| WordPress   | `blockEdit()`, `blockSave()`, `blockSettings()`, integrations/wp/block.tsx | one line each in integrations/wp/edit.tsx, save.tsx and index.tsx |

WHY one translator per environment, not one file for all: the component and its port are plain
data and React, safe to import anywhere; WordPress's code must never reach the npm package,
nor Puck's the plugins. WHY translators, not each component's own adapter code: the adapters
were the same pattern four times over (Card's and the Highlight's save.tsx differed in four
comment lines); a fix or a new editing feature now lands in every component at once.

Every component keeps its `integrations/` folder, with each environment's usual files: for a
block, `block.json`, `index.tsx`, `edit.tsx` and `save.tsx`, each a one-line call to the
translator. WHY not generate them away: they are signposts. A WordPress developer finds the
files WordPress documents, where they expect them, and `save.tsx` is where to look for what a
post stores (and where its deprecations go). WHY overrides go there, not in the definition: a
need one component has is handled in its own file (wrap or replace the call); only a need several
components share becomes a definition option, so the definition doesn't grow into a language of
its own. An interactive component's folder also holds what is truly its own (`render.php`,
`view.tsx`, its settings).

### How content reaches a frame

Decided 2026-11-04. A frame has three layers, designed from the React render out:

```
integrations   each environment stores one layer: data, or open content
     │
content        preset + content → the preset's parts, filled        (integrations/react/frame.tsx)
     │ children
frame          the component: the box, and whatever is inside it    ({Name}.tsx)
```

The frame renders all markup, whatever stored the content, so the markup is the same either way.
The content layer is the React API (`<Card preset="pathway" content={ { … } } />`); each
environment is a way to produce the frame's props:

| Environment | Stores                                                                              | Renders through       |
| ----------- | ----------------------------------------------------------------------------------- | --------------------- |
| React site  | props: `preset`, `content`, or `children`                                           | content, or the frame |
| Puck        | `preset`, `content` (a field per part), or `blocks` (a slot, for the "Open" design) | content, or the frame |
| WordPress   | inner blocks (a preset inserts the starting ones)                                   | the frame             |

WHY WordPress stays on inner blocks for now: an editor changes the content there, and a static
block's content has to be blocks or attributes with an editing UI for each part. Worth
prototyping: WordPress's pattern overrides (6.6+), which store per-instance content for named
blocks inside a synced pattern, much as `content` does by part name. The Card is on this model;
the Highlight follows (docs/todo.md).

## Distribution

### npm: one package

`@ucf/components`, one version, a path per component (`@ucf/components/highlight`,
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

| Plugin        | Blocks                                         |
| ------------- | ---------------------------------------------- |
| `ucf-content` | `ucf-content/section`, `ucf-content/highlight` |
| `ucf-degrees` | `ucf-degrees/degree-finder`                    |

- **The plugin owns its list,** so a plugin's contents are readable in one place. The build
  fails if a component with an `integrations/wp/` is in no plugin or in two.
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

That split is why, on Bold Gold, a Highlight draws a black rule (gold's own accent) while the
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
2. Copy the old markup into a frozen component (`Highlight.v1.tsx`) and add a `deprecated` entry
   in `integrations/wp/index.tsx` that renders it.
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

The tests in `integrations/tests/` find every component on their own, so a new one is
covered with nothing to add. They are modeled on the UCF Brand Block Theme's suites.

- **Block round-trip** (`integrations/tests/blocks.test.tsx`): every block is created, serialized as a post
  stores it, parsed back and checked with `isValidBlockContent()`, the editor's own test, plus a
  snapshot of what a post stores. WHY not the parsed block's `isValid`: `parse()` quietly
  migrates mismatched markup through `deprecated` and reports it valid. WHY the snapshot: a
  renamed class passes the round-trip while invalidating every saved post.
- **WordPress and Puck parity** (`integrations/tests/parity.test.tsx`): every component has a block, a Puck
  config and stories; the block attributes, Puck fields and Puck defaults name the same props;
  and a content block saves the same markup Puck renders.
- **Markup contract** (`highlight/tests/Highlight.test.tsx`): WordPress's serializer and React DOM produce the
  same HTML, and it matches the snapshot. Every content component needs one.
- **Data client** (`degree-finder/tests/client.test.ts`): what it requests and what it keeps, with a fake
  `fetch`. Every interactive component's client needs one.
- **Puck configs** (`integrations/tests/puck.test.tsx`): each config fits Puck's own `ComponentConfig`
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
  The Highlight block casts.
- **`PlainText`'s generated types have no props.** The Highlight edit casts it.
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
