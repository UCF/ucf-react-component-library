# integrations

How a component reaches each environment, written once for every component. A component
is one `frame()` call (its props, parts, presets and markup); that gives a React component, and
a port the code here turns into a WordPress block, a Puck config and stories.

```
components/content/card/Card.tsx       function CardMarkup(…) { … }; const Card = frame( CardMarkup, { … } )
        │                               → the Card a site imports, and Card.port
        ├─► integrations/wp/block.tsx    → its block    (card's integrations/wp/ calls it)
        └─► integrations/puck/config.tsx → its Puck config
```

Each component's own `integrations/` folder mirrors this one, with one-line calls into it, and
holds anything specific to that component. Why: [docs/architecture.md](../docs/architecture.md),
"One definition, one translator per environment".

What is in each folder. Each environment has a main file named for what it makes, and a
`parts` file for how parts render there:

```
schema/         what a component may declare
  props.ts        PropDefinitions: a prop's type, values, default, field; PropsOf, defaultsIn()
  parts.ts        PartDefinitions: each part's kind and class; resolveParts()
  presets.ts      Preset; findPreset()
  definition.ts   ComponentDefinition: what a component is, as data
  compositions.ts the compositions (section colors) any component can offer

wp/             WordPress                                   (the plugins only)
  block.tsx       blockEdit(), blockSave(), blockSettings(): a framed component as a block
  parts.ts        parts → core blocks
  attributes.ts   blockAttributes(), ownAttributes()
  inspector.tsx   FieldControl: a prop as a sidebar control
  icons.ts        every icon a block or preset names

puck/           Puck                                        (shipped with the Puck configs)
  config.tsx      puckConfig(): a framed component as a Puck config; puckFields()
  parts.ts        parts → primitives
  presets.ts      the Design picker and a field per part
  types.ts        Puck's config shape, without depending on Puck

react/          a plain React site                          (shipped as @ucf/components/react)
  frame.tsx       frame(): a component from its definition and markup, with its port
  parts.tsx       parts → React; presetContent()

storybook/      the stories                                 (never shipped)
  arg-types.ts    props → story controls
  parts.tsx       parts → React, with the sample photo
  contrast.ts     contrast measured in the browser

tests/          run against every component                 (never shipped)
```

The dependency goes one way: components and primitives import from here; nothing here imports
a component, except the tests, which find them by glob. Each environment's parts file uses the
primitives, as the components do.
