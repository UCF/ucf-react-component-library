# Card

A content component and a frame: a card's box with any content inside. Block
`ucf-content/card`; Puck `@ucf/components/card/puck`. What each word means, and why the files
are split this way: [docs/architecture.md](../../../docs/architecture.md), "A component's
folder". What to edit for each change: [README.md](../../../README.md), "Changing a component".

On a React site, `<Card preset="pathway" content={ { eyebrow: 'Transfer', … } } />`; in Puck, a Design
picker and a field per part, stored the same way. Either way, the preset's
props and parts, each part filled by its name below ([README.md](../../../README.md), "In Next,
Puck or another React site").

## Why it's built this way

- **A frame, not fixed fields:** a card's content varies (an image and a link, a list, two
  buttons, a stat). The cost: the result is only as consistent as what's put in it, and nothing
  else can read its title or link. `examples/fixed-card` shows the other shape, for when a
  listing must read them or the whole card must be one link.
- **No image bleed:** the frame doesn't know what its first block is; reaching into a core
  Image's markup would tie its CSS to core's classes. The fixed example can, because it owns
  its image.
- **Props that combine, not one per design:** the five designs are the same few choices
  (a look, its own colors, a background under a tint or gradient, where the content sits, a
  shape) in different mixes. A new design is a new mix first.
- **The background image is the Card's, not a block inside:** it sits under the content and
  the overlay, as the Hero's full image does; a block inside can't.

## Object model

```
Card
├─ Card.props.ts      variant · composition                          panel "Card"
│                     contentAlign · contentPosition · aspectRatio   panel "Layout"
│                     imageSrc (media) · imageAlt · overlay          panel "Background image"
│                     imageId                                        WordPress only, set by the picker
├─ Card.parts.ts      image                                          image
│                     tag · eyebrow · meta · description             text
│                     title · display · label                        heading
│                     link                                           link
│                     button                                         button
└─ Card.presets.ts    the data
    └─ presets        story (DEFAULT_PRESET) · next-step · audience · pathway · media
```

| Preset      | Props                                                                 | Parts                               |
| ----------- | --------------------------------------------------------------------- | ----------------------------------- |
| `story`     | plain                                                                 | image, meta, title, description     |
| `next-step` | boxed                                                                 | title, description, button          |
| `audience`  | plain, Bold Gold, tint, centered, square; a background image          | label, description                  |
| `pathway`   | plain, Dark                                                           | eyebrow, heading, description, link |
| `media`     | plain, Dark, gradient, content at the bottom, 4:3; a background image | tag, description                    |

## Files

| File                      | What it holds                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Card.tsx`                | the component: props in, markup out                                                                      |
| `Card.props.ts`           | the props: each one's type, values, default and field                                                    |
| `Card.parts.ts`           | the parts: each one's kind and the class that styles it                                                  |
| `Card.presets.ts`         | the data: the presets, and `DEFAULT_PRESET` (what a new Card starts with, and the inserter's preview)    |
| `style.css`               | the box, the background, and every class in PARTS                                                        |
| `Card.definition.ts`      | everything the Card is, for the translators: slug, title, kind, wpIcon, component, props, parts, presets |
| `integrations/wp/`        | `block.json`, and `index.tsx`: `registerComponent( card, metadata )`                                     |
| `integrations/puck/`      | `config.tsx`: `puckConfig( card )`, with `withTemplate()` and `withPreset()`                             |
| `integrations/storybook/` | `Card.stories.tsx` (props), `Card.presets.stories.tsx`, `Card.checks.stories.tsx`                        |
| `tests/`                  | `Card.test.tsx` (markup), `presets.test.tsx`                                                             |
