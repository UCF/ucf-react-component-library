# core

The code every component is built on. You describe a component once, in its own folder under
`components/`. The code here turns that description into a React component, a WordPress block, a
Puck config and Storybook stories.

You use a few files here and never edit them. Everything else is plumbing those few call.

## The process

Building a component is seven steps. Every file in `core/` opens with the step it serves, who
it's for, and what it does:

```ts
/** Step 6 · WordPress · every component · one prop → its sidebar control (FieldControl). */
```

| Step | What you do               | Who             | You write                               | The core's part                                                       |
| ---- | ------------------------- | --------------- | --------------------------------------- | --------------------------------------------------------------------- |
| 1    | Decide its kind           | every component | its folder: `components/{kind}/{name}/` | `hosts/wordpress/kind.ts` reads it back from block.json               |
| 2    | Describe its props        | every component | `props.ts`                              | `hosts/prop-definitions.ts`, `design/compositions.ts`                 |
| 3    | Describe what goes inside | content         | `frame/parts.ts`, `frame/presets.ts`    | `frame/types.ts` §1–2                                                 |
| 4    | Write its markup          | every component | `{Name}.tsx`                            | `frame/types.ts` §3 for content (`FrameProps`); plain React otherwise |
| 5    | `frame()` it              | content         | the `frame( … )` call in `{Name}.tsx`   | `frame/frame.tsx`, `frame/read-parts.ts`, `frame/render-parts.tsx`    |
| 6    | Put it in each host       | every component | `hosts/wp/`, `puck/`, `storybook/`      | `hosts/`: builders for content, controls for everyone                 |
| 7    | Check it                  | every component | `tests/`                                | `testing/`                                                            |

## Which steps are yours?

It depends on the component's kind (step 1):

```
Content       2 props → 3 parts and presets → 4 markup → 5 frame() → 6 builders → 7
              The builders make the whole block and Puck config. Your block's files are one line each.

Live,         2 props → 4 markup (plain React) → 6 controls → 7
interactive   You write the block's edit.tsx and the Puck config yourself; the core gives you the
              controls for your props.
```

| Your component is…                                                   | It uses                                                                                              | Its block and Puck config are…                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Content**: WordPress saves its markup; editors fill it with blocks | `frame/`, all of `hosts/`                                                                            | one-line calls to the builders                       |
| **Live**: its markup comes from a feed, rendered by `render.php`     | `hosts/prop-definitions.ts`, the "every component" files in `hosts/`                                 | written by hand, using the prop controls             |
| **Interactive**: it runs in the browser                              | `hosts/prop-definitions.ts`, the "every component" files in `hosts/`                                 | written by hand                                      |
| **Primitive**                                                        | `hosts/prop-definitions.ts`, `hosts/puck/props-to-fields.ts`, `hosts/storybook/props-to-controls.ts` | no block (editors use the core block); a Puck config |

Columns and Column are primitives that also use `frame()`, for their areas.

**WHY content alone gets builders:** they assume WordPress saves the markup (`blockSave`) and
that the content is editable blocks (parts and presets). A live block's markup comes from
`render.php` on every page view, and its content from a feed, so neither holds.

## How files are named

Three kinds of file, and the name tells you which:

| Name                              | What it is                                                                    | Examples                                                    |
| --------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `types.ts`, `prop-definitions.ts` | what you fill in: shapes your files are written against; nothing in them runs | `frame/types.ts`, `hosts/prop-definitions.ts`               |
| `{from}-to-{to}`                  | one translation, from what you wrote to what a host needs                     | `wordpress/parts-to-blocks.ts`, `puck/props-to-fields.ts`   |
| a noun                            | a builder: makes a whole thing from your component                            | `wordpress/block.tsx`, `puck/config.tsx`, `frame/frame.tsx` |

`read-*` files (`read-props.ts`, `read-parts.ts`) look things up for the translators and builders.

**Start with the files that hold what you fill in:** `hosts/prop-definitions.ts` for every
component's props, and `frame/types.ts` for a content component's parts and presets. The other
files are how the core uses what you wrote; you don't need to read them to build a component.

## What's here

★ marks what a component imports. The number is the step.

```
design/                      a layer over the design tokens (tokens/ at the repo root is the source)
  compositions.ts         2  ★ the section color schemes (Light, Dark, Bold Gold…) for a Colors prop

frame/                       CONTENT components                       (shipped as @ucf/components/react)
  types.ts              3–5  ★ §1 parts · §2 presets · §3 your markup's props and areas · §4 the
                               definition · §5 the port
  frame.tsx               5  ★ frame(): your markup + its definition → the component and its port
  read-parts.ts           5  ★ findPreset(), resolveParts()
  render-parts.tsx        5    parts → React elements; presetContent()
  index.ts                     a React site's entry

hosts/                       each environment, and EVERY component's props
  prop-definitions.ts     2  ★ what you write in props.ts: ChoiceProp, TextProp, NumberProp,
                               ListProp, PropDefinitions; PropsOf
  read-props.ts           6  ★ how the hosts read props: defaultsIn(), panelsOf(), inHost(), mediaProps()
  list-options.ts         6    a list prop's options in the editors: loaded once a page; values ↔ labels
  wordpress/                                                          (built into the plugins)
    kind.ts               1    a component's kind, from its block.json
    props-to-attributes.ts 6   EVERY: props → block.json attributes (npm run sync:blocks)
    controls/
      prop-control.tsx    6  ★ EVERY: one prop → its sidebar control (FieldControl)
      list-control.tsx    6    EVERY: a list prop as a token field
      links-control.tsx   6    EVERY: a links prop as a text field and a Section picker per link
      tiles-control.tsx   6    EVERY: a tiles prop as text, description and address per tile
    icons.ts              6    every icon a block or preset names
    parts-to-blocks.ts    6    CONTENT: parts → core blocks
    block.tsx             6  ★ CONTENT: the whole block: §1 sidebar · §2 edit · §3 save · §4 settings
  puck/                                                               (shipped with the Puck configs)
    types.ts              6  ★ Puck's own config shape, without importing Puck
    props-to-fields.ts    6  ★ EVERY: props → Puck fields (puckFields)
    list-field.tsx        6    EVERY: a list prop as checkboxes
    parts-to-primitives.ts 6   CONTENT: parts → primitives in Puck's slot
    presets.ts            6    CONTENT: the Design picker and a field per part
    config.tsx            6  ★ CONTENT: the whole Puck config (puckConfig)
  storybook/                                                          (never shipped)
    props-to-controls.ts  6  ★ EVERY: props → story controls
    parts-to-samples.tsx  6  ★ CONTENT: parts → React, with a sample photo
    contrast.ts           7  ★ a contrast check run in the browser

testing/                                                              (never shipped)
  live.ts                 7  ★ LIVE: runs a block's PHP in its own tests (php(), sameHtml())
  suites/                 7    checks that run over every component
```

Imports go one way: components import from here, and nothing here imports a component. The
suites are the exception; they find every component by searching `components/`.

## Words you'll see

| Word                   | Means                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------- |
| **host**               | somewhere a component runs: WordPress, Puck, Storybook, a React site                                      |
| **component kind**     | content, live, interactive or primitive: decides which steps a component has (step 1)                     |
| **prop**               | a setting an editor sets on a component (Look, Colors), like a function's argument                        |
| **prop definition**    | your description of one prop in `props.ts`: its values, default and how an editor shows it                |
| **field**, **control** | what a host makes from a prop definition: a Puck field, a WordPress sidebar control, a story control      |
| **attribute**          | how WordPress saves a prop in a post; named in block.json                                                 |
| **part**               | one piece of content inside a content component: its title, an image, a button                            |
| **part kind**          | what a part is: heading, text, image, link or button. Not the same as a component kind                    |
| **preset**             | a named design: some props and a list of parts ("Card: Pathway")                                          |
| **area**               | a space in your markup where content goes; each host fills it its own way (inner blocks, a Puck slot)     |
| **definition**         | everything that describes a content component (slug, title, props, parts, presets), as `frame()` takes it |
| **frame()**            | the function that joins your markup to its definition and gives back the component                        |
| **port**               | what `frame()` attaches to the component (`Card.port`): everything a host needs to know about it          |
| **builder**            | code that makes a whole thing from a component: the block (`block.tsx`), the Puck config (`config.tsx`)   |
| **composition**        | a section's color scheme, from the design tokens                                                          |

## Follow one prop through the system

The Card's **Look** prop (`variant`: plain, boxed or ruled), from where you write it to every place
it shows up.

**Step 2. You describe it** in `components/content/card/props.ts`:

```ts
variant: {
	type: 'choice',
	label: 'Look',
	panel: 'Card',
	control: 'radio',
	options: [ { value: 'plain', … }, { value: 'boxed', … }, { value: 'ruled', … } ],
	default: 'plain',
},
```

`hosts/prop-definitions.ts` says what you may write here, so your editor autocompletes it and
flags mistakes. Its `PropsOf` turns the description into a type: `variant` becomes
`'plain' | 'boxed' | 'ruled'`.

**Step 4. Your markup uses it** in `Card.tsx`, as an ordinary prop:

```tsx
function CardMarkup( { variant = PROPS.variant.default, … } ) {
	return <div className="ucf-c ucf-c-card" data-variant={ variant }>…</div>;
}
```

**Step 5. `frame()` wraps your markup** (`frame/frame.tsx`). `frame( CardMarkup, { props: PROPS, … } )`
returns the `Card` a React site imports, with `Card.port` attached. Every builder in `hosts/` reads
the port, which is why the Card's own WordPress files are one line each:

```ts
// components/content/card/hosts/wp/edit.tsx
export default blockEdit( Card );
```

**Step 6. Each host turns the description into its own control:**

| Where                | What `variant` becomes                                              | The code                                                                     |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| WordPress block.json | an attribute, `"variant": { "type": "string", "default": "plain" }` | `npm run sync:blocks`, using `hosts/wordpress/props-to-attributes.ts`        |
| WordPress sidebar    | three radio buttons in the **Card** panel                           | `hosts/wordpress/block.tsx` §1 → `hosts/wordpress/controls/prop-control.tsx` |
| WordPress saved post | `data-variant="boxed"` in the stored HTML                           | `hosts/wordpress/block.tsx` §3 (`blockSave`) renders your markup             |
| Puck                 | a radio field                                                       | `hosts/puck/props-to-fields.ts` (`puckFields`)                               |
| Storybook            | a radio control                                                     | `hosts/storybook/props-to-controls.ts`                                       |

You wrote the prop once; four hosts show it. A live block gets the same first, second, fourth and
fifth rows: its own `edit.tsx` calls `FieldControl`, and its Puck config calls `puckFields`.

**Step 7. The suites check it stayed the same everywhere:**

- `testing/suites/parity.test.tsx`: block.json, the Puck fields and the Puck defaults all have
  `variant`, and WordPress's saved HTML matches what Puck renders for every value.
- `testing/suites/blocks.test.tsx`: a post saved with `variant: 'boxed'` reloads in the editor
  without "This block contains unexpected or invalid content", and matches its snapshot.

## Follow one part through the system

Content components only. Props are values; **parts** are the content inside a component: its
title, image, buttons. The Card's `title`:

**Step 3. You describe it** in `frame/parts.ts`, with its part kind and the class that styles it
(the types are in `frame/types.ts` §1):

```ts
title: { kind: 'heading', className: 'ucf-c-card__title' },
```

A preset in `frame/presets.ts` then uses it: a design says which parts it has, in order.

**Step 4. Your markup leaves a space for parts.** `Card.tsx` doesn't render the title itself. It
opens an **area** called `content`, and whatever the host provides goes there:

```tsx
<div className="ucf-c ucf-c-card">
	{ area( 'content', { className: 'ucf-c-card__content' }, children ) }
</div>
```

**Steps 5 and 6. Each host fills that area its own way.** `frame/read-parts.ts` is the shared
step: `resolveParts()` turns a preset's list of parts into plain descriptions (part kind, class,
text). Each host's `parts-to-*` file then renders them:

| Where      | What the `title` part becomes                                                   | The code                                                                    |
| ---------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| React site | a `<Heading className="ucf-c-card__title">`                                     | `frame/render-parts.tsx`                                                    |
| WordPress  | a core Heading block with that class, inside the block, which editors type into | `hosts/wordpress/parts-to-blocks.ts`, placed by `hosts/wordpress/block.tsx` |
| Puck       | a Heading primitive in the Card's slot, or a text field in the Design picker    | `hosts/puck/parts-to-primitives.ts`, `hosts/puck/presets.ts`                |
| Storybook  | the React version, with a sample photo for image parts                          | `hosts/storybook/parts-to-samples.tsx`                                      |

## Where to go next

- Build one: [docs/first-component.md](../docs/first-component.md) walks through the Card, then
  your own component.
- Why it's built this way: [docs/architecture.md](../docs/architecture.md), "One definition, one
  translator per environment".
