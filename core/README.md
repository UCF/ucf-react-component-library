# core

The code every component is built on. You describe a component once, in its own folder under
`components/`. The code here turns that description into a React component, a WordPress block, a
Puck config and Storybook stories.

You use a few files here and never edit them. Everything else is plumbing those few call.

## Which path is yours?

Every component starts in `define/`. What comes next depends on its kind:

```
Content       define/  →  frame/  →  hosts/*/ block.tsx, config.tsx
              The builders make the whole block and Puck config. Your block's files are one line each.

Live,         define/  →  (plain React)  →  hosts/*/ controls/, fields.ts, arg-types.ts
interactive   You write the block's edit.tsx and the Puck config yourself; the core gives you
              the controls for your settings.
```

| Your component is…                                                   | It uses                                                                   | Its block and Puck config are…                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Content**: WordPress saves its markup; editors fill it with blocks | `define/`, `frame/`, all of `hosts/`                                      | one-line calls to the builders                       |
| **Live**: its markup comes from a feed, rendered by `render.php`     | `define/props.ts`, the setting parts of `hosts/`                          | written by hand, using the setting controls          |
| **Interactive**: it runs in the browser                              | `define/props.ts`, the setting parts of `hosts/`                          | written by hand                                      |
| **Primitive**                                                        | `define/props.ts`, `hosts/puck/fields.ts`, `hosts/storybook/arg-types.ts` | no block (editors use the core block); a Puck config |

Columns and Column are primitives that also use `frame()`, for their areas.

**WHY content alone gets builders:** they assume WordPress saves the markup (`blockSave`) and
that the content is editable blocks (parts and presets). A live block's markup comes from
`render.php` on every page view, and its content from a feed, so neither holds.

## What's here

★ marks what a component imports. If you're building one, those are the files to read.

```
define/          EVERY component: what you write against
  props.ts         ★ settings: ChoiceProp, TextProp, NumberProp, ListProp; PropsOf, defaultsIn()
  parts.ts         ★ content slots (content components): PartDefinitions; resolveParts()
  presets.ts       ★ named designs (content components): Preset; findPreset()
  compositions.ts  ★ the section color schemes a setting can offer
  definition.ts      all of the above together, as frame() takes it
  options.ts         a list setting's saved values ↔ what an editor sees

frame/           CONTENT components: your markup + definition → the component   (shipped as @ucf/components/react)
  frame.tsx        ★ frame(): the React component, and its port
  parts.tsx          parts → React elements; presetContent()
  index.ts           what a React site imports

hosts/           each environment
  options.ts         loads a list setting's options once a page (both editors use it)
  wordpress/                                                                  (built into the plugins)
    controls/      EVERY component: a setting → its sidebar control
      inspector.tsx  ★ FieldControl
      list-control.tsx  a list setting as WordPress's token field
    attributes.ts    EVERY component: settings → block.json attributes (npm run sync:blocks)
    block.tsx      ★ CONTENT: the whole block: blockEdit(), blockSave(), blockSettings()
    parts.ts         CONTENT: parts → core blocks
    kind.ts, icons.ts  content / live / interactive from block.json; the icon list
  puck/                                                                       (shipped with the Puck configs)
    fields.ts      ★ EVERY component: settings → Puck fields (puckFields)
    list-field.tsx   a list setting as checkboxes
    types.ts       ★ Puck's config shape, without importing Puck
    config.tsx     ★ CONTENT: the whole Puck config (puckConfig)
    presets.ts       CONTENT: the Design picker and a field per part
    parts.ts         CONTENT: parts → primitives in Puck's slot
  storybook/                                                                  (never shipped)
    arg-types.ts   ★ EVERY component: settings → story controls
    parts.tsx      ★ CONTENT: parts → React, with a sample photo
    contrast.ts    ★ a contrast check run in the browser

testing/                                                                      (never shipped)
  live.ts          ★ LIVE: runs a block's PHP in its own tests (php(), sameHtml())
  suites/            checks that run over every component
```

Imports go one way: components import from here, and nothing here imports a component. The
suites are the exception; they find every component by searching `components/`.

## Follow one setting through the system

The Card's **Look** setting (`variant`: plain, boxed or ruled), from where you write it to every
place it shows up.

**1. You describe it** in `components/content/card/Card.props.ts`:

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

`define/props.ts` says what you may write here, so your editor autocompletes it and flags
mistakes. Its `PropsOf` turns the description into a type: `variant` becomes
`'plain' | 'boxed' | 'ruled'`.

**2. Your markup uses it** in `Card.tsx`, as an ordinary prop:

```tsx
function CardMarkup( { variant = PROPS.variant.default, … } ) {
	return <div className="ucf-c ucf-c-card" data-variant={ variant }>…</div>;
}
```

**3. `frame()` wraps your markup** (`frame/frame.tsx`). `frame( CardMarkup, { props: PROPS, … } )`
returns the `Card` a React site imports, with `Card.port` attached: everything a host needs (the
settings, parts, presets and markup). Every builder in `hosts/` reads it, which is why the Card's
own WordPress files are one line each:

```ts
// components/content/card/integrations/wp/edit.tsx
export default blockEdit( Card );
```

**4. Each host turns the description into its own control:**

| Where                | What `variant` becomes                                              | The code                                                               |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| WordPress block.json | an attribute, `"variant": { "type": "string", "default": "plain" }` | `npm run sync:blocks` writes it, using `hosts/wordpress/attributes.ts` |
| WordPress sidebar    | three radio buttons in the **Card** panel                           | `hosts/wordpress/block.tsx` → `hosts/wordpress/controls/inspector.tsx` |
| WordPress saved post | `data-variant="boxed"` in the stored HTML                           | `hosts/wordpress/block.tsx` (`blockSave`) renders your markup          |
| Puck                 | a radio field                                                       | `hosts/puck/fields.ts` (`puckFields`)                                  |
| Storybook            | a radio control                                                     | `hosts/storybook/arg-types.ts`                                         |

You wrote the setting once; four environments show it. A live block gets the same first, second,
fourth and fifth rows: its own `edit.tsx` calls `FieldControl`, and its Puck config calls
`puckFields`.

**5. The suites check it stayed the same everywhere:**

- `testing/suites/parity.test.tsx`: block.json, the Puck fields and the Puck defaults all have
  `variant`, and WordPress's saved HTML matches what Puck renders for every value.
- `testing/suites/blocks.test.tsx`: a post saved with `variant: 'boxed'` reloads in the editor
  without "This block contains unexpected or invalid content", and matches its snapshot.

## Follow one part through the system

Content components only. Settings are values; **parts** are the content inside a component: its
title, image, buttons. The Card's `title`:

**1. You describe it** in `Card.parts.ts`, with its kind and the class that styles it:

```ts
title: { kind: 'heading', className: 'ucf-c-card__title' },
```

**2. A preset uses it** in `Card.presets.ts`: a design says which parts it has, in order.

**3. Your markup leaves a space for parts.** `Card.tsx` doesn't render the title itself. It opens
an **area** called `content`, and whatever the host provides goes there:

```tsx
{
	area( 'content', { className: 'ucf-c-card__content' }, children );
}
```

**4. Each host fills that area its own way:**

| Where      | What the `title` part becomes                                                   | The code                                                          |
| ---------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| React site | a `<Heading className="ucf-c-card__title">`                                     | `frame/parts.tsx`                                                 |
| WordPress  | a core Heading block with that class, inside the block, which editors type into | `hosts/wordpress/parts.ts`, placed by `hosts/wordpress/block.tsx` |
| Puck       | a Heading primitive in the Card's slot, or a text field in the Design picker    | `hosts/puck/parts.ts`, `hosts/puck/presets.ts`                    |
| Storybook  | the React version, with a sample photo for image parts                          | `hosts/storybook/parts.tsx`                                       |

`define/parts.ts` is the shared step: `resolveParts()` turns a preset's list of parts into plain
descriptions (kind, class, text) that each host's `parts` file then renders.

## Where to go next

- Build one: [docs/first-component.md](../docs/first-component.md) walks through the Card, then
  your own component.
- Why it's built this way: [docs/architecture.md](../docs/architecture.md), "One definition, one
  translator per environment".
