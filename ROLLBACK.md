# Rollback playbook

Quick reverts for the riskier changes shipped in commit `4934e3e` (Audit fixes: security, perf, a11y, encoding — 37 items).

## CSP (most likely to need rollback)

Symptom: Any browser console error `Refused to load … because it violates the following Content Security Policy directive`.

Fix:
1. Edit `vercel.json`
2. Change the response header key from `Content-Security-Policy` back to `Content-Security-Policy-Report-Only`
3. Commit + push — Vercel auto-deploys in ~1 min
4. Violations now log to `/api/csp-report` without blocking

The CSP allowlist:

```
default-src 'self'
script-src 'self' 'unsafe-inline'
style-src  'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com
font-src   'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com
img-src    'self' data: blob: https://*.supabase.co
media-src  'self' https://*.supabase.co
connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io
```

To allow a new external host, add it to the matching directive in `vercel.json` and redeploy.

## Hero video re-encode

Symptom: Hero plays glitched, doubled, or doesn't play.

Fix: revert commits `29bc93e` (output-side seek re-trim) and/or `2f5467c` (initial trim) — restores the original 16 MB Hero4.mp4.

```bash
git revert 29bc93e 2f5467c
git push origin main
```

## Source-file blocks (vercel.json redirects)

Symptom: a legitimate file path returns 307 unexpectedly.

The blocked patterns: `/server.js`, `/api/*.js`, `/package*.json`, `/video-mapping.json`, `/chatbot-widget.html`, `/.env*`, `/.git/*`, `/.vercel/*`.

Fix: remove the offending entry from `redirects` in `vercel.json`.

## Admin mass-assignment hardening

Symptom: admin form submission fails to write a field that used to work.

Cause: `stripProtectedFields()` in `server.js` blocks client-side writes to `id`, `created_at`, `race_id`, etc.

Fix: review `stripProtectedFields()` in `server.js` and either (a) remove the field from the protected list or (b) write that field server-side using a derived value.

## Full revert (nuclear option)

```bash
git revert 4934e3e
git push origin main
```

Reverts the entire audit commit. Use only if multiple regressions appear and isolating which one is faster to do from `main` than from a per-area revert.

## Vercel instant rollback (no git)

Vercel dashboard → Deployments → previous READY deploy → Promote to Production. Bypasses git entirely; use this for live emergencies. Inspector URL for the prior good deploy: `dpl_DAcUgfgJRrPAi8i2pYn7z1UheEyu` (`why-racing-site-lzlt0lpxn`).
