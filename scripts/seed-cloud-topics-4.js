export const CLOUD_TOPIC_SETS_D = [
  {
    category: "MongoDB",
    tags: ["mongodb", "atlas", "cloud", "managed-db", "operations"],
    titles: [
      "MongoDB Atlas: The Managed Database Cloud Explained",
      "Setting Up MongoDB Atlas the Right Way: Clusters, Users, and Security",
      "Atlas vs Self-Hosted MongoDB: When Managed Is Worth the Price",
      "Monitoring MongoDB in Production: What to Watch Before It Breaks",
      "Backups, Restores, and Disaster Recovery for MongoDB",
    ],
    intro: [
      "MongoDB Atlas is the managed cloud version of MongoDB — the database running behind most MongoDB-backed production apps, including the platform powering this site. It takes the most tedious and failure-prone parts of running a database — installation, patching, replication, backups, monitoring — and turns them into dashboard settings with SLAs attached.",
      "The shift matters more than it sounds. A self-hosted MongoDB has no single hard step, but it has a thousand small ones: replica set elections, oplog sizing, backup windows, TLS, storage warnings, and the quiet fear that the disk will fill at 3 a.m. Atlas removes nearly all of them and replaces the worry with a well-lit dashboard.",
      "This guide covers what Atlas actually is, the setup that avoids the common misconfigurations, the honest economics of managed versus self-hosted, the metrics that predict trouble, and the backup and recovery story that every production database needs.",
    ],
    why: [
      "The database is the least forgiving component in any stack: it must be durable, consistent, and fast simultaneously, and its failures are the most expensive kind. A managed service does not change the physics — it changes the staffing. The provider's engineers handle replication, patching, and incident response for thousands of clusters, and you inherit their competence.",
      "The operational features are the real value: continuous backups with point-in-time restore, performance advisor insights, built-in monitoring and alerts, and automated TLS. Each one is a feature you would otherwise build, configure, and forget to verify — and the verification is exactly where self-hosted setups break.",
    ],
    whyBullets: [
      "Replica sets, patching, and failover are managed — the provider's engineers run them",
      "Backups are continuous and restorable to any point in time",
      "Monitoring, alerts, and performance advice come with the platform",
      "TLS, network isolation, and access controls are first-class settings",
      "Free tier (M0) and shared tiers make real production features available at $0",
    ],
    problem: [
      "The self-hosted failure cascade is familiar to anyone who has run MongoDB: unauthenticated access on a public IP (the ransom-ware honeypot), a replica set with no backups because 'the app works', a disk that fills silently, and the discovery during an incident that the backup was never tested. Each step is individually boring; together they are the industry's most common database story.",
      "The managed-side failure mode is different: clicking through setup without understanding the settings. A default Atlas cluster is secure by default (network-restricted, authenticated), but the defaults also hide the decisions — region placement, instance sizing, backup policy — that show up later as latency, cost, or recovery gaps.",
    ],
    approach: [
      "The Atlas mental model is three concentric layers. The cluster is the compute: a replica set of three nodes (or sharded clusters beyond that) that Atlas creates and operates for you. The users and network rules are the access layer: database users for applications, plus IP allow lists or private networking for connections. The services layer — backups, monitoring, performance advisor — watches and protects the data continuously.",
      "Setup in the right order: choose the region near your users, pick a tier honestly matched to the workload, create an application user with the least privileges needed (readWrite on the app database, never a global owner for app connections), and restrict network access to your real IPs or private network. Then verify the backup schedule and set alert thresholds for the metrics that predict trouble.",
    ],
    code: "```bash\n# Connecting to Atlas from an application — the secure pattern\n# Connection string (never hardcode; use env vars)\nMONGODB_URI=\"mongodb+srv://appUser:*****@cluster0.abcde.mongodb.net/myapp?retryWrites=true&w=majority\"\n\n# Least-privilege app user via shell (or Atlas console)\ndb.createUser({\n  user: 'appUser',\n  pwd: '********',\n  roles: [{ role: 'readWrite', db: 'myapp' }]\n})\n\n# Network access: allow only your deployment's egress IP or a private link\n# Atlas console -> Network Access -> Add IP Address (single IP, not 0.0.0.0/0)\n```",
    codeLead: "The secure connection pattern: an environment-variable URI with retryWrites and majority read concern, a least-privilege application user scoped to one database, and network access restricted to real addresses. The default settings are safe; the discipline is in not loosening them.",
    comparison: {
      title: "Atlas vs Self-Hosted MongoDB",
      headers: ["Factor", "Atlas", "Self-Hosted"],
      rows: [
        ["Setup time", "Minutes, dashboard-driven", "Hours to days, careful work"],
        ["Replication & failover", "Automated", "You configure and test it"],
        ["Backups", "Continuous, point-in-time", "Your scripts, your verification"],
        ["Monitoring", "Built-in, alerting included", "You build or integrate it"],
        ["Patching", "Provider-managed", "Your maintenance windows"],
        ["Cost", "Premium over compute", "Hardware + your time + risk"],
        ["Best for", "Most production apps", "Compliance, exotic configs, cost-at-extreme-scale"],
      ],
      note: "The honest comparison is time and risk, not just price. Managed costs more in dollars and less in everything else. Most applications — especially teams of one to five — are cheaper on Atlas once their own hours are priced in.",
    },
    implementation: [
      "The implementation path: provision the cluster, apply the access layer (user + network rules), and connect the application through an environment variable. Then turn on the operational layer — continuous backups, alert thresholds for the metrics in this guide, and the performance advisor's index suggestions reviewed monthly.",
      "The two habits that keep it healthy: review the slow-query and index-advice reports on the calendar (the advisor suggests indexes based on real query patterns, which is the cheapest performance work you will ever do), and run a restore drill quarterly — restore last night's backup to a temporary cluster and verify the application boots against it.",
    ],
    implBullets: [
      "Region before everything: latency follows users, not the dashboard default",
      "Least-privilege app user scoped to one database; owner roles reserved for humans",
      "Network access restricted to real IPs or a private link — never 0.0.0.0/0",
      "Connection string in env vars with retryWrites=true and majority read concern",
      "Continuous backups with point-in-time restore enabled from day one",
      "Quarterly restore drill: restore to a temp cluster and boot the app against it",
    ],
    decisions: [
      { heading: "Atlas or self-hosted?", text: "Atlas until the bill or a compliance requirement says otherwise. The self-hosted argument is concrete cost at extreme scale or regulatory control — and even then, most teams underestimate the engineering time. The managed premium buys reliability you would otherwise have to build." },
      { heading: "Which tier and size?", text: "Start with the free or shared tier for development, then move to a dedicated tier sized for real traffic with headroom. Right-size by watching actual CPU and memory from the metrics panel after launch — the advice panel tells you more than any benchmark." },
    ],
    mistakes: [
      "The classic Atlas mistakes are access-shaped: application users with global roles, network access open to the world, and connection strings committed to repositories. The database is secure by default — every one of these mistakes is a deliberate loosening that gets copied from tutorial to tutorial.",
      "The second cluster is operational: backups left at defaults without verification, alerts configured for everything so alerts are read as nothing, and no restore drill until the first real incident. The monitoring section of this guide is the fix.",
    ],
    mistakesBullets: [
      "App user with dbAdmin or owner roles — one SQL-injection-adjacent bug from full access",
      "Network access 0.0.0.0/0 — the ransom-ware honeypot configuration",
      "Connection string in the repository, scanner-harvested within hours",
      "Backups enabled but never restored — the 'we have backups' illusion",
      "Alert fatigue: 40 thresholds, none of them the disk or the connection pool",
    ],
    practice: [
      "This week: audit your Atlas project (or open one and follow this guide). Check every user's role, every network rule, the backup schedule, and the alert list. Fix the user roles and network rules even if nothing else — they are the difference between secure and scanned.",
      "Quarterly, run the restore drill. A database you have never restored is a database you have never tested.",
    ],
    takeaways: [
      "Atlas is MongoDB with the operations removed: replication, patching, backups, monitoring",
      "Setup order matters: region, tier, least-privilege user, network rules, backups",
      "Secure by default means never loosening the access layer",
      "The performance advisor's index suggestions are the cheapest performance work available",
      "Monitoring exists to be read: alert on the metrics that predict trouble, not everything",
      "A database that has never been restored has never been backed up",
    ],
    faqs: [
      { q: "Is Atlas free to start?", a: "Yes — the M0 shared cluster is free forever with real features: replica set, TLS, and backups. It is genuinely suitable for development, prototypes, and low-traffic production. Dedicated tiers start at a modest monthly price and add capacity and performance features." },
      { q: "How do I keep Atlas secure?", a: "The defaults are already safe; the risks are what you loosen. Use least-privilege users scoped to one database, restrict network access to real IPs or a private link, keep connection strings out of repositories, and rotate credentials on the calendar." },
      { q: "What happens if the cluster fails?", a: "Replica set elections fail over automatically in seconds — that is the architecture's job. If a whole region fails, Atlas provides multi-region clusters for higher durability, and your continuous backups restore elsewhere. The restore drill in this guide verifies the plan actually works." },
    ],
    conclusion: [
      "Atlas is what happens when a database provider takes the boring parts seriously: replication, patching, backups, and monitoring run by people whose entire job is running them.",
      "Set the access layer tight, read the advisor, and restore a backup every quarter. A managed database with discipline is as close to set-and-forget as production infrastructure gets.",
    ],
  },
];
