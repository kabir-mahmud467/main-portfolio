export const EXTRA_BLOCKS = {
  Architecture: {
    stack: [
      "Applied to the stack running this site: the Express server holds the controllers, the services own business rules, and the repositories own every database call. The platform currently ships fifteen modules through this structure, and adding a sixteenth is the same template exercise as adding the fifth was — the architecture's success is measured by its monotony.",
      "If your stack is a framework with opinions — Nest, Laravel, Django — map these layers onto its native constructs rather than fighting them: its modules are the boundaries, its services are the services, its ORM is the repository. The pattern is the discipline, and every framework gives you the shelves to hold it.",
    ],
    mistakes: {
      paragraphs: [
        "The most common failure I see in MVC projects is not missing layers — it is missing boundaries. Teams create services and repositories folders but then let routes import models directly 'just this once', and the once becomes the pattern. The dependency rule must be enforced mechanically — in code review, with lint rules, or both — because goodwill is not a boundary.",
        "The second most common mistake is over-abstraction in the other direction: interfaces for single implementations, factories for single classes, and configuration for things that never change. Abstraction has a tax, and it compounds. The modular MVC pattern works because it has five layers and no more — every extra layer must justify itself against the cost of indirection.",
      ],
      bullets: [
        "Routes importing models directly — the boundary leak that starts every legacy mess",
        "Services with zero business logic — just routes moved into another file",
        "Repositories that duplicate each other instead of composing",
        "Validation scattered between schemas, services, and views",
        "Enforcing structure by convention only, with no mechanical checks",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that pays the most dividends is the module template: every module in the platform is scaffolded from the same skeleton, so the question 'where does this code go?' has exactly one answer for every feature. New developers stop asking where things live and start asking what to build, which is the sign the structure is working.",
        "The second pattern is dependency injection at the module boundary. Services receive their repositories and collaborators through constructors, which makes unit tests trivial — swap the real repository for an in-memory fake and the entire service is testable in milliseconds. The pattern also makes the architecture visible: a constructor is a dependency diagram you can read.",
      ],
      bullets: [
        "Scaffold every module from one template so structure is never debated",
        "Inject dependencies through constructors — tests and visibility follow",
        "Keep error handling centralized so no handler formats its own failures",
        "Write a decision record for each structural choice and keep it in the repo",
      ],
    },
    practice: [
      "To put this into practice, start with the most painful file in your codebase — usually the largest route file. Extract its data access into a repository, move its business rules into a service, and watch the file shrink to a third of its size. Do this for the two or three most-churned features, then measure: the time to add a feature and the size of a typical diff are your before-and-after numbers.",
      "The second step is enforcing the boundaries mechanically. Add the dependency rules to your linter, make the module template available as a scaffold command, and require a decision record for any new layer. Structure that is not enforced is structure that will be ignored on a Friday afternoon, and Friday-afternoon code is exactly what the architecture exists to protect.",
    ],
    faqs: [
      {
        q: "How do I handle circular dependencies between modules?",
        a: "Dependencies must flow inward, so a cycle is always a design smell. The fix is usually to extract the shared concept into a lower layer — a common utility, a shared model, or an event bus — rather than letting two modules import each other. The compiler and your repo layout should make the cycle visible the moment it appears.",
      },
      {
        q: "Is this architecture overkill for a two-developer project?",
        a: "No — this is the architecture for a two-developer project. The layers here are cheap to establish and they replace the entire class of 'where does this go?' debates that slow small teams down. The cost is a few small files at the start; the benefit is every later decision gets faster.",
      },
    ],
  },
  Backend: {
    stack: [
      "In the stack behind this site, the pattern lives in three places: a shared error middleware that formats every failure, a schema layer that validates every route before its handler runs, and the repository decorators that wrap the hot reads with caching. New endpoints inherit all three by construction — which is why the API has grown from five to sixty endpoints without a single protocol-level bug.",
      "Whatever your backend stack, the same three files exist: an error formatter, a validator, and a wrapper for cross-cutting concerns. Find them, standardize them, and make them the default every new endpoint reaches for — the stack becomes the enforcement mechanism, and the discipline becomes invisible.",
    ],
    mistakes: {
      paragraphs: [
        "The most common API mistake is error handling that leaks: raw database errors, stack traces, or English-only messages leaking to clients. Clients cannot parse prose, and logs cannot be correlated without request IDs. The fix is the envelope discipline — stable codes, structured details, request IDs — applied from day one, because retrofitting it means touching every endpoint.",
        "The second mistake is trusting the client. Validation that only exists in the frontend, rate limits that only exist on the login page, and ownership checks that only exist in the UI all fail the same way: an attacker with a terminal does not use your UI. Every rule must exist server-side, enforced before side effects, for every endpoint.",
      ],
      bullets: [
        "Leaking driver or stack details into client-facing errors",
        "Validating only in the frontend, or not at all on some routes",
        "No request IDs, making production incidents into archaeology",
        "Rate limiting only login, while every other endpoint stays open",
        "Retries without idempotency — duplicate writes become a feature",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern worth copying everywhere is the validation pipeline: a schema per route, enforced by middleware before the handler runs. It collapses hundreds of lines of defensive if-statements into declarative contracts, and it guarantees the handler never sees invalid input — which is why handlers can be as short as they are.",
        "The second pattern is the repository decorator: wrap reads with caching, retries, or circuit breakers without touching the underlying implementation. The caching decorator in this portfolio cut the hottest query's load by an order of magnitude with a single annotation — the pattern keeps paying rent long after it is written.",
      ],
      bullets: [
        "Schema-per-route validation, enforced as middleware",
        "Decorators for cross-cutting concerns — cache, retry, rate limit",
        "One error class hierarchy, one error handler, one envelope",
        "Health endpoints that verify real dependencies with timeouts",
      ],
    },
    practice: [
      "Start by standardizing the error path: introduce the error hierarchy and central handler, wrap all async handlers, and add request IDs. That afternoon of work changes every future endpoint and every future incident. Then pick the single most dangerous mutation endpoint — the one that writes money, files, or user data — and add idempotency to it.",
      "Next, review your five busiest endpoints against the checklist in this article. For each one, verify validation runs before side effects, errors use the envelope, and the response carries the request ID header. The gaps you find are your backlog, ordered by how much they would hurt if exploited.",
    ],
    faqs: [
      {
        q: "Should I version my API?",
        a: "Yes, from the start, even with a single client. Versioning costs nothing at the beginning and removes the fear of breaking changes forever. `/api/v1/...` lets you evolve contracts freely, and the version header is the escape hatch when a client cannot upgrade in lockstep.",
      },
      {
        q: "How do I test the error paths I cannot trigger easily?",
        a: "Inject failure at the seam: unit tests call the service with a repository that throws, and integration tests use mocked upstreams that time out or return garbage. The error handler itself gets a dedicated test suite for every status code it must produce. Failures become test fixtures, not mysteries.",
      },
    ],
  },
  MongoDB: {
    stack: [
      "In this site's stack, the schema decisions are visible in every model: posts embed their SEO metadata and author snapshot, comments live in their own collection, and every list screen has its compound index documented in the repository README. The screen-to-index map is consulted in code review, so a new screen without an index is a review failure, not a production discovery.",
      "Mongoose is the enforcement layer: required fields, enums, and defaults at the boundary keep documents honest, and the versioned-migration helper turns schema evolution into a routine event. Your driver or ORM will have the same hooks — the discipline is the design, and the tool is just the referee.",
    ],
    mistakes: {
      paragraphs: [
        "The most expensive MongoDB mistake is designing for relationships instead of reads: normalizing everything because 'that is how data works', then discovering every screen needs three queries and an aggregation. The schema must follow the screens, and every screen must be listable in the 'screens first, indexes second' exercise before the collections are finalized.",
        "The second mistake is the unbounded array. Notifications, logs, and activity histories embedded in the parent document work beautifully for a month and then silently bloat every write — the parent is rewritten with the whole array on each update. The rule from the embed-or-reference table would have caught it on day one.",
      ],
      bullets: [
        "Normalizing like a relational database, then paying the join tax in code",
        "Unbounded arrays that bloat the parent document on every write",
        "Indexes designed for hypotheticals instead of actual screen queries",
        "Skipping explain() on hot queries until production says otherwise",
        "Migrating by rewriting collections instead of versioned documents",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that keeps this portfolio fast is the screen-to-index mapping: a document listing every screen with its filters, sorts, and pagination, and the compound index designed for each one. The mapping lives in the repository README and is updated when screens change — the indexes and the screens never drift apart.",
        "The second pattern is the versioned migration: every document carries schemaVersion, and a small upgrade function runs on load. Evolution becomes a normal event — add a field, bump the version, write the upgrade — instead of a downtime project. The platform has evolved its schema dozens of times without a single maintenance window.",
      ],
      bullets: [
        "Keep the screen-to-index map in the repo, updated with every screen change",
        "Version documents and migrate on load — evolution without downtime",
        "Use explain() on every new hot query before it ships",
        "Denormalize counts you read often and update atomically",
      ],
    },
    practice: [
      "Take the three most important screens in your application and write down the exact queries they run — filters, sorts, pagination, and the fields they return. Design one compound index per query in equality-then-range-then-sort order, create them, and run explain() to confirm the index is actually used. This hour of work is the highest-ROI database activity available.",
      "Then audit your documents for unbounded arrays: anything that grows without limit — logs, notifications, activity — moves to its own collection keyed by the parent ID. And add schemaVersion to your schemas, even if you never migrate today; the field is free now and priceless the first time a rename is needed.",
    ],
    faqs: [
      {
        q: "When should I use a separate database instead of collections?",
        a: "When data has genuinely different access or security profiles — analytics events written constantly and read rarely, versus user documents — a separate database gives independent backups and permissions. Otherwise, collections with index discipline scale far further than people expect.",
      },
      {
        q: "How do I handle soft deletes in MongoDB?",
        a: "A status or deletedAt field, with partial indexes filtering out the deleted rows from active queries. Soft deletes make the versioned-migration pattern simpler and give you the audit history that hard deletes destroy. Purge physically on a schedule for data that must go.",
      },
    ],
  },
  Security: {
    stack: [
      "In this site's stack, the security layer is four files: the header middleware, the session configuration, the CSRF protection, and the audit logger — each applied globally at the top of the request chain. Every route inherits them by construction, which is why the security checklist is enforced by the framework instead of the team's memory.",
      "Your stack's equivalents exist: every framework has session flags, header middleware, and rate limiters. The work is not finding the tools — it is making them defaults, testing them in CI, and treating the audit log as a first-class data store. The files in this portfolio are small because the decisions they encode were made early.",
    ],
    mistakes: {
      paragraphs: [
        "The most common security failure is treating it as a feature sprint: hardening in week forty of a project instead of from day one. Security decisions made early — headers, cookies, validation, escaping — are one-line defaults; retrofitted, they become cross-cutting refactors with regression risk. The cost of early adoption is measured in minutes; the cost of retrofitting, in weeks.",
        "The second failure is the insider blind spot: protecting the login page while trusting every authenticated session implicitly. Rate limits that stop at authentication, admin routes guarded only by a link, and exports that bypass the audit log are all insider-shaped holes. Authentication is the beginning of authorization, not the end of it.",
      ],
      bullets: [
        "Hardening as a retrofit project instead of day-one defaults",
        "Admin routes protected by UI hiding instead of authorization middleware",
        "Rate limiting only pre-auth endpoints — authenticated abuse ignored",
        "Audit logs that live in the same database they are supposed to protect",
        "Unreviewed third-party dependencies that ship to production",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that compounds best is defense in depth at the template boundary: auto-escaped output as the default, sanitized markdown for rich content, and a strict CSP as the last line. Three independent layers mean a single missed escape is caught by the sanitizer, and a sanitizer bypass is caught by the CSP — the attacker must defeat all three to win.",
        "The second pattern is the security review checklist embedded in the deploy pipeline: headers asserted in integration tests, dependency audits failing the build, and the audit log checked on every release. Security becomes a property of the pipeline, not a memory of the team.",
      ],
      bullets: [
        "Layer escaping, sanitization, and CSP so no single miss is fatal",
        "Assert security headers in tests so they cannot silently disappear",
        "Fail the build on high-severity dependency findings",
        "Audit-log checks and rate limits included in every release checklist",
      ],
    },
    practice: [
      "Run the ten-minute audit: open your headers with a check tool, review your cookie flags, and search your templates for raw output. The findings are usually small and fixable in an afternoon — and each fix closes a class of attacks permanently. Then enable the dependency audit in CI so the backlog never quietly grows.",
      "The deeper pass is the route review: walk every endpoint and ask whether it validates input, checks authorization, and logs sensitive actions. Mark the ones that do not, and schedule them against their risk. The pattern is simple — attack surfaces are closed one verified endpoint at a time.",
    ],
    faqs: [
      {
        q: "What is the most common real-world breach vector?",
        a: "Still compromised credentials, followed by unpatched dependencies and authorization gaps. All three are on the checklist in this article: MFA and rate limits for credentials, automated audits for dependencies, and route-level authorization checks for access gaps.",
      },
      {
        q: "How should I respond to a security incident?",
        a: "Contain first — revoke sessions, block the vector — then investigate with the audit trail, then communicate honestly, then fix the root cause and the process gap that allowed it. The audit logging in this article is what makes steps two and three possible; without it, the postmortem is speculation.",
      },
    ],
  },
  SEO: {
    stack: [
      "In this site's stack, the SEO layer is one service function and one template snippet: the function assembles titles, descriptions, canonicals, and JSON-LD from the document, and the layout renders it into every page head. Editors never touch SEO code, and pages never ship without metadata — the workflow is the enforcement.",
      "Your stack will have the equivalent seams: a layout template for the head, and a content model for the metadata. The architecture here is deliberately stack-agnostic — schema, sitemaps, and canonicals are standards, not features of any framework. The implementation details differ; the checklist does not.",
    ],
    mistakes: {
      paragraphs: [
        "The most common SEO mistake is treating it as magic applied after publishing: writing content, then vaguely 'hoping it ranks'. Ranking is an engineering process with measurable inputs — title intent, metadata completeness, structure, speed, internal links — and every input has a checklist. Content without the checklist is gambling with your best work.",
        "The second mistake is optimizing for engines instead of people: keyword-stuffed titles, metadata that reads like a contract, and content engineered for snippets at the expense of readability. Search engines have spent a decade learning to detect and demote exactly this. The sustainable ranking strategy is simple: publish genuinely useful content with the technical checklist complete.",
      ],
      bullets: [
        "No metadata fallback strategy — duplicate titles and descriptions",
        "Canonical URLs that vary by request path and query string",
        "Content published before the technical checklist is complete",
        "Sitemaps generated once by hand and forgotten",
        "Keyword stuffing in titles and metadata, written for bots not readers",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that drives the growth in this portfolio is metadata-as-data: SEO fields live in the database, populated with sensible defaults and editable by the author, rendered by one template function. The metadata is never an afterthought because it is structurally part of the content workflow — every publish creates complete metadata automatically.",
        "The second pattern is the content loop: every article ends by linking to related content, and related content is computed from shared categories and tags. The internal-link graph grows with every publish, crawl efficiency improves, and readers stay on the site longer — the two signals that search engines and users reward together.",
      ],
      bullets: [
        "Metadata generated by the content workflow, never by hand after publish",
        "Related-content links built from the category graph on every article",
        "Sitemap and lastmod generated from the database, per request",
        "Performance budget enforced in CI so speed regressions never ship",
      ],
    },
    practice: [
      "Run the metadata audit: pull the titles and descriptions of your ten most important pages and check them against the checklist — unique, under the length limits, written for clicks. Then verify canonical URLs and structured data with the validation tools. Most sites find the top three fixes here.",
      "Then build the automation: the metadata template function, the dynamic sitemap, and the CI performance budget from this article. The audit fixes today's pages; the automation fixes every future page automatically — which is the difference between SEO effort and SEO infrastructure.",
    ],
    faqs: [
      {
        q: "How often should I publish for SEO?",
        a: "Consistency beats frequency: the schedule that survives months matters more than any per-week number. The technical infrastructure in this article makes every publish count more — complete metadata, instant sitemap updates, and related links mean each article starts closer to ranking.",
      },
      {
        q: "Do backlinks still matter in 2026?",
        a: "Yes, but their character changed: one link from a genuinely relevant, authoritative page outperforms a dozen from link farms. The best backlink strategy is the one this portfolio uses — publish the technical depth that other sites cite because it is useful.",
      },
    ],
  },
  Frontend: {
    stack: [
      "In this site's stack, the frontend is four layers with strict rules: semantic templates, the Tailwind token system, the component layer, and a handful of enhancement scripts. The rules are enforced by the build and the review — tokens instead of hex values, components instead of duplicated classes, and the enhancement audit for every script that ships.",
      "Whatever your frontend stack, the same four layers exist and the same rules apply: markup first, tokens second, components third, scripts last. The tools may differ — SCSS or vanilla CSS instead of Tailwind — but the discipline of the enhancement audit and the token layer transfers unchanged.",
    ],
    mistakes: {
      paragraphs: [
        "The most common frontend mistake is the JavaScript dependency spiral: a tiny enhancement — a menu toggle, a theme switch — becomes a framework, then a build system, then a second app maintaining the first. Every script added to a page is a failure surface, and the maintenance cost grows with the square of the dependencies. The enhancement pattern exists precisely to stop this spiral.",
        "The second mistake is designing for the design tool instead of the device: pixel-perfect desktop mockups translated rigidly to phones, or breakpoint-driven reflows that ignore how content actually flows. Responsive design is a content strategy first — the layout must yield to the content, not the other way around.",
      ],
      bullets: [
        "Frameworks adopted for toggles and spinners that a few lines solve",
        "Images without dimensions, causing layout shift on every load",
        "Designs built from hex values instead of tokens and components",
        "Accessibility as an afterthought — no focus states, no reduced motion",
        "JavaScript required for content that should render regardless",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that keeps this portfolio's frontend honest is the enhancement audit: for every script on a page, the question is 'what happens when this fails or is blocked?' If the answer is 'the content still works', the script is correctly scoped. The audit is why the site has survived CDN hiccups with nothing more than a missing convenience.",
        "The second pattern is the token-driven component layer: every style decision flows from tokens — colors, spacing, radii — through components to templates. Changing the aesthetic is editing a config file, not a hundred class strings. The glassmorphism redesign of this portfolio was a token change plus a component update, which is exactly how fast design evolution should be.",
      ],
      bullets: [
        "Every script passes the enhancement audit or it does not ship",
        "Design tokens feed components, and components feed templates",
        "Layout shift measured and budgeted in CI",
        "Reduced-motion and keyboard support tested on every interactive element",
      ],
    },
    practice: [
      "Start with the performance audit: load your most important page in a fresh profile and list the scripts, styles, and images above the fold. Each one gets a verdict — critical, deferrable, or removable — and the deferrals are the week's work. The same audit, run quarterly, is the entire performance strategy.",
      "Then audit your CSS for duplicated patterns: the same card style defined in three pages is a component waiting to exist. Extract the top three duplicates into the component layer, convert their hex values to tokens, and watch the next page assemble itself from vocabulary you already own.",
    ],
    faqs: [
      {
        q: "How do I introduce a framework without starting over?",
        a: "Island-style: keep the server-rendered shell, and mount framework components only where the interaction genuinely requires them — a chart, a filter, an editor. The boundary is a script tag and a container, and every island can be extracted or removed without touching the rest of the page.",
      },
      {
        q: "How do I test visual consistency across devices?",
        a: "Automate the essentials — layout shift, overflow, and contrast checks in CI — and test the flows manually on real devices once per release. Perfect cross-device parity is unattainable; consistent behavior and readable content on every device is the achievable standard.",
      },
    ],
  },
  DevOps: {
    stack: [
      "In this site's stack, the operations story is five files: the ecosystem configuration, the Nginx config, the deploy script, the CI workflow, and the backup cron — every one of them in the repository, every one of them reviewed like code. A new server is a checkout and a script run; a new release is a push. The entire operations knowledge fits in the repository it operates.",
      "Your stack will differ in tools — systemd instead of PM2, GitLab instead of GitHub — but the shape of the solution is identical: artifact, script, verification. The tools are interchangeable; the discipline of treating operations as code is the part that cannot be swapped.",
    ],
    mistakes: {
      paragraphs: [
        "The most common deployment mistake is the snowflake server: a production box configured by hand, documented in nobody's memory, reproduced by 'careful' copying. The first time the server dies, the team learns the entire infrastructure lives in a dying hard drive. The fix is the artifact discipline — everything that matters is code: configs, pipelines, and scripts in the repo.",
        "The second mistake is treating monitoring as a dashboard: metrics displayed beautifully and never acted on. A dashboard without thresholds, alerts, and runbooks is decoration. The monitoring that matters produces a page when something is wrong, and a runbook that tells someone what to do about it.",
      ],
      bullets: [
        "Production configured by hand and documented in tribal memory",
        "Deploys from a developer's laptop instead of a CI pipeline",
        "Dashboards with no thresholds, alerts, or runbooks",
        "Backups scheduled but never restore-tested",
        "Secrets in the repo, the README, or the image layers",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that makes deploys boring is the deploy script: one file, versioned with the app, that pulls the artifact, runs migrations, reloads the process, and verifies the health endpoint. The script is the documentation — a new server is onboarded by running the same script it will run for every release.",
        "The second pattern is infrastructure as reviewable code: Nginx configs, ecosystem files, and CI workflows all live in the repository and go through the same review as application code. The server becomes a reproducible artifact of the repo, and 'what changed in production?' becomes a question answered by git history.",
      ],
      bullets: [
        "One versioned deploy script that every release runs identically",
        "Server configuration in the repo, reviewed like code",
        "Restore tests on the backup schedule — untested backups are hopes",
        "Runbooks written before the incidents that need them",
      ],
    },
    practice: [
      "Write the deploy script first: build, migrate, reload, verify — even if it starts by wrapping the manual steps you already take. The script is the contract; everything else — CI integration, rolling deploys, rollback — attaches to it later. Then add the health endpoint the script verifies, and you have the entire safety story in two files.",
      "Then test the restore: restore your most recent backup into a throwaway environment and verify the data. Do it monthly, and the first time the restore actually matters, it will be a forty-minute script instead of a weekend. The rest of the checklist — alerts, runbooks, secrets hygiene — attaches in the same session.",
    ],
    faqs: [
      {
        q: "How do I migrate an existing manual setup to this pattern?",
        a: "Slowly, without downtime: capture the current state as scripts and configs in the repo first, then shift each operation — build, deploy, backup — from manual to scripted one at a time, verifying after each. The pipeline replaces the operator, not overnight, but steadily enough that the tribal knowledge becomes unnecessary.",
      },
      {
        q: "What belongs in the runbook for a small project?",
        a: "Three pages: how to check health, how to deploy and roll back, and how to restore a backup. Written when things work, they become the calm instructions used when things do not. The runbook is the memory the team needs on its worst day.",
      },
    ],
  },
  Performance: {
    stack: [
      "In this site's stack, the performance work is institutionalized in three places: the image pipeline at ingest, the caching decorator at the data layer, and the CI budget at the gate. None of the three is a project — they are properties of the pipeline, which is why the site's metrics stay flat while its feature set grows.",
      "Your stack's equivalents are identifiable: your image handling, your caching layer, and your build gate. Start with the three that exist and make them stricter — the budget is the one that protects the other two. The stack does not matter as much as the enforcement; performance survives on gates, not intentions.",
    ],
    mistakes: {
      paragraphs: [
        "The most common performance mistake is optimizing without measuring: rewriting code because it 'feels slow' while the real bottleneck sits in an image or a query nobody looked at. Every optimization in this article is preceded by a measurement, because the biggest bars on the waterfall are the ones that deserve the work — and they are rarely where intuition points.",
        "The second mistake is optimizing the wrong layer: server-side developers tuning database queries while the page weight is 90% images, or frontend developers chasing paint times while the server blocks on slow middleware. The waterfall answers which layer owns the problem, and the answer determines who fixes it.",
      ],
      bullets: [
        "Optimizing from intuition instead of the waterfall's biggest bars",
        "Tuning one layer while the real weight lives in another",
        "No cache headers — every visitor pays full price every visit",
        "Budgets set but never enforced in CI",
        "Mobile ignored until a review arrives from a phone",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that keeps this site fast over time is the budget in CI: LCP, CLS, and page weight thresholds enforced on every build, so a regression is caught by the pipeline before users catch it in production. Budgets convert performance from a periodic project into a permanent property — the site cannot silently get slower.",
        "The second pattern is the layered cache: browser headers for static assets, CDN for pages and images, the caching decorator for database reads. Each layer answers a different repeat visit, and together they mean the database serves only the fraction of traffic that genuinely needs it.",
      ],
      bullets: [
        "Performance budgets enforced in CI, failing the build on regressions",
        "Cache layers at browser, CDN, and application boundaries",
        "Image pipeline that processes, resizes, and serves modern formats",
        "The waterfall consulted before every optimization decision",
      ],
    },
    practice: [
      "Capture the baseline today: run the three audits — real-user metrics, a lab test on your most important page, and the database explain on your busiest query. The findings form the backlog, ordered by the size of the bars, and the top three fixes this week will move every metric they touch.",
      "Then make it permanent: add the CI budget with thresholds 20% better than today's numbers, and add the caching decorator to the two hottest reads. The week's work buys years of protection, because every future feature now ships against the budget instead of against the team's memory.",
    ],
    faqs: [
      {
        q: "What is the difference between TTFB and LCP, and why does it matter?",
        a: "Time-to-first-byte measures the server; largest-contentful-paint measures when the main content is visible. A fast TTFB with slow LCP means the browser is the problem — render-blocking resources, heavy images. A slow TTFB with fast LCP means the server is — queries, middleware, upstream calls. The pair splits every performance problem in half.",
      },
      {
        q: "How do I convince stakeholders to invest in performance?",
        a: "With the numbers they already trust: conversion, engagement, and cost per user. Benchmark the current experience against the budget, project the improvement from the fixes, and frame the budget as the protection of that investment. Performance is a business metric with a waterfall attached.",
      },
    ],
  },
  Career: {
    stack: [
      "The 'stack' in this article is not a technology — it is the loop: ship, reflect, teach, repeat. In my own workflow the loop has concrete instruments: the portfolio as the shipping channel, the retrospective as the reflection instrument, and this blog as the teaching surface. Every project and article on this site is an artifact of the loop, which is the only way I know to prove it works.",
      "Your version of the loop does not need any of this site's tools — it needs only the four stages and the artifacts they produce. A deployed project, a written retrospective, and a public teaching artifact per quarter: that is the entire stack, and it runs on any machine, in any industry.",
    ],
    mistakes: {
      paragraphs: [
        "The most common career mistake is passive learning: reading articles, watching talks, and collecting bookmarks while the skills rust. Learning converts to ability only through application — the roadmap's stages exist because tutorials feel like progress and are not. The metric that matters is shipped work, not consumed content.",
        "The second mistake is hiding mistakes. Junior developers conceal their failures from fear, which costs them the learning and the team the information. Senior developers postmortem everything — the blameless why is the most valuable artifact an engineer produces, and it is impossible to produce while hiding.",
      ],
      bullets: [
        "Consuming tutorials without shipping anything real",
        "Hiding failures instead of postmorteming them",
        "Collecting frameworks instead of building depth",
        "Learning in isolation — no code reading, no teaching, no journal",
        "Estimating with confidence instead of ranges and rationale",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that accelerates growth most is the written retrospective: after every project, an honest document covering what worked, what did not, and what to change. The portfolio projects in this site are the direct result of retrospectives — each artifact corrected a mistake its predecessor made, and the pattern is visible in the code.",
        "The second pattern is public teaching: articles, talks, or pairing sessions that force the subject to be explained. Teaching reveals the gaps in understanding that practice hides, and it builds the reputation that opportunities find. Every article in this blog is a teaching artifact, and each one made the next project better.",
      ],
      bullets: [
        "A written retrospective at the end of every project",
        "Teaching what you build — the gaps appear immediately",
        "An engineering journal that converts experience into learning",
        "Code reading as a daily habit — yours, peers', and open source",
      ],
    },
    practice: [
      "Write the retrospective for your last completed project this week — three sections, honest: what worked, what did not, what to change. The document costs an hour and becomes the blueprint for the next project. Then pick the single mistake on the list and design the next project to avoid it.",
      "Then start teaching: the article does not need to be perfect or long, just specific about something you learned the hard way. Publishing it publicly closes the learning loop and starts the reputation loop — and both loops are what the roadmap is built on.",
    ],
    faqs: [
      {
        q: "How do I find a mentor?",
        a: "Mentorship is usually found through work, not requests: contribute to a project you respect, ask specific questions about its code, and learn from the review process. Most senior engineers mentor through code review without calling it mentorship. The best mentor is the codebase with a good review culture.",
      },
      {
        q: "What should I do when I feel stuck in my career?",
        a: "Run the roadmap loop from wherever you are: ship something small, reflect on it, teach it. The loop has a reliable effect on direction — every iteration produces evidence of what you enjoy and what you are good at, and the evidence is more trustworthy than introspection alone.",
      },
    ],
  },
  Tools: {
    stack: [
      "In this site's stack, the tools are deliberately few: a terminal configuration, the editor setup, the scaffold scripts, and the automation layer — and every one of them is versioned in the repository where its users can see it. The stack is a dozen tools, not a hundred, because the friction log and the quarterly review keep it honest.",
      "Your stack will be different and should be: the tools are the survivors of your own friction log, not this article's. What transfers is the filter — remove recurring cost, review quarterly, and let every tool earn its place — and the filter is the part that keeps working long after the specific tools change.",
    ],
    mistakes: {
      paragraphs: [
        "The most common tooling mistake is adopting tools for their popularity instead of their friction removal: the tool is installed, configured, and then maintained for months while the task it was meant to delete quietly reappears. Every tool must answer 'what recurring cost does it remove?' — and the answer must be reviewed, because tools stop paying rent.",
        "The second mistake is tooling as a project: weeks spent perfecting configs, snippets, and automations while the actual work waits. Configuration is a means, and a means that consumes the end is a trap. The discipline — timeboxes, defaults first, quarterly reviews — exists to keep tooling a multiplier instead of a project.",
      ],
      bullets: [
        "Tools adopted for hype and maintained out of sunk cost",
        "Config projects that consume the weeks meant for shipping",
        "Automation built for tasks that happen twice a year",
        "Dotfiles and scripts living only on the machine that created them",
        "Every project with different conventions and different commands",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern with the highest return is cross-project consistency: the same commands, the same folder shapes, and the same scripts in every repository. Moving between this portfolio's projects is a zero-thought experience, and the thought saved on every switch compounds into hours every month.",
        "The second pattern is the automation audit: a list of everything that runs on a schedule, each with its failure behavior and its owner. The audit answers the question that scheduling ignores — what happens when this job fails? — and that answer is what makes automation trustworthy.",
      ],
      bullets: [
        "One convention set across every project — commands, shapes, naming",
        "Every scheduled job documented with its failure behavior",
        "Dotfiles and scripts versioned, so machines are disposable",
        "A quarterly review that prunes tools that stopped paying rent",
      ],
    },
    practice: [
      "Start with the friction log: for one week, note every task you repeat or re-derive — the setup steps, the remembered commands, the manual checks. The list is your backlog, ordered by annoyance, and the top item gets its script or automation this week. The log is the tool filter made concrete.",
      "Then standardize: pick the three commands every project should share — dev, build, seed — and make them identical across your repos. Convention alignment is free and removes the entire class of 'how do I run this again?' questions, from your future self included.",
    ],
    faqs: [
      {
        q: "How do I avoid spending all my time on tooling?",
        a: "Timebox every tooling session: the setup gets a countdown, and the tool must demonstrate its value within it or the countdown ends the experiment. The friction log decides what deserves tooling in the first place, and the quarterly review removes what stopped earning it.",
      },
      {
        q: "What is the most underrated tool in a developer's stack?",
        a: "A good scaffold script. The ability to generate a new module, page, or project with the correct structure in one command is the single biggest time saver in this portfolio — it encodes the architecture decisions once so no new work can forget them.",
      },
    ],
  },
  Linux: {
    stack: [
      "In the stack behind this site, the Linux layer is the foundation everything else stands on: the server runs an LTS distribution, the shell scripts that deploy the platform are bash, and the terminal is the daily interface to every box. The commands in these articles are not reference material — they are the actual verbs of the deployment, monitoring, and backup routines documented in the repository.",
      "Whatever your stack, the same Linux core appears: the OS, the shell, and the command vocabulary. The tools may differ by distribution family (apt or dnf, systemd or sysv), but the shape is identical — and learning the shape once transfers to every machine you will ever touch.",
    ],
    mistakes: {
      paragraphs: [
        "The most common Linux mistake is the dangerous command reflex: reaching for `chmod 777` to silence a permission error, or `rm -rf` to 'fix' a directory, without understanding what the command actually changes. Both are moments where a second of comprehension prevents an hour of recovery. The permission article exists to replace the reflex with the model.",
        "The second mistake is treating the system as a collection of unrelated commands instead of one coherent model: users, files, processes, packages, and services that all interact. Operators who learn the model debug in minutes; operators who memorize commands debug by trying things. The discipline — decompose, diagnose, then act — is the whole difference.",
      ],
      bullets: [
        "chmod 777 and rm -rf as the first resort — the two classic disasters",
        "kill -9 as the reflex for every hung process",
        "Tutorial snippets copied without reading what they change",
        "Skipping man pages and --help because 'they are for beginners'",
        "No documentation of the commands that keep a server alive",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that pays most is the command language: a small set of primitives (ls, cat, grep, find, ps, df) composed with pipes and redirection into the exact answer to a question. Every article in this category demonstrates the composition — a log question becomes `grep | sort | uniq` in one line, not a five-step ritual.",
        "The second pattern is the check-before-act discipline: `ls` before `rm`, `df` before blaming the app, `ps` before killing, `nginx -t` before reloading. The pattern is three keystrokes of prevention that this portfolio practices in every deployment and documents in every script.",
      ],
      bullets: [
        "Compose small commands with pipes instead of scripting everything",
        "Inspect before you act — ls before rm, ps before kill",
        "Keep destructive commands behind full paths and dry runs",
        "Learn the model (users, processes, packages) not just the commands",
      ],
    },
    practice: [
      "Start with the safety habits from this category: never run a destructive command without understanding it, run `df -h` and `ps aux` before changing anything under load, and practice the permission model until `ls -l` reads like prose. These three habits remove the entire class of self-inflicted Linux incidents.",
      "Then build the command vocabulary deliberately: take one routine task a day and replace its slow way with a composed command. Within a month the terminal is an extension of your thinking rather than a tool you consult.",
    ],
    faqs: [
      {
        q: "Which is the single most dangerous Linux command?",
        a: "`rm -rf` on the wrong path — it is recursive, forced, and permanent, and a single typo or wrong variable turns it from 'cleanup' into 'catastrophe'. The discipline: always print or echo the full path first, never combine it with unchecked variables, and prefer `rm -r` (without -f) for anything interactive.",
      },
      {
        q: "How do I know which command to learn next?",
        a: "Let the work decide: the next command you need is the one that would have automated whatever you just did manually. Read your shell history weekly, find the repeated manual steps, and learn the command that removes one of them. The curriculum is your own routine.",
      },
    ],
  },
  Termux: {
    stack: [
      "The phone terminal in this article's stack is a real, recurring tool: the deployment check on the go, the SSH session in a pocket, and the proot-distro environment for mobile Linux experiments. It is versioned like everything else — a dotfiles repo and a documented setup — so a new phone restores in minutes.",
      "Your equivalent stack might be a different terminal app or no phone usage at all. What transfers is the discipline: the environment is documented, secured (keys, not passwords), and reproducible (tar + git). Those three properties turn a pocket terminal from a toy into an asset.",
    ],
    mistakes: {
      paragraphs: [
        "The most common Termux mistake is treating it as a restricted echo of a desktop Linux instead of its own environment: running apt from tutorials written for Ubuntu, expecting systemd, or trying to access files that live in Android's private space. The environment has its own package sources (pkg) and its own storage model — the setup article exists to map them once.",
        "The second mistake is the security gap: enabling the Termux SSH server with password auth, or carrying unencrypted keys with no device lock. The phone is a pocketable device and its terminal is a real credential surface. The discipline — key-only SSH, lock screen, backups — is the same as any server's, applied to something you carry daily.",
      ],
      bullets: [
        "Running Ubuntu tutorials against Termux's own package world",
        "Assuming systemd or full-distro behavior that does not exist here",
        "SSH server on with passwords and a default port",
        "Keys and configs with no backup and no restore path",
        "Fighting the environment instead of reading its differences",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that makes Termux a real workstation is environment-as-code: the packages, configs, keys, and scripts live in a dotfiles repo, and a fresh phone is a clone plus a restore. This article series practices that pattern throughout — the setup, the package list, the scripts, and the backups are all documented and rerunnable.",
        "The second pattern is the secure-by-default stance: keys instead of passwords, listeners off unless needed, updates on a schedule. The phone gets the same hardening language as the servers it connects to, which means the skills and the habits transfer in both directions.",
      ],
      bullets: [
        "A dotfiles repo makes a new phone a clone, not a rebuild",
        "Key-only SSH and listeners off unless needed",
        "Weekly pkg updates and monthly backups are the routine",
        "Every Termux tutorial in this series is documented and rerunnable",
      ],
    },
    practice: [
      "Start with the setup article's twenty-minute pass: termux-setup-storage, pkg update and upgrade, the curated packages, and a committed dotfiles repo. The environment then compounds instead of decays — every later article in this category builds on the same base.",
      "Then add the automation layer deliberately: one backup script, one health check, one sensor-driven script (Termux:API). Each is a few lines, each is committed, and together they convert the phone from a terminal into a workstation that does work unattended.",
    ],
    faqs: [
      {
        q: "Can Termux fully replace a laptop for Linux work?",
        a: "Not fully — builds and multitasking favor the laptop — but it replaces the laptop for the common 80%: SSH, git, scripting, and terminal work, on the device that is always with you. The realistic framing is the one this series uses: the phone is the field terminal, the laptop is the build machine, and git is the bridge.",
      },
      {
        q: "Is Termux secure enough for my real keys?",
        a: "Yes, with the standard discipline: a locked screen, passphrase-protected or agent-scoped keys, key-only SSH on the phone's server, and up-to-date packages. The phone then meets the same bar as any laptop's terminal — the difference to respect is that the phone is small and easily lost, so backups and revocability matter more.",
      },
    ],
  },
  Servers: {
    stack: [
      "The server layer is the run-time of this entire platform: a hardened VPS running the application under systemd, Nginx in front, MongoDB behind, with the monitoring and backup routines from these articles documented in the repository. The articles in this category are not theoretical — they are the actual operating manual of the boxes that serve this site.",
      "Your server stack will differ in tools, not in shape: an LTS distribution, keys and firewalls, a reverse proxy, a process manager, and a database — with monitoring and backups as the constant. The discipline transfers wholesale; only the commands change.",
    ],
    mistakes: {
      paragraphs: [
        "The most common server mistake is default exposure: a box installed with the distribution defaults — password SSH, all interfaces, no firewall — then left to the internet. The scanners find it within days, and the 'default config' becomes the compromise vector. The hardening article exists because the default is a liability, not a convenience.",
        "The second mistake is the unverified backup: a schedule that has never been restored, discovered at the worst possible moment. The database article's restore test is not ceremony — it is the only way a backup stops being a hope and becomes a capability.",
      ],
      bullets: [
        "Default installs with password SSH and open ports left public",
        "Backups scheduled but never restore-tested",
        "The database bound to every interface with auth off",
        "Deploys by hand, undocumented, unreproducible",
        "Monitoring that is a dashboard rather than an alert",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that carries every server article is the checklist-as-code: hardening steps, deploy steps, and monitoring steps all written down as scripts and documents in the repository. The server becomes a build artifact — provision, document, reproduce — instead of a snowflake maintained by memory.",
        "The second pattern is the layered defense: keys, firewall, least privilege, and patching each protecting the others, so a failure at one layer is contained by the next. The security article is the map of those layers, and every article in this category assumes them.",
      ],
      bullets: [
        "The server is documented in the repo and rebuildable from it",
        "Keys, firewall, patching, and least privilege layer together",
        "Backups are restore-tested on a schedule",
        "Monitoring alerts on real thresholds with runbooks attached",
      ],
    },
    practice: [
      "Start with the hardening checklist on your next (or existing) box: keys-only SSH, default-deny firewall, automatic updates, and a documented SERVER.md. The pass is an afternoon and converts the box from a liability into a reproducible asset.",
      "Then build the serving stack deliberately: Nginx in front, the app under a process manager, the database with its backup and restore test — each from its article, each documented. The stack is the operating manual of everything this portfolio serves.",
    ],
    faqs: [
      {
        q: "What is the single highest-value server task?",
        a: "The restore test: actually restoring a backup into a scratch environment. It validates the entire backup chain — schedule, encryption, storage, tooling — in one afternoon, and it is the task nobody does until the day it is the only thing that can save them.",
      },
      {
        q: "How much server security is 'enough'?",
        a: "Enough is the checklist in the hardening article, maintained: keys-only SSH, a default-deny firewall, automatic patching, least-privilege users, and monitored logs. Everything beyond that (IDS, compliance frameworks) is insurance for specific threats — add it when the threat model justifies it, not before.",
      },
    ],
  },
  "Shell & Automation": {
    stack: [
      "The shell layer is how this platform is operated: bash scripts for deployment, tmux for remote sessions, cron and systemd timers for schedules, and the network toolkit for diagnostics. The automation articles in this category are the actual playbooks of the boxes behind this site — the scripts are in the repository, versioned like the code they operate.",
      "Your stack will name its own tools, but the shape is constant: a shell for scripting, a multiplexer for sessions, a scheduler for time-based work, and a network vocabulary for diagnosis. The discipline — scripted, scheduled, and logged — is the part that does not change.",
    ],
    mistakes: {
      paragraphs: [
        "The most common automation mistake is the unobserved job: a cron line with no logging, no notification, and no review — running (or failing) silently for months. The scheduling article's observability pattern exists because the silent failure is the automation speciality.",
        "The second mistake is automation as a black box: scripts with no headers, no error handling, and no version control, whose behavior is re-derived by reading them line by line. The bash article's shape — set -euo pipefail, functions, traps — is what turns a script from a mystery into a documented tool.",
      ],
      bullets: [
        "Scheduled jobs with no logs and no failure notifications",
        "Scripts without set -e or any error handling",
        "tmux-less sessions lost to the first disconnect",
        "Network diagnosis by guessing instead of the ordered stack",
        "Automation built for rituals that happen twice a year",
      ],
    },
    patterns: {
      paragraphs: [
        "The pattern that pays most is the scripted default: anything done twice by hand becomes a script with the full ceremony — header, error handling, logging. The platform's deploys, backups, and health checks are all such scripts, and the article series documents the exact shapes they take.",
        "The second pattern is the observed schedule: every cron job and timer logs to a file, notifies on failure, and is reviewed weekly. Observability is what makes automation trustworthy — the difference between a job you rely on and a job you hope about.",
      ],
      bullets: [
        "Twice-by-hand becomes a script with headers and error handling",
        "Every schedule logs, notifies on failure, and is reviewed",
        "tmux sessions make long work disconnect-proof",
        "The network stack (resolve → reach → connect → respond) is the diagnostic reflex",
      ],
    },
    practice: [
      "Start with the bash article's template: convert your most repeated ritual into a script with set -euo pipefail, a header, and a log line. The first script is the template for every automation that follows — this category is a compounding skill.",
      "Then make the schedule and the session part of the routine: cron or a systemd timer for the script, and tmux for anything that outlasts your attention. The stack of script + schedule + session is the whole automation discipline in three tools.",
    ],
    faqs: [
      {
        q: "What is the best first automation to build?",
        a: "A backup of something you would hate to lose — a database dump or a working directory, scheduled nightly, logged, and tested by an occasional restore. It is the automation whose value is unconditional, and it exercises every pattern in this category: script, schedule, log, and verify.",
      },
      {
        q: "How do I know when automation has gone too far?",
        a: "When the automations start surprising you: firing at unexpected times, doing unexpected things, or requiring more maintenance than the ritual they replaced. The quarterly review — prune what stopped paying rent, keep what survived — is the same filter this portfolio applies to its own tooling.",
      },
    ],
  },
};
