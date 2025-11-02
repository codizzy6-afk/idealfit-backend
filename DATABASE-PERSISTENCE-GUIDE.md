# Database Persistence Guide - Render Deployment

## Problem
Render's free tier uses ephemeral storage. On redeploy, your SQLite database is **deleted**, losing:
- Size charts
- Merchant accounts
- Customer submissions
- Invoices
- Analytics data

## Solutions

### Option 1: Render Managed PostgreSQL (RECOMMENDED)
**Cost:** $7/month (Starter plan)
**Pros:** 
- Persistent across redeployments
- Auto backups
- Scalable
- Best for production

**Setup Steps:**
1. In Render dashboard, click "New" → "PostgreSQL"
2. Name: `ideal-fit-db`
3. Database: `idealfit_production`
4. User: `idealfit_user`
5. Copy the Internal Database URL
6. Update `render.yaml`:

```yaml
services:
  - type: web
    name: ideal-fit-app1
    env: node
    plan: starter  # Upgrade to paid plan
    rootDir: ideal-fit
    # ... rest of config
    envVars:
      - key: DATABASE_URL
        value: ${DB.INTERNAL_DATABASE_URL}  # Use PostgreSQL
```

7. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

8. Run migration locally:
```bash
npx prisma migrate dev --name add_postgresql
```

9. Deploy to Render

---

### Option 2: Free PostgreSQL (Supabase/Railway)
**Cost:** FREE
**Pros:** Free PostgreSQL
**Cons:** External service, potential downtime

**Setup with Supabase:**
1. Go to https://supabase.com
2. Create free account
3. Create new project
4. Go to Settings → Database
5. Copy connection string
6. Add to Render environment variables:
   - `DATABASE_URL=postgresql://user:pass@host/db`
7. Update `prisma/schema.prisma` to use `postgresql`
8. Deploy

**Setup with Railway:**
1. Go to https://railway.app
2. Create account
3. New Project → Add PostgreSQL
4. Copy PostgreSQL URL
5. Add to Render as `DATABASE_URL`
6. Update Prisma schema
7. Deploy

---

### Option 3: Render Persistent Disk (Alternative)
**Cost:** $10/month per 10GB
**Pros:** Can still use SQLite
**Cons:** More expensive than PostgreSQL, less scalable

Not recommended for production apps.

---

## Current Workaround (Temporary)
Your data will reset on every redeploy. To avoid losing data:
1. Keep backups of your size chart
2. Export data periodically
3. Re-enter size chart after deploys

---

## Recommended Action
**Upgrade to Render Starter plan + PostgreSQL:**
- Cost: $7/month (database) + $7/month (web service) = **$14/month**
- Full persistence and production-ready
- You're building a revenue-generating app, so this is a worthwhile investment

---

## Migration Steps (PostgreSQL)

1. **Create PostgreSQL database on Render**
2. **Update Prisma schema:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Create migration:**
```bash
npx prisma migrate dev --name add_postgresql
```

4. **Update render.yaml:**
```yaml
envVars:
  - key: DATABASE_URL
    value: ${DB.INTERNAL_DATABASE_URL}
```

5. **Deploy:**
```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

Render will automatically run `npm run setup` which includes `prisma migrate deploy`.

---

## Alternative: Run on Railway (All-in-One)
Railway offers PostgreSQL + Web service together:
1. Sign up at https://railway.app
2. New Project → Provision PostgreSQL + GitHub Repo
3. Automatically deploys with PostgreSQL included

This is often cheaper and simpler than Render.

---

## Questions?
Contact support or check:
- Render Docs: https://render.com/docs/managed-postgres
- Prisma Docs: https://prisma.io/docs

