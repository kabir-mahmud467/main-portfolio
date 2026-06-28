# Production Checklist

## Required Environment Variables

- `NODE_ENV=production`
- `APP_NAME=Kabir Mahmud`
- `APP_URL=https://kabirmahmud.xyz`
- `MONGODB_URI=mongodb+srv://...`
- `SESSION_SECRET=...`
- `COOKIE_SECRET=...`
- `TRUST_PROXY=1`

## Launch Gates

- MongoDB Atlas production cluster created.
- Atlas backups enabled.
- GitHub repository pushed.
- Vercel project connected to GitHub.
- Vercel environment variables configured.
- Production domain connected.
- HTTPS active.
- Admin user created.
- `npm run build` passes.
- `npm run lint` passes.
- `/sitemap.xml` works.
- `/robots.txt` works.
- `/rss.xml` works.
- `/admin/login` works.
- No secrets are committed.

## Monitoring

- Vercel runtime logs checked.
- Vercel Analytics enabled if available.
- Atlas alerts enabled.
- Error monitoring provider selected.
- Backup restore process tested.
