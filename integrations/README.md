# integrations

How a component works in each environment it runs in, written once for every component. A
component's folder says what it is (its markup, props, parts, presets and styles); this
folder turns that into a WordPress block, a Puck component and Storybook stories, and holds the
tests every component must pass ([docs/architecture.md](../docs/architecture.md), "A
component's folder").

```
components/content/card/            define     what a Card is: Card.props.ts, Card.parts.ts, Card.presets.ts
integrations/schema/        resolve    what any component may declare, and the lookups
                                       (each part's kind and class, each prop's default)
integrations/wp/            ┐
integrations/puck/          ├ map      the component, as each environment needs it
integrations/storybook/     ┘
components/content/card/integrations/ register   hand the result to WordPress and Puck
integrations/tests/         check      every component comes through the same way
```

Each component has its own `integrations/` folder that mirrors this one: its `wp/`, `puck/`
and `storybook/` hold that component's half, and the folder of the same name here holds the
half every component shares.

What is in each folder:

```
schema/        what a component's props, parts and presets may declare
  props.ts       prop definitions' shape; PropsOf, defaultsIn(), panelsOf()
  parts.ts       the kinds of part; PartOf, resolveParts()
  presets.ts     a preset's shape; findPreset()
  definition.ts  a component's definition: everything it is, for the translators; defineComponent()
  compositions.ts  the compositions (section colors) any component can offer as a choice
wp/            how WordPress reads them               (the plugins only; not in the npm package)
  attributes.ts       blockAttributes(), ownAttributes()
  inspector.tsx       FieldControl: a prop's field as a sidebar control
  blocks.mapper.ts    parts → core blocks
  register.tsx        registerComponent(): a definition as a block (the WordPress translator)
  icons.ts            every icon a block or preset names
puck/          how Puck reads them                    (shipped with the components' Puck configs)
  config.ts           Puck's config shape, without depending on Puck; puckFields()
  primitives.mapper.ts parts → primitives
  translate.tsx       puckConfig(): a definition as a Puck config (the Puck translator)
  presets.ts          presetFields(), applyPreset(), presetFieldsFor(): a design picker and
                      a field per part, stored as data (the Card)
react/         how a plain React site reads them   (shipped as @ucf/components/react)
  parts.tsx      renderParts(), presetContent(): a preset's parts drawn with the primitives
  with-presets.tsx  withPresets(), presetComponent(): a definition as a component that takes
                    `preset` and `content` (the React translator)
storybook/     how the stories read them              (never shipped)
  arg-types.ts   argTypesOf(): props as story controls
  parts.tsx      renderParts(): parts drawn with the primitives
  contrast.ts    contrast measured in the browser, for checks axe can't make
tests/         run against every component, found by glob (never shipped)
  parity.test.tsx  WordPress and Puck agree: props, labels, defaults, markup
  blocks.test.tsx  every block round-trips through a saved post
  puck.test.tsx    every Puck config fits Puck and keeps its own props out of the markup
  presets.test.tsx every component's presets reach WordPress whole, with icons and valid props
  compositions.test.ts  the compositions are the ones tokens.json defines
  exports.test.ts  every component's entry exports itself, its parts and its presets
  react.test.tsx   every preset renders on a plain React site, from the package entries alone
```

The dependency goes one way: components and primitives import from here; nothing here imports
a component, except the tests, which find them by glob. The mappers and story parts use the
primitives, as the components do.
