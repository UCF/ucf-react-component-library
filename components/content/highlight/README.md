# Highlight

A content component and a frame: something pulled out of the page to stand on its own (a fact,
a key figure, a ranking), with its source. Block `ucf-content/highlight`; Puck
`@ucf/components/highlight/puck`. What each word means, and why the files are split this way:
[docs/architecture.md](../../../docs/architecture.md), "A component's folder". What to edit for
each change: [docs/first-component.md](../../../docs/first-component.md), "Changing it later".

## Object model

```
Highlight
├─ Highlight.props.ts     rule · contentAlign                            panel "Highlight"
├─ Highlight.parts.ts     statement · figure · label · detail ·          text
│                         source · citation
│                         logo                                           image (keeps its shape)
└─ Highlight.presets.ts   statement (DEFAULT_PRESET) · key-figure · bracket · side-rule · centered
```

| Preset       | Props                  | Parts                       |
| ------------ | ---------------------- | --------------------------- |
| `statement`  | rule across the top    | statement, detail, source   |
| `key-figure` | rule across the top    | figure, label, source       |
| `bracket`    | bracket (top and side) | statement, detail           |
| `side-rule`  | rule down the side     | statement, detail, citation |
| `centered`   | short bar, centered    | figure, detail, citation    |

## Files

| File                      | What it holds                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `Highlight.tsx`           | the component: props in, markup out                                                           |
| `Highlight.props.ts`      | the props: each one's type, values, default and field                                         |
| `Highlight.parts.ts`      | the parts: each one's kind and the class that styles it                                       |
| `Highlight.presets.ts`    | the presets, and `DEFAULT_PRESET`                                                             |
| `style.css`               | the rule, the spacing, and every class in PARTS                                               |
| `integrations/wp/`        | the block: `block.json`, `index.tsx` (presets as variations, `ICONS`), `edit.tsx`, `save.tsx` |
| `integrations/puck/`      | `config.tsx` (`withTemplate()`, `withPreset()`)                                               |
| `integrations/storybook/` | `Highlight.stories.tsx`: each preset, and rows as the UCF pages set them                      |
| `tests/`                  | `Highlight.test.tsx` (markup)                                                                 |
