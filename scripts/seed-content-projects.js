export const PROJECT_TYPES = [
  {
    type: "Saas",
    category: "SaaS Platforms",
    techStack: ["Node.js", "Express", "MongoDB", "Redis", "Tailwind CSS", "EJS"],
    titles: [
      ["InvoiceFlow", "Invoice generation, client billing, and payment tracking in one streamlined dashboard"],
      ["PulseBoard", "Real-time analytics dashboards for web products, with live charts and session insights"],
      ["TaskFlow Pro", "Project and task management with boards, sprints, and team workload views"],
      ["HabitStack", "A habit tracker that turns daily routines into streaks, charts, and accountability"],
      ["EventPulse", "Event planning, ticketing, and attendee management for organizers of every size"],
    ],
    overview:
      "A production-grade SaaS platform designed from the ground up around a real workflow. The project started as a question — 'why is this still done in spreadsheets?' — and grew into a full product with authentication, billing-ready features, admin tooling, and an architecture that survives real users. Built with the modular MVC structure from this portfolio's architecture articles: thin routes, service layers for business rules, and repositories behind every database call.",
    features: [
      "Role-based access with owner, admin, and member permissions on every resource",
      "Full-text search across entities with filterable, sortable, paginated tables",
      "Server-side rendered pages with progressive enhancement for instant interactivity",
      "CSRF-protected mutations, rate-limited auth, and audit logging on sensitive actions",
      "Responsive glassmorphism UI shared with the rest of the portfolio's design system",
      "Dark mode with a persisted theme preference and reduced-motion support",
    ],
    architecture:
      "The codebase follows the five-layer pattern documented in the blog: routes stay thin and declarative, services own business rules, repositories own all database access, and views receive only pre-shaped data. Every module is scaffolded from the same template, which means a new resource type — say, client statements — is a repository, a service, and a thin route following an existing shape.",
    techDecisions: {
      title: "Key Technology Decisions",
      headers: ["Decision", "Choice", "Alternative Considered", "Why This Won"],
      rows: [
        ["Data store", "MongoDB with Mongoose", "PostgreSQL", "Document shape matches screen shape; schema evolves weekly"],
        ["Rendering", "Server-side EJS", "React SPA", "Instant first paint; content-first product; minimal JS"],
        ["Styling", "Tailwind component layer", "CSS modules", "One glass design system across three portfolio products"],
        ["Auth", "Session cookies + CSRF", "JWT", "Server-owned sessions with HttpOnly cookies; revocation by default"],
        ["Deployment", "PM2 cluster + Nginx", "Serverless functions", "Zero-downtime reloads on one well-understood box"],
      ],
    },
    realWorld:
      "The platform's most demanding moment came during a shared-account stress test: forty concurrent users hammering the same workspace while a background job recalculated team metrics. The indexed queries and the caching decorator absorbed the load without a single timeout, and the latency percentiles barely moved. The incident report from that day is two lines long — because nothing broke, and the monitoring data proved it.",
    metrics: [
      "Dashboard queries optimized from 40 per render to 1 indexed query per table",
      "P95 page render under 400ms on a mid-range phone, 4G connection",
      "Zero-downtime deploys on every release via PM2 rolling reloads",
      "Audit trail covering every sensitive action with request IDs",
    ],
    faqs: [
      { q: "What makes this production-ready rather than a demo?", a: "Everything an operator needs exists: health endpoints, structured JSON logs, rate limits, CSRF protection, audit trails, encrypted backups, and a CI pipeline that builds, tests, and deploys without human steps." },
      { q: "Why MongoDB instead of a relational database?", a: "The screens are document-shaped: every page renders one entity plus its embedded summaries. The schema evolves weekly, and the versioned-migration pattern handles evolution without downtime. PostgreSQL would be chosen the day complex relational reporting becomes the product." },
      { q: "How does the design system stay consistent?", a: "The Tailwind component layer — glass-card, glass-panel, glass-chip, glass-input — is shared across the portfolio's products, so every page is assembled from the same vocabulary by construction, not by discipline." },
      { q: "What was the hardest part to build?", a: "The permission model. Every resource is owned, shared, or public, and ownership checks must run server-side on every route. The solution is a small middleware that verifies ownership before handlers run, and it has been bug-free since the third week." },
      { q: "Is the codebase structured for growth?", a: "Yes — new modules copy an existing template, which is why the architecture article calls it 'survivable growth'. Each resource type is an independent module that can be deleted without touching its neighbors." },
    ],
  },
  {
    type: "Fintech",
    category: "Fintech & Payments",
    techStack: ["Node.js", "Express", "MongoDB", "Redis", "Stripe API", "EJS"],
    titles: [
      ["PayConnect", "A unified payments platform connecting invoices, wallets, and recurring billing"],
      ["Ledgerly", "Double-entry bookkeeping with reports, reconciliation, and audit-ready history"],
      ["CoinKeeper", "Personal finance tracking with budgets, goals, and category analytics"],
      ["Subscripe", "Subscription management for creators: plans, prorations, and revenue dashboards"],
      ["ExpenseIQ", "Receipt scanning and expense reporting that closes itself at month-end"],
    ],
    overview:
      "Money-moving software is where software engineering meets its highest standard: idempotency, auditability, and the absence of subtle bugs are not features here, they are the product. PayConnect-class platforms in this portfolio are built around one core discipline — every mutation is idempotent, every sensitive action is logged, and every failure is a structured error with a stable code a client can react to.",
    features: [
      "Idempotency-key middleware on every mutation so retries can never double-charge",
      "Webhook processing with signature verification, replay protection, and dead-letter queues",
      "Ledger-grade audit log: every transfer, refund, and rate change recorded with request IDs",
      "Dashboard with revenue, churn, and MRR computed from indexed aggregations",
      "TOTP two-factor authentication for every operator account",
      "Role-scoped access: support, finance, and admin roles with least privilege",
    ],
    architecture:
      "The API layer is the heart: a consistent error envelope, schema-first validation before any side effect, rate limits keyed by account, and the idempotency middleware guarding every non-idempotent mutation. The webhook pipeline runs through a queue with retries and exponential backoff, and every event is replayable — the platform can rebuild state from its event history, which is both a debugging superpower and a compliance answer.",
    techDecisions: {
      title: "Key Technology Decisions",
      headers: ["Decision", "Choice", "Alternative Considered", "Why This Won"],
      rows: [
        ["Payments", "Stripe API with webhooks", "In-house processor", "Battle-tested rails; in-house would be a liability"],
        ["Idempotency", "Redis-keyed middleware", "Database unique keys", "Reads replay cached responses; no duplicate writes possible"],
        ["Ledger model", "Event-sourced history", "Mutable balance columns", "Every balance is derivable; audits answer every question"],
        ["Auth", "TOTP + sessions", "Password only", "Stolen credentials are useless without the second factor"],
        ["Reporting", "Indexed aggregations", "OLAP warehouse", "Interactive dashboards at this scale need no warehouse"],
      ],
    },
    realWorld:
      "The defining incident came from a misbehaving client: a retry storm replayed a payment request 214 times in ninety seconds. The idempotency middleware answered 213 of those with the cached original response and executed the mutation exactly once. The error log shows the storm; the ledger shows one charge. That single mechanism paid for the entire platform.",
    metrics: [
      "214 consecutive retries absorbed with exactly 1 execution",
      "Webhook delivery reliability 99.98% over six months",
      "Audit queries answered from event history without joins",
      "P95 payment flow latency under 800ms including provider round-trip",
    ],
    faqs: [
      { q: "How do you guarantee a retry cannot double-charge?", a: "Every mutation accepts an idempotency key. The middleware checks Redis first: a replay returns the cached original response; a fresh key executes once and caches the result. The client's retry storm proved the design: 214 requests, one charge." },
      { q: "Why event-sourced history instead of a mutable ledger?", a: "Because every balance becomes a question the history can answer. Reconciliation, audits, and 'what happened on March 3rd?' are queries over events rather than forensic archaeology. The events are the truth; the balances are projections." },
      { q: "How are webhooks protected from forgery?", a: "Signatures are verified with the provider's secret, events are idempotent by event ID, and processing runs through a queue with replay protection. A forged event fails signature verification; a replayed event returns the cached outcome." },
      { q: "What happens when an upstream payment provider is down?", a: "Mutations fail fast with a stable error code, clients retry with the same idempotency key, and the queue holds webhook deliveries with exponential backoff. When the provider returns, the backlog drains without a single manual step." },
      { q: "Is two-factor authentication really necessary?", a: "On a platform that moves money, yes — it is the difference between a stolen password being an inconvenience and being an incident. TOTP is enforced for every operator, and every MFA verification is itself audit-logged." },
    ],
  },
  {
    type: "Ecommerce",
    category: "E-commerce",
    techStack: ["Node.js", "Express", "MongoDB", "Redis", "Stripe API", "Tailwind CSS"],
    titles: [
      ["ShopSphere", "A full-featured online store with carts, checkout, and a merchant dashboard"],
      ["CartCraft", "Headless commerce toolkit powering custom storefronts and product experiences"],
      ["SwiftCart", "A storefront focused on speed: sub-second product pages on any connection"],
      ["BundleBox", "Subscription boxes with plan management, personalization, and billing"],
      ["MarketHive", "A multi-vendor marketplace with seller stores, commissions, and escrow"],
    ],
    overview:
      "E-commerce is the most user-hostile corner of software: one slow page, one confusing checkout, one invisible error, and the sale is gone. These projects are built around the opposite philosophy — product pages that render before the user notices, a checkout that asks for nothing unnecessary, and an inventory system that never lies. Server rendering, aggressive caching, and indexed queries are not optimizations here; they are the business model.",
    features: [
      "Product catalog with faceted filters, search, and cached list rendering",
      "Cart and checkout with guest mode, address validation, and payment intent flows",
      "Inventory management with atomic decrements — overselling is impossible by design",
      "Merchant dashboard with orders, revenue, and low-stock alerts",
      "Order lifecycle: confirmation emails, fulfillment statuses, and refund flows",
      "Zero-dependency product pages enhanced progressively with small scripts",
    ],
    architecture:
      "The storefront renders server-side with the shared glass design system, and the read paths run through the caching decorator: product pages are effectively static reads served from memory. The write paths — cart mutations, orders, inventory — run through the API discipline from the fintech projects: idempotency where money moves, validation before side effects, and an audit trail on every order event.",
    techDecisions: {
      title: "Key Technology Decisions",
      headers: ["Decision", "Choice", "Alternative Considered", "Why This Won"],
      rows: [
        ["Checkout", "Stripe Payment Intents", "Redirect-based providers", "Server-confirmed payments; native 3DS; no redirect friction"],
        ["Inventory", "Atomic decrement with checks", "Optimistic updates", "A race cannot oversell — the check and the decrement are one operation"],
        ["Product pages", "Server-rendered + cached", "Client-side rendering", "First paint is the product; caching makes reads nearly free"],
        ["Search", "Indexed text search", "Third-party search service", "Full-text index covers the catalog at this scale"],
        ["Images", "Pipeline-processed WebP", "Original uploads", "90% byte reduction; srcset for every device"],
      ],
    },
    realWorld:
      "The stress test that mattered: one product page hammered by a flash-sale simulation — five thousand concurrent visitors with a shared cache warming from cold. The page's data query runs once per cache TTL; the rest is memory reads and static assets from the CDN. The database never saw the traffic, and p95 latency stayed under 300ms through the entire spike.",
    metrics: [
      "5,000 concurrent visitors on one product page; DB sees ~1 query per TTL window",
      "Product page LCP under 1.2s on mid-range mobile, 4G",
      "Zero oversells across 10,000 simulated concurrent purchases",
      "Checkout completion tracked as the north-star metric; 41% above the baseline version",
    ],
    faqs: [
      { q: "How do you prevent overselling under concurrency?", a: "Inventory decrement is a single atomic operation with a stock check: MongoDB's findOneAndUpdate with a filter on available quantity. If stock is zero, the operation fails atomically and the cart is told the truth. No locks, no races, no oversells." },
      { q: "Why server-side rendering for a storefront?", a: "Because the first paint should be the product, not a spinner. Server rendering plus the caching decorator means product pages are instant on every device, and search engines see content in the first bytes — which is also why these stores rank." },
      { q: "How does guest checkout work without accounts?", a: "Guests get a session-scoped cart and a checkout that asks only for what the payment requires. Orders exist with an email but no account, and customers can claim them later by email link. Removing the account barrier was a measurable conversion win." },
      { q: "What happens when payment succeeds but the confirmation fails?", a: "The webhook is the source of truth: it confirms the payment intent, marks the order paid, and decrements inventory exactly once thanks to idempotency. A lost response just means the email is late, never that the order is wrong." },
      { q: "How do you keep product pages fast with huge catalogs?", a: "Faceted filters run on compound indexes that match the filter order, list queries are cached with short TTLs, and images are pipeline-processed to three sizes in WebP. The catalog can grow an order of magnitude before the architecture notices." },
    ],
  },
  {
    type: "AI",
    category: "AI & Automation",
    techStack: ["Node.js", "Express", "MongoDB", "OpenAI API", "Redis", "Tailwind CSS"],
    titles: [
      ["CodePilot AI", "An AI pair-programming assistant with context-aware suggestions and chat"],
      ["SummarizePro", "Meeting and document summarization that turns recordings into decisions"],
      ["ContentForge", "An AI-assisted CMS: briefs, drafts, and SEO metadata generated from one idea"],
      ["ReplyGenius", "Email and support drafting that matches your voice, trained on your history"],
      ["AutoDocs", "Documentation generation that keeps itself in sync with your codebase"],
    ],
    overview:
      "AI products are easy to prototype and hard to ship: the model is a dependency like any other, and the product is everything around it — prompts, memory, streaming, cost control, and the judgment of when the model should not answer at all. These projects treat the language model as a well-tested service with timeouts, retries, and budgets, and put the product surface — context, memory, and UX — in their own carefully built layers.",
    features: [
      "Streaming responses with cancel, regenerate, and edit-in-place interactions",
      "Context assembly: the right documents, history, and instructions reach the model on every call",
      "Cost and rate controls: per-user budgets, token accounting, and model tiering",
      "Human-in-the-loop everywhere: AI drafts, humans decide, actions are logged",
      "Prompt versioning with evaluation sets so a tweak cannot silently regress quality",
      "Fallback behavior when the model is unavailable, slow, or refuses",
    ],
    architecture:
      "The architecture treats the model as one more upstream service behind a dedicated client: structured timeouts, retry with backoff, and a circuit breaker that degrades gracefully. The product logic — what context to include, what the UI shows, what happens on failure — lives in services with the same discipline as any other feature. Prompt templates are versioned data, not scattered strings, and every generation is logged with its cost for the observability story.",
    techDecisions: {
      title: "Key Technology Decisions",
      headers: ["Decision", "Choice", "Alternative Considered", "Why This Won"],
      rows: [
        ["Model access", "Single client with circuit breaker", "Direct SDK everywhere", "One place owns timeouts, retries, and budgets"],
        ["Streaming", "Server-Sent Events", "WebSockets", "One-way stream fits chat; simpler failure model"],
        ["Context", "Assembled per request", "Always send everything", "Token budgets make context curation the core skill"],
        ["Prompts", "Versioned templates + eval sets", "Inline strings", "Changes are testable; regressions are caught before users"],
        ["Persistence", "Conversation logs in Mongo", "None", "Every generation auditable, replayable, and cost-accounted"],
      ],
    },
    realWorld:
      "The most instructive incident: a provider outage during a demo. The circuit breaker tripped, the UI degraded to a clear message with a retry button, and the session continued without the AI — which was the design intent. The product's principle is that the model is a feature, not the product; when the feature is unavailable, the product must still work. Every AI project here ships with that contract.",
    metrics: [
      "Cost per session tracked to the token; budgets enforced per user",
      "P50 first-token latency under 1.2s including model time",
      "Prompt regression suite: 40 eval cases run on every template change",
      "Graceful-degradation path proven by a real provider outage",
    ],
    faqs: [
      { q: "How do you control AI costs?", a: "Three levers: context curation (only the relevant documents reach the model), model tiering (cheap models for routine tasks), and hard per-user budgets with alerts. Every generation is logged with its token count, so cost is a dashboard, not a surprise." },
      { q: "What happens when the model API is down?", a: "The circuit breaker opens, the UI degrades gracefully, and the product keeps working without the AI features. The principle: the model is a feature, not the product. Users are told the truth and offered retry — no silent failures." },
      { q: "How do you evaluate prompt quality?", a: "A small evaluation set of representative inputs with expected behaviors runs on every prompt change. A tweak that improves one case but breaks another is caught before deployment, not by user complaints." },
      { q: "Why Server-Sent Events instead of WebSockets?", a: "Chat is a one-way stream — the client sends a prompt, the server streams tokens. SSE does that with HTTP, works through every proxy, and fails simply. WebSockets add bidirectional complexity for a direction the product does not need." },
      { q: "Is the AI a black box in the architecture?", a: "Deliberately not: every generation is logged with its prompt version, context, tokens, and latency. When quality regresses, the logs show exactly which version changed what. The black box is the model; the system around it is fully transparent." },
    ],
  },
  {
    type: "RealEstate",
    category: "Real Estate & Property",
    techStack: ["Node.js", "Express", "MongoDB", "Redis", "Leaflet Maps", "EJS"],
    titles: [
      ["EstateHub", "A property marketplace with maps, saved searches, and agent profiles"],
      ["HomeHunt", "A listing platform with neighborhood insights and price analytics"],
      ["RentDesk", "Tenant and landlord management: leases, payments, and maintenance"],
      ["PropFolio", "A portfolio tracker for real estate investors with ROI analytics"],
      ["OpenHouse", "Virtual tours and viewing scheduling for agents and buyers"],
    ],
    overview:
      "Property software lives and dies on data quality and search: a marketplace is only as good as its listing completeness, its map, and the filters that turn a wall of properties into the three that matter. These projects pair a structured listing model with a fast, facet-driven search layer, a live map, and the trust features — agent verification, saved searches, price alerts — that make a marketplace feel like a service rather than a bulletin board.",
    features: [
      "Faceted search: price, beds, area, type, and proximity filters with instant results",
      "Interactive map with clustered markers and draw-a-boundary search",
      "Saved searches and price-drop alerts delivered on a schedule",
      "Agent and agency profiles with verified listings and response tracking",
      "Listing lifecycle: draft, review, live, pending, sold — with audit history",
      "Photo galleries with dimensions-set images and lazy loading",
    ],
    architecture:
      "Listings are a document-shaped entity: the schema embeds the address, specs, and amenities that render together on the listing page, while proximity search runs on geospatial indexes with map bounding boxes. The search layer composes indexes the same way the blog indexes compose theirs — equality filters first, then range, then sort — so a ten-filter search still resolves in a single indexed pass.",
    techDecisions: {
      title: "Key Technology Decisions",
      headers: ["Decision", "Choice", "Alternative Considered", "Why This Won"],
      rows: [
        ["Maps", "Leaflet + geospatial index", "Heavy map SDKs", "Lightweight, dependency-free, boundaries drawn in-app"],
        ["Search", "Compound-index faceted queries", "Elasticsearch", "Full-text + filters at this scale need no cluster"],
        ["Listings", "Embedded document shape", "Normalized relational", "The listing page reads one document, not twelve tables"],
        ["Alerts", "Scheduled jobs", "Push infrastructure", "Email and in-app notifications with zero infrastructure"],
        ["Images", "CDN-processed galleries", "Origin serving", "Thumbnails and hero views served from the edge"],
      ],
    },
    realWorld:
      "The moment that mattered was a citywide search test: twenty thousand listings, a bounded polygon, seven active filters, and a sort on price — all served by one indexed query in under 80ms. The same search layer powers the price-drop alert job, which rescans the same indexed query on a schedule and queues notifications only for listings that changed. One design, two jobs.",
    metrics: [
      "20,000-listing faceted search resolved in under 80ms p95",
      "Map clustering keeps 1,000+ markers interactive on mobile",
      "Price-drop alerts generated by one indexed rescan, no manual lists",
      "Listing page LCP under 1.5s including gallery on 4G",
    ],
    faqs: [
      { q: "How does map-based search stay fast?", a: "Geospatial indexes answer bounding-box queries directly, and compound indexes resolve the facet filters in the same pass. The map draws clustered markers from the same query result, so the data is fetched once and rendered at every zoom level." },
      { q: "How do you keep listings accurate?", a: "The lifecycle is enforced: drafts are reviewed before going live, changes are versioned in an audit history, and agent-verified listings carry badges. Accuracy is a workflow, not a hope." },
      { q: "What powers the price-drop alerts?", a: "A scheduled job rescans the indexed search with a last-checked timestamp, compares prices, and queues notifications only for listings that actually changed. Users get alerts the same day a price drops — the feature that keeps buyers returning." },
      { q: "Why a geospatial document store instead of PostGIS?", a: "For this shape — document listings, faceted search, maps — the geospatial index answers every query in one pass, and the document model keeps the listing page a single read. PostGIS would win for heavy spatial analytics; that is not this product." },
      { q: "How are agents verified?", a: "Registration requires license proof, profiles are reviewed, and every listing is tied to its listing agent with visible contact. Trust in a marketplace is a moderation pipeline with humans in it — automation triages, humans decide." },
    ],
  },
  {
    type: "Social",
    category: "Social & Content",
    techStack: ["Node.js", "Express", "MongoDB", "Redis", "Socket.IO", "Tailwind CSS"],
    titles: [
      ["NoteNest", "A collaborative note-taking platform with rich text, sharing, and backlinks"],
      ["DevBench", "A community for developers: snippets, discussions, and daily challenges"],
      ["ReelTalk", "A short-form discussion forum with threads, reactions, and leaderboards"],
      ["BookClub", "A reading community with shelves, reviews, and live discussion rooms"],
      ["SkillShare Hub", "A peer learning platform where anyone can publish a course or teach a skill"],
    ],
    overview:
      "Social software is a moderation problem wearing an engineering costume: the feature list — feeds, threads, reactions, real-time presence — is the easy part; the product is the community it protects. These projects pair a real-time collaboration layer (shared editing, live presence, instant updates) with the hardening that keeps a community healthy: rate limits, content moderation pipelines, blocking, and the audit trail that makes abuse actionable.",
    features: [
      "Real-time presence and live updates via websockets, with offline reconnection",
      "Rich-text editing with autosave, version history, and concurrent-edit conflict handling",
      "Feeds and threads with pagination, reactions, and shareable permalinks",
      "Moderation queue: reports triaged by automation, decisions logged by humans",
      "Blocking and mute controls that fully sever interactions, server-side enforced",
      "Profiles, follower graphs, and digest notifications on a schedule",
    ],
    architecture:
      "The real-time layer is additive: every write goes through the same service discipline, then broadcasts through a presence channel; if the websocket layer fails, the page still works perfectly as server-rendered HTML. Moderation is a pipeline, not a page: automated checks on content ingest, a queue for human review, and decisions appended to an audit trail with the requester's identity and request ID.",
    techDecisions: {
      title: "Key Technology Decisions",
      headers: ["Decision", "Choice", "Alternative Considered", "Why This Won"],
      rows: [
        ["Real-time", "Socket.IO over HTTP/WS", "Custom WebSocket server", "Reconnection and rooms solved; two years of maintenance-free uptime"],
        ["Editing", "CRDT-free conflict resolution", "Operational transforms", "Field-level last-write-wins with version history is honest and simple"],
        ["Moderation", "Automated triage + human queue", "Full automation", "The model flags; humans decide; the audit trail proves both"],
        ["Feeds", "Cached indexed queries", "Fan-out service", "At community scale, cached reads beat prefabricated feeds"],
        ["Notifications", "Scheduled digest", "Instant push", "A digest respects attention; infrastructure stays simple"],
      ],
    },
    realWorld:
      "The community stress moment: a popular snippet went viral and 1,200 users opened the same discussion thread within minutes. The thread page is server-rendered and cached, the live-update layer broadcasts only presence and new replies, and the moderation pipeline absorbed 300 reports overnight — automated triage surfacing the six that needed humans. The database load chart for that evening looks like a straight line.",
    metrics: [
      "1,200 concurrent users on one thread; p95 render under 350ms",
      "300 overnight reports triaged automatically; 6 reached human review",
      "Autosave + version history with zero lost edits across 6 months",
      "Rate limits cut abusive-posting volume by 97% after enforcement",
    ],
    faqs: [
      { q: "How do concurrent edits not lose work?", a: "Autosave sends field-level updates with version stamps; conflicts resolve by last-write-wins and every version is stored, so no edit is ever lost — only superseded, and recoverable from history. Simple, honest, and auditable." },
      { q: "How does moderation balance speed and fairness?", a: "Automation triages everything on ingest — spam scoring, duplicate detection, link scrutiny — and escalates only the ambiguous cases to humans. Decisions are logged with reasons and are appealable. Speed from machines, judgment from people." },
      { q: "Why not full operational-transform editing like Google Docs?", a: "Because this product's concurrency is a note shared by a few people, not a document edited by dozens at once. Field-level versions cover the real cases with a tenth of the complexity; if the product ever needs OT, the storage layer is already versioned for it." },
      { q: "What happens when the websocket server restarts?", a: "Clients reconnect with exponential backoff, resume presence state from the server, and the page remains fully functional as server-rendered HTML meanwhile. The real-time layer is an enhancement, so its failure is a downgrade, not an outage." },
      { q: "How do you handle community growth without chaos?", a: "The same playbook as the architecture articles: bounded features, rate limits, moderation pipelines, and cached reads. Growth is handled by design — the system's shape — not by heroics during incidents." },
    ],
  },
];
