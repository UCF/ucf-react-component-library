# Component buckets

Draft, 2026-11-09. The three kinds of component we build, what puts a component in each, how each
is built, and where it lives.

## The question that sorts them

What sorts a component is not whether visitors click it or whether it reads an API. It is
**where and when its HTML is made.** An author makes it when they save the post, the server makes
it on each request, or the browser makes it after a visitor acts. Everything else follows from
that: whether search engines read it, what may change it, how it fails, and what it costs to
change its markup later.

| Bucket       | HTML is made          | With JavaScript off  | Example                              |
| ------------ | --------------------- | -------------------- | ------------------------------------ |
| Content      | By the author, saved  | Everything is there  | Highlight, Card, Section, an FAQ     |
| Live content | By the server, served | Everything is there  | Tuition, deadlines, program outcomes |
| Interactive  | By the browser        | A fallback and links | Degree Finder, a tuition calculator  |

The middle column is the test that matters. Most AI crawlers (ChatGPT's, Claude's, Perplexity's)
read only the HTML the server sends and never run JavaScript, and link previews don't either.
Google and Bing do render it, but their AI answers rest on the same indexing. So what a component
shows with JavaScript turned off is what every search engine and AI tool can read and quote,
whatever their rendering turns out to be ([our checklist](https://claude.ai/artifact/Vhn4KYcX1cUiv2w4Y96kbh)).

A second question is separate from the first: **how many sites use the component.** A Card is
used on every UCF site; the tuition block exists on one. The bucket says how a component is built,
and its reach says where its code lives.

## What every bucket owes a crawler

- **Semantic markup.** Real `<table>`, `<ul>`, `<dl>`, `<a href>` and heading elements, with
  descriptive link text. A deadline list is a list and a rate comparison is a table, not styled
  `<div>`s.
- **Nothing that appears only on a click or a scroll.** Text behind a tab, an accordion or "read
  more" is in the HTML and hidden with CSS; it is never fetched when opened, and nothing a crawler
  should read is lazy-loaded.
- **Checked with JavaScript off.** Before a component ships, we view its page's source (or `curl`
  it) and confirm what it shows is there. Its tests should make the same check.

Each bucket meets these differently; that is most of what follows.

## Content

A content component's HTML is complete when the author saves. In WordPress it has a `save()`
function, the post stores its markup, and nothing about it changes between visits. Everything it
shows is something an author typed or chose.

- **What puts a component here:** everything it shows comes from the author, and it would render
  the same HTML for every visitor on every day.
- **Behavior on top is allowed.** An accordion, tabs or a carousel stay here: their text is all in
  the HTML, hidden with CSS, and a small script only shows and hides it. A panel that fetches its
  text when opened is not content.
- **Its markup is frozen once a site uses it.** Every saved post holds a copy, so a change needs a
  block deprecation.
- **When something fails:** nothing can, since there is nothing to fetch.

How we build them is already settled: in this library, under `components/content/`, built with
`frame()`, shipped to WordPress as static blocks and to React sites as the npm package (see
[architecture.md](architecture.md)). The static blocks on degree pages are this bucket, built in
their own process. On a React site, a content component only keeps its promise if the site sends
its HTML in the first response: a Next site that streams pages should check that its bot
detection covers AI crawlers, or they get an empty shell.

## Live content

A live content component shows data the author doesn't type, but its HTML is still complete
before any script runs, because the server makes it on each request. **It is content we want
search engines, link previews and AI assistants to read,** which is why the server makes it and
the browser does not. The author places it and sets a few options. The data fills it.

- **What puts a component here:** what it shows comes from outside the post (the Search Service,
  or WordPress's own data, like the current degree's college), and it would render the same HTML
  for every visitor at a given moment.
- **The page fetches once.** A single loader gets the record (one program, for a degree page),
  caches it for a short window, and hands the same record to every block on the page. Ten blocks
  cost one request.
- **When the source is down, the page shows the last good copy.** The loader keeps the last good
  response, so a Search Service outage doesn't empty a degree page.
- **Freshness is the cache window,** plus any page cache in front of the site. That is minutes,
  not the days an import can take, but it is not instant.
- **The page's structured data comes from the same record.** A degree page's JSON-LD (schema.org's
  `EducationalOccupationalProgram`, with its tuition and deadlines) is written by the server from
  the record the blocks read, so it is in the first response and always matches what the page
  shows. It is never added by a script after load.
- **It avoids "today."** A cached page freezes the moment it was made, so these components show
  dates as they are ("Fall: May 1") and leave "the next deadline" to a script.
- **Behavior on top is allowed,** under the same rule as content: a toggle between in-state and
  out-of-state rates can show and hide what the server already wrote. In WordPress that is the
  Interactivity API, which adds behavior to PHP's markup without a second copy in React.
- **Its markup can change freely.** Nothing is stored in the post but its options, so changing
  its markup needs no deprecation.

**How we build them depends on their reach.** A single-site component, which every degree
component is, is a plain WordPress dynamic block. Its markup is written once, in PHP
(`render.php`). Its editor preview is the server's own render, so there is no editor-only version
to keep in step. It lives in the plugin or theme that owns the data it reads: for degree pages,
whatever owns the degree post type today. It loads this library's stylesheet and reads its tokens
and color roles, so it matches the content blocks around it on every section color. Each block
gets a PHP test of its output against a saved Search Service response.

A live content component used on many sites, which we don't have yet, would belong in this
library. It would need its markup in React for the other hosts and in PHP for WordPress, with a
test comparing the two. We should take on that cost only when a second site needs one.

## Interactive

An interactive component's HTML is built in the browser, because what it shows depends on what a
visitor does. It organizes or repeats content that lives elsewhere (programs, events, news) and
presents it in response to a choice. Most AI crawlers will never see what it builds, since they
don't run its script. **That is acceptable only because the content it shows is indexed where it
lives:** each degree on its own profile page, in a content or live content component. If the
content has no other home, it doesn't belong in this bucket.

- **What puts a component here:** the browser has to fetch or compute what it shows, from a
  visitor's choice. Per-visitor content (logged in, location, an A/B test) belongs here too,
  even without a click, since a cached page can't hold it.
- **It still writes a fallback.** The server writes a container with a plain summary and real
  `<a href>` links for crawlers and visitors without JavaScript ("Explore our Programs"), so a
  crawler can follow it to the pages that hold the content.
- **When the source is down, it says so.** It shows an error with a way to retry or a link
  elsewhere, not an empty box.
- **Its markup can change freely,** since nothing is saved.

These live in this library under `components/interactive/`: written in React, holding their own
state and data client, shipped to WordPress as a block whose `render.php` writes the container and
whose `view.tsx` mounts the component, and to React sites as the npm package. The Degree Finder is
the example. A single-site interactive component could live with its site instead, but the library
gives it stories, accessibility checks and the same build, so we should default to here.

## Examples

### One subject, three buckets

The subject doesn't pick the bucket; the design does. Tuition can land in any of the three, and
only one of them is right for a degree page's rates.

- **Content: an author types "$212.28 per credit hour" into a Highlight.** It renders and is
  crawled, but it is wrong the day the rate changes, and nothing tells anyone. Data that has a
  source of record should not be typed into a content block.
- **Live content: the Tuition block.** The server reads the program's rates from the Search
  Service and writes them into the page. It is crawled, always current within the cache window,
  and the right choice for the rates themselves.
- **Interactive: a tuition calculator.** A visitor enters their credit hours and residency, and
  the browser works out a semester's cost from the same rates. Crawlers never see the totals, and
  don't need to: the rates it multiplies are already on the page in the Tuition block.

### Content

- **Highlight.** "Florida's largest university," written by an author on a Bold Gold section.
  Built with `frame()` in this library; `save()` stores its markup in the post. Every visitor gets
  identical HTML, and nothing about it can fail.
- **FAQ accordion.** Each question is a `<button>` or `<summary>`, and each answer is in the HTML
  and hidden with CSS. A small view script only opens and closes panels. If the answers were
  fetched when a panel opened, it would stop being content and crawlers would lose every answer.
- **A site-wide call to action.** A "Visit campus" block edited once and shown on fifty pages is
  still content, kept in a synced pattern. Being shared across pages doesn't make data live.

### Live content

Each of these is a `render.php` in the degree plugin, reading the page's one cached program
record.

- **Tuition.** Shows in-state and out-of-state rates when they differ, one rate when they match,
  and nothing when the program has none (293 of 1,350 programs, mostly certificates). The unit
  comes from the data: "per credit hour" for nearly every program, "per year" for the two with
  annual rates (the MD and Data Analytics MS). The markup is a `<dl>`, each rate a term and its
  value:

    ```html
    <dl class="ucf-c ucf-c-tuition">
    	<dt>In-state</dt>
    	<dd>$212.28 <span>per credit hour</span></dd>
    	<dt>Out-of-state</dt>
    	<dd>$891.07 <span>per credit hour</span></dd>
    </dl>
    ```

- **Application deadlines.** A `<table>` of terms (Fall, Spring, Summer) by applicant
  (Freshmen, Transfers, International), with each date as the service gives it ("May 1"). The
  server never decides which deadline is next, because a cached page would keep saying so after
  the date passed. A small script may highlight the upcoming one; the dates themselves are
  already in the HTML.
- **Career outcomes.** The share of graduates employed full time and their average earnings,
  always labeled with the class they describe ("2019-20 graduates: 81% employed full time,
  $67,028 average salary"). The service sends both as strings (`"81.00000000"`), so the server
  formats them once.
- **Structured data.** Not a block, but the same pattern: the server writes the page's
  `EducationalOccupationalProgram` JSON-LD from the record the blocks read, so search engines see
  the same tuition and deadlines a visitor does.

### Interactive

Each of these lives in this library under `components/interactive/`.

- **Degree Finder.** A visitor picks a degree type and interests, and the browser fetches
  matching programs at each step. Its fallback is a link to the degree search page. Crawlers
  don't need its results, because every program it lists has its own profile page.
- **Tuition calculator.** Described above. Its fallback is the sentence "See this program's
  tuition rates above," since the rates are already on the page.
- **Event search.** A visitor filters by date, college and type, and results come from the events
  API. Its fallback links to the events calendar, where each event has its own page.

### Harder cases

- **"Related programs" on a degree page.** Without filters, it is live content: the server lists
  programs in the same college, as real links, and crawlers follow them. Add a filter by degree
  level, and it is still live content with behavior on top: the full list stays in the HTML, and
  the filter (the Interactivity API) only hides and shows items. It becomes interactive only if
  filtering fetches programs the HTML doesn't already hold.
- **A "next deadline" countdown.** The countdown is interactive, since it depends on today's date.
  The deadlines it counts down to are live content and must be in the HTML without it.
- **A request-for-information form.** Interactive, and its markup is usually a vendor's (a Slate
  embed), so we own only the container and the fallback: a link to the form's own page.
- **A personalized greeting** ("Welcome back, transfer student"). Interactive, even with no click,
  because a cached page can't hold content that differs by visitor.

## What follows

If these buckets hold, three things change. [architecture.md](architecture.md)'s "Two kinds of
component" becomes three, with live content defined as above and the single-site rule stated
there. [degree-profile-plan.md](degree-profile-plan.md) changes from React components in this
library to PHP dynamic blocks in the degree plugin, with the same single loader. And we need to
answer two questions before building the tuition block: whether ucf.edu stays on WordPress for
the foreseeable future, since PHP blocks would be rewritten at a move to the P1 starter, and which
plugin or theme owns the degree post type today, which is where the degree blocks will live.
