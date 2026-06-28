# Production Deployment Guide

This guide prepares `kabirmahmud.xyz` for production on MongoDB Atlas, GitHub, and Vercel.

## 1. Production Architecture

```text
User
  -> Vercel Edge Network
  -> Vercel Node.js Serverless Function
  -> Express App
  -> MongoDB Atlas
```

The app uses:

- Express serverless entry: `api/index.js`
- Local server entry: `src/server.js`
- MongoDB connection caching for serverless reuse
- Tailwind production build via `npm run build`
- Structured JSON logs in production
- Secure HTTP-only session cookies
- Helmet, compression, rate limiting, CSRF, validation, and protected admin routes

## 2. MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a production project, for example `kabirmahmud-production`.
3. Create an M10+ dedicated cluster for serious production traffic. Free/shared clusters are fine only for testing.
4. Create a database user with a strong generated password.
5. Grant the user only the needed database permissions.
6. Add Vercel outbound access:
   - During initial setup, Atlas can allow `0.0.0.0/0` because Vercel uses dynamic serverless IPs.
   - For stricter production isolation, use a dedicated backend provider or Vercel Secure Compute/private networking if available in your plan.
7. Copy the SRV connection string.
8. Use a production database name:

```text
kabirmahmud_platform
```

Example:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/kabirmahmud_platform?retryWrites=true&w=majority
```

## 3. Atlas Backup Strategy

Use Atlas backups before launch.

Recommended policy:

- Enable scheduled cloud backups.
- Keep daily snapshots for at least 7 days.
- Keep weekly snapshots for at least 4 weeks.
- Keep monthly snapshots for at least 6 months.
- Test restore into a staging cluster before launch.
- Export critical content monthly using `mongodump` or Atlas export tools.

Before major releases:

```bash
mongodump --uri="$MONGODB_URI" --out="./backups/pre-release-YYYY-MM-DD"
```

Do not commit backup files to Git.

## 4. GitHub Setup

1. Create a private or public GitHub repository.
2. Initialize and commit:

```bash
git init
git add .
git commit -m "Initial production platform"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/kabirmahmud-platform.git
git push -u origin main
```

3. Protect `main`:
   - Require pull requests.
   - Require status checks.
   - Disable force pushes.
   - Require review before merging.

4. Never commit:
   - `.env`
   - MongoDB credentials
   - Session secrets
   - Backup dumps
   - Vercel project tokens

## 5. Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Framework preset: `Other`.
3. Build command:

```bash
npm run build
```

4. Output directory: leave empty.
5. Install command:

```bash
npm install
```

6. Production function entry:

```text
api/index.js
```

The `vercel.json` rewrite sends all traffic to the Express app.

## 6. Environment Variables

Add these in Vercel Project Settings.

Production:

```text
NODE_ENV=production
APP_NAME=Kabir Mahmud
APP_URL=https://kabirmahmud.xyz
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=long-random-secret
COOKIE_SECRET=long-random-secret
TRUST_PROXY=1
```

Generate strong secrets:

```bash
openssl rand -hex 64
```

Use different values for:

- Production
- Preview
- Local development

## 7. Domain Setup

1. In Vercel, add:

```text
kabirmahmud.xyz
www.kabirmahmud.xyz
```

2. Configure DNS at your domain registrar using Vercel’s displayed records.
3. Set `kabirmahmud.xyz` as the primary domain.
4. Ensure `APP_URL=https://kabirmahmud.xyz`.
5. Redeploy after setting the production domain.

## 8. Create First Admin

For local or one-time production setup:

```bash
npm run create-admin -- "Kabir Mahmud" admin@kabirmahmud.xyz "StrongPassword123"
```

For production, run this only from a trusted environment with the production `MONGODB_URI` loaded.

After creating the admin:

- Log in at `/admin/login`.
- Change the password through reset flow if needed.
- Remove any temporary credentials from terminals and notes.

## 9. Security Checklist

Before launch:

- `NODE_ENV=production`
- `APP_URL` uses HTTPS production domain.
- `SESSION_SECRET` is strong and unique.
- `COOKIE_SECRET` is strong and unique.
- `TRUST_PROXY=1` on Vercel.
- MongoDB Atlas password is strong.
- Admin password is strong.
- Atlas backups are enabled.
- `/admin` is protected.
- CSRF is active on forms.
- Rate limiting is enabled.
- Helmet security headers are active.
- No secrets are committed.
- `.env` is ignored by Git.
- Vercel preview deployments do not point to production data unless intentional.

## 10. Logging

Production logs are written as JSON through `src/core/utils/logger.js`.

View logs in:

- Vercel Project
- Deployments
- Functions
- Runtime Logs

Useful events to monitor:

- `Failed to start application`
- `Serverless request bootstrap failed`
- `Request failed`
- MongoDB connection errors
- 401/403 spikes
- 500 responses

## 11. Error Monitoring

Recommended production monitoring:

- Sentry for exception tracking.
- Better Stack, Axiom, or Logtail for log search.
- Vercel Analytics for traffic and Web Vitals.
- MongoDB Atlas alerts for database health.

Minimum alert rules:

- HTTP 500 error spike.
- Function timeout spike.
- MongoDB connection failures.
- Atlas CPU above 80%.
- Atlas storage above 80%.
- Unusual login failure spike.

## 12. Performance Checklist

Already implemented:

- Compression
- Static asset caching
- Public page caching
- Sitemap/RSS caching
- Tailwind production build
- Lazy image loading
- Async image decoding
- Server-rendered EJS
- Minimal browser JavaScript

Before launch:

```bash
npm install
npm run build
npm run lint
```

After deployment:

- Test homepage on mobile and desktop.
- Test `/sitemap.xml`.
- Test `/robots.txt`.
- Test `/rss.xml`.
- Test `/admin/login`.
- Test one blog post page.
- Test one project page.
- Test several tool pages.
- Run Lighthouse.
- Check Vercel Web Vitals.

## 13. Rollback Plan

If production breaks:

1. Open Vercel project deployments.
2. Select the last healthy deployment.
3. Click promote or rollback.
4. Check runtime logs.
5. If the issue touched data, restore Atlas snapshot to a staging cluster first.
6. Patch, test, and redeploy.

## 14. Deployment Checklist

Pre-deploy:

- Dependencies install successfully.
- `npm run build` passes.
- `npm run lint` passes.
- `.env.production.example` is complete.
- Vercel env vars are set.
- Atlas cluster is reachable.
- Atlas backups are enabled.
- Admin user exists.
- GitHub main branch is protected.

Deploy:

- Push to GitHub.
- Import or redeploy on Vercel.
- Verify build logs.
- Verify runtime logs.
- Attach production domain.
- Confirm HTTPS.

Post-deploy:

- Visit `/`.
- Visit `/blog`.
- Visit `/projects`.
- Visit `/tools`.
- Visit `/sitemap.xml`.
- Visit `/robots.txt`.
- Log in to `/admin/login`.
- Create a draft post.
- Publish a test post.
- Confirm sitemap includes it.
- Run Lighthouse.
- Configure monitoring alerts.
