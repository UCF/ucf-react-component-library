# Degree profile components: plan

Draft, 2026-11-09. How the components on a degree profile page get their data from the UCF
Search Service, once per page, and share it. The components themselves come later; this covers
the structure they share.

## The problem

The challenge is not sharing one fetch between components. React context or a shared store in
the browser would do that easily. **The challenge is that the fetch has to happen on the server**,
because these are what [architecture.md](architecture.md) calls live content: the data comes from
an API, but the HTML must be on the page before any script runs. Degree pages are some of our
most-searched pages, so a program's facts have to be in the first response search engines get.
WordPress writes a dynamic block's HTML in PHP, which cannot run React, and Next's Server
Components cannot read context at all.

So we fetch on the server, once per page, and pass the result to each component as a plain prop.
Each host does that one fetch its own way, and the components never know which host they are in.

## What the Search Service gives us

The service is public and needs no key. A program is one record at
`https://search.cm.ucf.edu/api/v1/programs/{id}/`, about 38 KB, most of it five descriptions.
That record links to four more endpoints for the same program: `outcomes/` (employment and
earnings by year), `projections/` (job growth), `careers/` and `deadlines/`. **"One call" is
really one call plus up to four**, so the plan is to make each of those calls only when a
component on the page needs it, and never more than once.

A few things about the responses shape the client:

- **Numbers come back as strings.** Tuition is `"212.28"` and the full-time employment rate is
  `"79.00000000"`. The client turns them into numbers once, so no component parses them.
- **Empty means several things.** `careers/` returns `[""]` for Accounting (BSBA), and
  `highlights` and `quotes` are empty arrays. The client turns every form of empty into one.
- **Descriptions are HTML with entities,** in five types (Custom, Catalog, Full Catalog, Source
  Catalog, Source Catalog Curriculum), and none is marked primary. Which one a page shows is a
  decision for us, not something the data settles.
- **The search endpoint ignores parameters it doesn't know.** A misspelled filter returns all
  1,350 programs rather than an error. A component reading one program never needs search, but
  the client must never fall back to it.

## The design

**One data module, shared by every degree component.** A component never imports another, so
what they share goes in `integrations/`, at `integrations/data/search-service/`. It holds our own
`Program` type, a client that is the only code knowing the service's response shape, a sample
record from the live service for stories and tests, and the client's test against a fake `fetch`.
The data is split into the same five resources the service has (the program, outcomes,
projections, careers, deadlines), and every one but the program is optional on `Program`.

**Each component says which resources it reads, and is a pure function of the result.** A
deadlines component declares that it reads `deadlines`, takes `program` as a prop and returns
markup. It has no hooks, no effects and no fetching, which keeps it within the content rule that
a core imports nothing at runtime, so it renders the same on a server, in an editor, in a story
and in a test. When its data is missing, it renders nothing rather than an empty heading.

**Each host loads the resources its page needs, once:**

- **Next.** The page calls `loadProgram( id, needs )` in a Server Component and passes the result
  to each component. A site that loads in more than one place wraps the call in React's
  `cache()`, so a request still reaches the service once. There is no Next adapter, as now.
- **WordPress.** A PHP loader, `ucf_degrees_program( $id, $resource )`, remembers each resource
  for the request and keeps it in a transient between requests (an hour, as a starting estimate).
  Ten blocks on a page then cost one call per resource per hour, not ten per visit. If the
  service is down, the loader serves the last good copy, so a degree page never renders empty.
  Each block's `render.php` asks the loader for what it reads and writes the markup.
- **The block editor.** PHP inlines the loaded program as JSON for the editor scripts, so the
  editor never fetches. Each block is its own script bundle, so a cache in JavaScript would not
  be shared between blocks anyway.
- **Puck.** Each config's `resolveData` calls a loader that keeps one promise per program and
  resource, so every component on the page shares each request. Puck's `metadata` may be a
  cleaner way to hand it down; this is unverified against Puck 0.21.
- **Storybook.** Stories pass the sample record, and a story with each resource removed covers
  the empty state.

**The program ID is a prop,** `programId`, for now. On ucf.edu every degree post already stores
it (`degree_meta.degree_api_id`), so WordPress can default to the current post's ID later without
changing the components.

## The cost: the markup exists twice

In WordPress, PHP writes the HTML, so each component's markup lives in React and in PHP, and the
response handling lives in `client.ts` and the PHP loader. Both copies will drift unless a test
holds them together. **That test comes with the first component, before the second:** it feeds
one raw service response through each side (`client.ts` and the React component, then the PHP
loader and `render.php` with WordPress's functions stubbed) and compares the HTML. It is the
repo's first PHP test, so CI needs PHP, and it closes the "PHP tests" item in [todo.md](todo.md).

We considered two alternatives and rejected both. A static block that saves the program's data
into the post goes stale the first time a deadline changes. Rendering in the browser loses the
HTML.

## Open decisions

- **A bucket for live content.** These blocks are neither `content/` (they have no `save.tsx`)
  nor `interactive/` (they are not built in the browser), and `parity.test.tsx` enforces the
  bucket. We propose a third, `components/live/`, with its own rules: `render.php`, a declared
  list of resources, and the PHP parity test.
- **Which description a page shows,** of the five types, and what happens when that one is empty.
- **Which plugin ships them.** `ucf-degrees` is the likely home.
- **The authored parts of a degree page.** ucf.edu's degree posts also carry content editors
  write and the service doesn't have, such as the skills and career lists. Whether those become
  props on these components or stay with the theme is a decision for each component.

## What comes next

When the component list arrives, we build the data module and the component that reads the most
resources first, since it tests the `Program` type and the parity test hardest. After that,
[architecture.md](architecture.md) and [todo.md](todo.md) are updated to describe live content
as built, and this plan is retired.
