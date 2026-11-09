# Create your first component

This guide has three parts:

1. **[How the Card is built](#part-1-how-the-card-is-built):** a tour of the Card, the most
   complete content component, one file at a time, in the order you'd write them.
2. **[How the Degree Finder works](#part-2-how-the-degree-finder-works):** an interactive
   component, built in the browser, fetching its data from an API.
3. **[Make your own](#part-3-make-your-own):** start a component with one command, fill in the
   same files, and get it into WordPress.

Before you start, follow "Quick start" in the [README](../README.md) and run
`npm run storybook`. Open **Content (Server) → Card** to see what you're about to read.

---

## Part 1: How the Card is built

The Card is a box with content inside: a news story, a "next step" with a button, a photo tile,
a pathway card. One component covers all of them, as five **presets** (starting designs).

Everything about it is in one folder:

```
components/content/card/
  Card.props.ts            the settings an editor can change
  Card.parts.ts            the pieces of content that go inside
  Card.presets.ts          its five designs
  Card.tsx                 the markup
  style.css                how it looks
  index.ts                 what the npm package exports
  README.md                notes on why it's built this way
  integrations/wp/         the WordPress block
  integrations/puck/       the Puck config
  integrations/storybook/  its stories
  tests/                   its markup test
```

### 1. Its kind and name

Every component is one of four kinds. The kind decides which rules apply.

| Kind            | Its HTML                                               | Examples              |
| --------------- | ------------------------------------------------------ | --------------------- |
| **Content**     | Saved in the post; works without JavaScript            | Card, Highlight, Hero |
| **Live**        | Fetched and written by the server on each page request | Event List            |
| **Interactive** | Built in the browser by JavaScript                     | Degree Finder         |
| **Primitive**   | A small piece other components are built of            | Button, Image         |

A card is something people read, so it's **content**. Its React code may only turn props into
markup: no state, no effects, no fetching. WordPress saves that markup into every post that
uses the block.

The name is spelled the same way everywhere: folder `card`, React `Card`, CSS `ucf-c-card`,
WordPress block `ucf-content/card`. **The block name is permanent once a site uses it,**
because WordPress stores it in every post.

### 2. Its settings: `Card.props.ts`

A **prop** is a setting an editor can change. Here is one of the Card's:

```ts
/** Plain, boxed, or ruled under a heavy top rule. */
variant: {
	type: 'choice',
	label: 'Look',
	panel: 'Card',
	control: 'radio',
	options: [
		{ value: 'plain', label: 'Plain' },
		{ value: 'boxed', label: 'Boxed' },
		{ value: 'ruled', label: 'Ruled' },
	],
	default: 'plain',
},
```

That one definition becomes:

- the **Look** radio buttons in the WordPress sidebar, in a panel called "Card";
- the same field in Puck;
- a control in Storybook;
- the `variant` attribute in `integrations/wp/block.json`, written for you by
  `npm run sync:blocks`.

Props are `choice`, `text` or `number`. The Card's `imageId` has `hosts: [ 'wp' ]`: it's the
media library's ID, which only WordPress has, so Puck doesn't show it.

**A prop's key is saved in every post,** like the block name. Pick keys you're happy to keep.

### 3. What goes inside: `Card.parts.ts`

A **part** is one piece of content inside the Card, with the class that styles it:

```ts
/** A short line in the accent above the title: "First-year". */
eyebrow: { kind: 'text', className: 'ucf-c-card__eyebrow' },
/** The title, sans bold. */
title: { kind: 'heading', className: 'ucf-c-card__title' },
/** One or two sentences. */
description: { kind: 'text', className: 'ucf-c-card__description' },
/** A call to action. */
button: { kind: 'button' },
```

`kind` says what the part is: `text`, `heading`, `image`, `link` or `button`. Each host turns
it into its own piece: a core Paragraph block in WordPress, the Paragraph primitive in Puck. A
button needs no class, because the Button styles itself.

Parts are where a Card starts, not a lock. Editors can change, move or remove anything inside.

### 4. Its designs: `Card.presets.ts`

A **preset** is a starting design: some props, plus some parts with sample text. This is the
"Next step" card:

```ts
{
	name: 'next-step',
	title: 'Card: Next step',
	description: 'A boxed title, a sentence and one button.',
	wpIcon: 'button',
	props: { variant: 'boxed' },
	parts: [
		{ part: 'title', level: 3, text: 'Next step' },
		{
			part: 'description',
			text: 'One application covers every undergraduate program, and you can save and come back.',
		},
		{ part: 'button', text: 'Start your application', url: '#' },
	],
},
```

Each preset shows up as **Card: Next step** in the WordPress inserter and in Puck's Design
picker. `DEFAULT_PRESET` is what a plain "Card" starts as (the Story card).

`wpIcon` must be one of the icons listed in `integrations/wp/icons.ts`. The `as const` at the
end of the list keeps the names exact, so TypeScript can check `preset="next-step"` (below).

### 5. The markup: `Card.tsx`

`CardMarkup` turns the props into HTML. Shortened:

```tsx
function CardMarkup( {
	variant = PROPS.variant.default,
	contentAlign = PROPS.contentAlign.default,
	children,
	className,
	area,
	...props
}: FrameProps< typeof PROPS > ) {
	return (
		<div
			{ ...props }
			className={ [ className, 'ucf-c', 'ucf-c-card' ]
				.filter( Boolean )
				.join( ' ' ) }
			data-variant={ variant }
			data-align={ contentAlign === 'start' ? undefined : contentAlign }
		>
			{ area(
				'content',
				{ className: 'ucf-c-card__content' },
				children
			) }
		</div>
	);
}
```

What to notice:

- **`area( 'content', … )` is where the parts go.** On a React site it's a `<div>`. In WordPress
  it's the block's inner blocks; in Puck it's a slot. The markup is the same in every host.
- **Settings become `data-` attributes** (`data-variant="boxed"`), and `style.css` styles them.
  A default value writes no attribute, which keeps saved markup small.
- **`ucf-c` on the outer element** lets the Card take its colors from the section it sits in.
- **No hooks.** WordPress renders this once and saves the result, so it must give the same HTML
  every time.

At the bottom, `frame()` turns the markup into the component every host uses:

```tsx
const Card = frame( CardMarkup, {
	slug: 'card',
	title: 'Card',
	kind: 'content',
	props: PROPS,
	parts: PARTS,
	presets: PRESETS,
	defaultPreset: DEFAULT_PRESET,
	wpIcon: 'postFeaturedImage',
} );
```

### 6. How it looks: `style.css`

```css
.ucf-c-card[data-variant='boxed'] {
	background-color: var( --ucf-c-raised );
}

.ucf-c-card .ucf-c-card__eyebrow {
	color: var( --ucf-c-accent-text );
	font-size: var( --ucf-font-size-data );
	font-weight: 700;
}
```

The rules every component follows:

- **Colors only as `var(--ucf-c-{role})`:** `body`, `accent`, `muted`, `raised` and the rest.
  Never a hex value. The section decides what each role is, so the same eyebrow is gold on a
  light section and black on Bold Gold, with no extra CSS.
- **Sizes and spacing from tokens:** `--ucf-font-size-*`, `--ucf-spacing-*`.
- **Style a part with two classes** (`.ucf-c-card .ucf-c-card__eyebrow`), so the rule wins
  over the paragraph's own styles.

### 7. Where it runs: `integrations/`

Each host gets a short adapter. They're one line each, because the shared code in the top-level
`integrations/` folder reads everything from the Card itself.

| File                                 | What it does                                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `wp/block.json`                      | The block's name, title, category and attributes                                               |
| `wp/index.tsx`                       | Registers the block, with its presets as variations                                            |
| `wp/edit.tsx`                        | `blockEdit( Card )`: the editor view and sidebar                                               |
| `wp/save.tsx`                        | `blockSave( Card )`: the HTML WordPress stores                                                 |
| `puck/config.tsx`                    | `puckConfig( Card )`: the Puck config, plus `withPreset()`                                     |
| `storybook/Card.stories.tsx`         | **Card/Props:** every setting as a control                                                     |
| `storybook/Card.presets.stories.tsx` | **Card/Presets:** each design                                                                  |
| `storybook/Card.checks.stories.tsx`  | **Card/Checks:** what the accessibility checker can't measure, like text contrast over a photo |

### 8. How it's tested: `tests/Card.test.tsx`

The Card's own test renders it in each preset, checks that WordPress and React produce the same
HTML, and records that HTML as a **snapshot** in `tests/__snapshots__/`. It also checks that
every part class in `Card.parts.ts` has a rule in `style.css`.

Shared tests in `integrations/tests/` cover every component without any setup. They check that:

- **the block saves and reads back cleanly,** the way the editor checks a saved post;
- **WordPress and Puck have the same settings,** with the same defaults;
- **every preset reaches both editors** and names an icon that exists;
- **every color role the CSS reads exists,** and every role pair passes contrast;
- **every story passes accessibility checks** on all five section colors at three widths.

### 9. How sites use it

On a React site, a preset plus content:

```tsx
import { Card } from '@ucf/components/card';
import '@ucf/components/ucf.css';

<Card
	preset="next-step"
	content={ {
		title: 'Next step',
		description: 'One application covers every undergraduate program.',
		button: { text: 'Start your application', url: '/apply' },
	} }
/>;
```

TypeScript knows each preset's parts, so a part the Next step card doesn't have is an error.
In Puck, register `@ucf/components/card/puck`. In WordPress, editors insert it from the
**UCF Content** category.

---

## Part 2: How the Degree Finder works

The Card is **content**: its HTML is saved in the post. The Degree Finder is **interactive**: a
visitor picks a degree type, then some interests, and it fetches the matching degrees from
ucf.edu and shows them. That can only happen in the browser, so the rules flip:

|                     | Content (the Card)                       | Interactive (the Degree Finder)                          |
| ------------------- | ---------------------------------------- | -------------------------------------------------------- |
| Its HTML            | Saved in the post                        | Built in the browser                                     |
| Its React code may  | Turn props into markup, nothing else     | Hold state, run effects, fetch data                      |
| WordPress block     | `save.tsx` stores the HTML               | `render.php` writes a container; `view.tsx` mounts React |
| Changing its markup | Breaks saved posts without a deprecation | Free: nothing is saved                                   |
| Storybook group     | Content (Server)                         | Interactive (Client)                                     |

Open **Interactive (Client) → Degree Finder** in Storybook and try it: choose Bachelors, then
type "computer" or "psych".

```
components/interactive/degree-finder/
  DegreeFinder.tsx          the component: its steps and its state
  steps/                    one file per step: degree type, interests, results
  parts/                    the pieces the steps use: cards, the combobox, the progress bar
  types.ts                  the shapes it works with: ProgramType, Interest, Degree
  client.ts                 the only file that talks to the API
  sample-client.ts          the same interface, answering from sample-data.ts, no network
  defaults.ts               its default settings, read by every host
  style.css                 how it looks
  integrations/wp/          block.json, render.php, view.tsx, edit.tsx, settings.ts
  integrations/puck/        the Puck config
  integrations/storybook/   its stories
  tests/                    the client's tests
```

### How a page loads it in WordPress

```
1. PHP, on each request   render.php writes <div data-ucf-degree-finder='{"searchUrl":…}'>
                          with a plain "Explore our Programs" link inside
2. Browser, on load       view.tsx finds each container, reads its settings,
                          and mounts <DegreeFinder> into it (replacing the link)
3. Browser, as they click DegreeFinder asks client.ts for data;
                          client.ts calls the ucf.edu REST API
```

Search engines and visitors without JavaScript get the link from step 1. Everyone else gets the
finder.

### 1. The component: `DegreeFinder.tsx`

It starts with `'use client';`, which tells Next to run it in the browser. Its props are its
settings:

```tsx
export interface DegreeFinderProps {
	/** The WordPress REST API root that serves degree data. */
	apiRoot?: string;
	/** The degree search page that "Explore our Programs" links to. */
	searchUrl?: string;
	/** The choices on the first step. Defaults to Bachelors, Masters and Doctorates. */
	programTypes?: readonly ProgramTypeOption[];
	/** A program type slug, such as "master", when the page already answers the first question. */
	programType?: string;
	/** Replaces the data client, e.g. with sample data in a preview or story. */
	client?: DegreeClient;
}
```

Inside, it's ordinary React: `useState` for the current step, the chosen type and the chosen
interests, and a small hook, `useRequest` (`utils/useRequest.ts`), for each fetch. A request
runs in an effect, is cancelled if the visitor changes their answer, and reports `loading`,
`success` or `error`, which the steps show.

On a masters page, an editor sets `programType: 'master'`, and the finder skips the first step.

### 2. Its data: `types.ts`, `client.ts` and `sample-client.ts`

The component never sees the API's raw responses. `types.ts` defines its own shapes, and the
interface any data source must provide:

```ts
export interface DegreeClient {
	getProgramTypes: ( options?: RequestOptions ) => Promise< ProgramType[] >;
	getInterests: (
		programType: string,
		options?: RequestOptions
	) => Promise< Interest[] >;
	getDegrees: (
		programType: string,
		interests: string[],
		options?: RequestOptions
	) => Promise< Degree[] >;
}
```

- **`client.ts`** is the only file that knows the API. It calls ucf.edu's REST API
  (`ucf-degree-search/v1/program-types`, `…/interests/` and `wp/v2/degrees`), follows every page
  of results, decodes HTML entities in titles, and returns the shapes above. If the data moves
  to another service, this file changes and nothing else does.
- **`sample-client.ts`** answers the same three calls from `sample-data.ts`, with no network.
  It can be slowed down to show loading states, or set to fail to show the error state.

The component takes a `client` prop and falls back to `createClient()`. That prop is how
stories and tests swap in sample data, and how a host could pass its own client.

### 3. Its settings: `defaults.ts` and the plugin

`defaults.ts` holds the defaults every host reads: the API root, the search page and the three
degree types. A site can override them without touching the component. The `ucf-degrees`
plugin has a filter for that:

```php
// plugins/ucf-degrees/ucf-degrees.php
function ucf_degrees_degree_finder_settings() {
	return apply_filters(
		'ucf_degrees_degree_finder_settings',
		array( 'searchUrl' => 'https://www.ucf.edu/degree-search/' )
	);
}
```

`render.php` reads it for the page, and the plugin hands the same settings to the editor as
`window.ucfDegreeFinderSettings`, so the editor preview and the page match.

### 4. The WordPress block: `integrations/wp/`

`block.json` makes it a dynamic block. Two lines do it:

```json
"viewScript": "file:./view.tsx",
"render": "file:./render.php"
```

Its one attribute is `programType`. `index.tsx` registers the block with `save: () => null`:
the post stores only that attribute, never HTML, so a later change to the component can't
break a saved block.

**`render.php`** writes the container, carrying the settings as JSON, with a link inside for
visitors without JavaScript. Shortened:

```php
$ucf_degrees_wrapper = get_block_wrapper_attributes(
	array( 'data-ucf-degree-finder' => wp_json_encode( $ucf_degrees_settings ) )
);
?>
<div <?php echo $ucf_degrees_wrapper; ?>>
	<p><a href="<?php echo esc_url( $ucf_degrees_settings['searchUrl'] ); ?>">Explore our Programs</a></p>
</div>
```

**`view.tsx`** runs in the browser. It finds every container and mounts the finder:

```tsx
document
	.querySelectorAll< HTMLElement >( '[data-ucf-degree-finder]' )
	.forEach( ( container ) => {
		const settings = readSettings( container.dataset.ucfDegreeFinder );
		createRoot( container ).render( <DegreeFinder { ...settings } /> );
	} );
```

`createRoot` comes from `@wordpress/element`, WordPress's copy of React, so a page loads React
once however many blocks use it. `settings.ts` reads the JSON safely: bad JSON falls back to
the defaults instead of breaking the page.

**`edit.tsx`** shows the real, working finder in the editor, with a sidebar control for the
degree type. It stops clicks on result links, so trying the finder doesn't navigate away from
the editor.

### 5. Puck and React sites

Next, Puck and other React sites render the component directly; there's no container step:

```tsx
import { DegreeFinder } from '@ucf/components/degree-finder';

<DegreeFinder programType="master" />;
```

The Puck config (`integrations/puck/config.tsx`) is a plain object with one field, the degree
type. The API root and search page are site settings, not something an editor picks per page.

Unlike the Card, the Degree Finder isn't built with `frame()` and has no `.props.ts` file.
Its `block.json` attribute and its Puck field are written by hand, and
`integrations/tests/parity.test.tsx` checks they name the same props.

### 6. Stories and tests

The stories use the sample client, so they work offline and look the same on every run:

| Story           | Shows                                                          |
| --------------- | -------------------------------------------------------------- |
| **Default**     | The full finder, starting at degree type                       |
| **PresetType**  | `programType: 'master'`: it starts at interests                |
| **ServiceDown** | A client set to fail: the error state                          |
| **LiveData**    | The real ucf.edu API. Tagged `!test`, so the test run skips it |

`tests/client.test.ts` checks `client.ts` against a fake `fetch`: which URLs it calls, that it
follows every page of results, and that a failed request throws. Nothing here needs the real
API. There's no markup snapshot, because nothing is saved. Keyboard and screen-reader behavior
isn't tested automatically yet (see [todo.md](todo.md)).

---

## Part 3: Make your own

### 1. Decide its kind and name

Use the table in Part 1, step 1. Content components are named for what a reader sees, as a
plain noun (Card, Quote), and so are live ones (Event List). Interactive ones are named for the subject and task (Degree Finder,
Tuition Calculator). Settle the name before anything is deployed: it's permanent.

### 2. Create it

```sh
npm run new:component -- my-component --kind content --plugin ucf-content
```

`--plugin` is the WordPress plugin that ships the block: `ucf-content` for general content,
`ucf-degrees` for degree blocks. You'll see:

```
Created components/content/my-component/ (13 files).
Added it to:
  package.json
  integrations/tests/parity.test.tsx
  plugins/ucf-content/plugin.json
  integrations/tests/blocks.test.tsx
  integrations/tests/puck.test.tsx
```

You now have the Card's files with placeholders in them: one setting (alignment), two parts (a
title and a sentence) and one preset. It already passes every check. Find it in Storybook under
**Content (Server)**.

### 3. Fill it in, as the Card does

Work through the files in the order of Part 1:

1. **`{Name}.props.ts`:** add its settings (step 2). Then run `npm run sync:blocks` to write
   them into `block.json`.
2. **`{Name}.parts.ts`:** replace the placeholder parts (step 3).
3. **`{Name}.presets.ts`:** write its designs (step 4). If a `wpIcon` isn't in
   `integrations/wp/icons.ts` yet, add it to both lists there. Any name from
   `@wordpress/icons` works.
4. **`{Name}.tsx`:** write the markup, with each setting as a `data-` attribute (step 5).
5. **`style.css`:** style it with roles and tokens only (step 6).

Keep Storybook open as you go, and use the **Composition** menu to check every section color.

### 4. Test it

```sh
npm test
```

The first run writes your component's snapshots. Open them and read them: **this is the HTML
every saved post will contain.** Before the first release that's free to change. After it,
changing the markup is a breaking change (see "Changing a content component's markup" in
[architecture.md](architecture.md)).

**Prove the test works:** change a class name in your markup, run `npm test`, and watch it fail
on the snapshot. Change it back.

Then run the accessibility checks in a real browser:

```sh
npx playwright install chromium   # once
npm run test:stories
```

### 5. Try it in WordPress

Tell the repo where your local WordPress is, once:

```sh
cp .env.example .env    # set WP_PLUGINS_DIR to your wp-content/plugins folder
npm run deploy          # or `npm run deploy:watch` to redeploy on every save
```

Activate **UCF Content Blocks**, edit a page, and insert your block from the **UCF Content**
category. Your presets are listed there too.

**Check the block in the editor, not on the front end.** A broken block still shows on the
front end. In the editor's browser console:

```js
wp.data.select( 'core/block-editor' ).getBlocks();
```

Your block should have `isValid: true`. Save, reload the editor, and watch the console: an
"Updated Block" message means the saved markup no longer matches.

### 6. Before you commit

```sh
npm run check          # tests, typecheck, all three linters, formatting
npm run test:stories   # when markup, CSS or a story changed
```

Both must be clean. CI runs the same checks on your pull request.

### Other kinds

The same command starts the other kinds:

- **Live** (`--kind live`, with the plugin for its data, such as `ucf-events`): you get
  `client.ts` and its PHP copy `integrations/wp/client.php`, the markup again as a template in
  `integrations/wp/render.php`, and `tests/{Name}.php.test.tsx`, which fails while the PHP and
  React markup differ. Replace the placeholder feed, save a copy of the real one in
  `tests/fixtures/`, and follow `components/live/event-list`. A new plugin's PHP prefix and text
  domain go in `phpcs.xml.dist`. Like interactive, it has no parts or presets.
- **Interactive** (`--kind interactive`): you get `render.php`, `view.tsx`, `settings.ts` and
  `defaults.ts`, with a click counter as a placeholder. Replace the counter with your component,
  and if it fetches data, add `types.ts`, `client.ts`, `sample-client.ts` and a client test, as
  Part 2 describes. The step 3 file list above doesn't apply: an interactive component has no
  parts or presets.
- **Primitive** (`--kind primitive`): a piece other components use, like the Button. It has no
  WordPress block of its own, because WordPress editors use the core block instead. Name its
  props after the core block's settings.

### Changing it later

| To…                                | Edit                                                                                   | Then                     |
| ---------------------------------- | -------------------------------------------------------------------------------------- | ------------------------ |
| Add a setting                      | `{Name}.props.ts`, then use it in `{Name}.tsx` and `style.css`                         | `npm run sync:blocks`    |
| Change a label, help text or panel | `{Name}.props.ts` only                                                                 |                          |
| Change a default                   | `{Name}.props.ts`. Saved blocks that never set it take the new default                 | `npm run sync:blocks`    |
| Add a design                       | `{Name}.presets.ts`, a story for it, and its icon in `integrations/wp/icons.ts` if new | `npm test`               |
| Change what a new one starts with  | `DEFAULT_PRESET` in `{Name}.presets.ts`                                                |                          |
| Add a part                         | `{Name}.parts.ts`, and its class's rule in `style.css`                                 | `npm test`               |
| Rename it on screen                | `title` in `{Name}.tsx` and `block.json`, and the story titles                         | `npm test`               |
| Change the markup                  | `{Name}.tsx`, following "Changing a content component's markup" in architecture.md     | Review the new snapshots |

### If a check fails

| Failure                                                      | Fix                                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `block.json declares exactly its props` in `parity.test.tsx` | Run `npm run sync:blocks`                                                  |
| `styles every part class`                                    | Add a rule to `style.css` for each class in `{Name}.parts.ts`              |
| `names an icon WordPress has` in `presets.test.tsx`          | Add the icon to `integrations/wp/icons.ts`                                 |
| `reads --ucf-…, a defined role` in `scripts/tokens.test.mjs` | Use a role from `tokens/tokens.json`, such as `--ucf-c-body`               |
| A snapshot differs                                           | If you meant to change the markup, read the diff, then `npx vitest run -u` |
| A story fails on one section color                           | Usually contrast: use a role, not a fixed color                            |
