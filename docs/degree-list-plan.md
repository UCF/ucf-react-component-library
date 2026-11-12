# Degree List: plan

Draft, 2026-11-09. The first degree component: a list of programs from the UCF Search Service,
filtered by college, department and program type, linking to each program's profile page.

## What it is, and what it waits on

The Degree List is a live component (see [component-buckets.md](component-buckets.md)): an
editor places it and picks its filters, the server fetches the programs, and the list is in the
HTML for every crawler. Unlike the degree profile blocks, it is used on many sites (a college
site lists its own degrees), so it belongs in this library, with its markup in React and in PHP
and a test comparing the two.

**That pattern already exists on Darren's `event-component` branch,** with the Event List as its
example: the `components/live/` bucket, the PHP parity test harness, the scaffold and the UCF Live
inserter category. We build on it once it reaches `main`, not before, so the two don't diverge.

| Decided | Value                                                                                               |
| ------- | --------------------------------------------------------------------------------------------------- |
| Block   | `ucf-degrees/degree-list`, in the `ucf-degrees` plugin                                              |
| Folder  | `components/live/degree-list`                                                                       |
| Package | `@ucf/components/degree-list`                                                                       |
| Data    | The Search Service, never ucf.edu's own degree feed                                                 |
| Basis   | `[degree-list]` (UCF-Degree-CPT-Plugin) and `[ucf-external-degree-list]` (UCF-Degree-Search-Plugin) |

## What the Search Service gives us

The list is not built from `/api/v1/programs/`, which ignores every filter. **It reads
`/api/v1/programs/search/`,** which filters on the server:

- **`college_slug`** and **`department_slug`**, repeated for "any of"
  (`college_slug=miller-college-of-business&college_slug=sciences`). The slugs come from
  `/api/v1/colleges/` and `/api/v1/departments/`; they are not the names (Sciences is `sciences`).
- **`level`**, as an ID: 1 Bachelors, 2 Masters, 3 Certificate, 4 Doctoral, 5 Specialist,
  6 Professional, 7 Minor. `career` is 1 Undergraduate, 2 Graduate, 3 Professional.
- **`active`** and **`subplan_code__isnull`**, which together decide which programs show (below).

A wrong value comes back as an error (`"Select a valid choice"`), but a misspelled parameter name
is ignored and returns all 1,350 programs. **The client therefore builds its query only from the
names above, never from editor input.** A page holds at most 50 programs, so the client reads
every page: an entire college is two requests, every program twelve.

Each program gives us what the list shows: `name` ("Accounting (BSBA)") and
`primary_profile_url`, which every program has.

## Which programs appear

**`active` decides whether a program is shown;** the list adds `active=True` to every request.
`valid` is an internal flag marking programs to investigate, and has no bearing on display. The
first pass also leaves out tracks (`subplan_code__isnull=True`), so a list shows each program
once. Together that is 593 programs today, against the 589 top-level programs ucf.edu publishes.

## The first pass

An unordered list of program names, each linking to its profile, sorted by name. Its props,
following the shortcodes' attributes:

- **Colleges, departments and program types,** each any number of choices, stored as the
  service's slugs (`colleges: [ 'sciences' ]`). With none chosen, the list shows every program.
- **Heading,** optional, as the shortcode's `title`.
- **Columns:** one, two or three, collapsing to one on a phone. This replaces the shortcode's
  `classic` and `twocol` layouts.
- **Empty message,** for a filter that matches nothing: "No programs found."

The markup is a heading and a `<ul>` of links, as the Event List's is. The files follow the Event
List one for one: the React core, its props, `client.ts` and `sample-data.ts`, the PHP
`client.php`, `markup.php` and `render.php`, an editor preview that fetches in the browser, a
Puck config, stories, and the parity test on a saved Search Service response.

### Picking colleges, departments and program types

**The choices come from the Search Service, not from a list in our code.** Colleges (12) come
from `/api/v1/colleges/` and departments (113) from `/api/v1/departments/`, so a new department
appears in every editor with no release. Program types have no endpoint of their own, so their
seven options are written into the props with the service's own labels (Bachelors, Masters,
Certificate, Doctoral, Specialist, Professional, Minor), each mapped to its `level` ID.

Each host shows these differently:

- **WordPress:** core's `FormTokenField`, the built-in select2-style field. An editor types part of
  a name, picks from the suggestions, and each choice becomes a removable token. The suggestions
  load from the service when the block is selected.
- **Puck:** Puck has no built-in multi-select. Its `custom` field type renders any React control,
  so the same kind of token field can be written once for Puck. This is unverified against Puck
  0.21 and needs a quick test before we rely on it.
- **React sites:** an array of slugs (`<DegreeList colleges={ [ 'sciences' ] } />`). Whoever uses
  the component directly hard-codes the list or sets it from another component, so it needs no
  picker.

None of this exists in the props schema yet, which offers text and single choices only. **We add
one new prop type, a list of slugs with its options loaded from a source,** to
`integrations/schema/`, and teach each host to show it: an `array` attribute in block.json, the
token field in WordPress, the custom field in Puck, and a text control of comma-separated slugs in
Storybook. Any later component that filters by college reuses it.

A saved block holds slugs, so a slug the service later renames or removes would quietly stop
matching. The editor should flag a saved slug the service no longer lists, rather than drop it.

### The same rule in both languages

Two details need the same rule in both languages, written out rather than left to each one's
library:

- **Sorting.** JavaScript's `localeCompare` and PHP's `strcmp` order names differently ("Art" and
  "art", accented letters). We sort with one rule, implemented in both, and the parity test uses
  names that would expose a difference.
- **Caching.** One cached copy per set of filters, an hour by default, and a failed request cached
  for 5 minutes, as the Event List does. Unlike the Event List, a failure serves the last good
  list rather than an empty one, so a Search Service outage doesn't empty a college's degree page.
  That should become the rule for every live component.

## Later

Grouping by program type under headings (both shortcodes' `groupby`), tracks under their parent
program, a limit, and an online-only filter (`online=True`) are each a prop added to the same
component, not a new one.

## Open questions

- **Puck's multi-select.** Whether a `custom` field in Puck 0.21 can hold an array and load its
  options asynchronously. A short spike answers it.

## What comes next

When `event-component` is on `main`, we merge `main` into this branch and build in this order: the
list prop type in `integrations/schema/` with its WordPress token field, then the Degree List
itself (scaffolded with `npm run new:component -- --kind live`, tested against a saved Search
Service response), then its Puck field once the spike settles how. The prop names (`colleges`,
`departments`, `programTypes`, `title`, `columns`, `emptyMessage`) are permanent once a site saves
the block, so they are worth a last look before the first release.
