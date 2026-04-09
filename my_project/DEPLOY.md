# Deploy for free (full stack)

There is no single company that gives you **always-on Django + MySQL + CDN** forever at **zero cost** with no limits. The usual **free** approach is:

1. **Frontend (React)** → Netlify, Vercel, or Cloudflare Pages (fast, reliable free tier).
2. **Backend (Django API)** → [Render](https://render.com) **free web service** (works, but **sleeps** after ~15 minutes idle; first request after sleep can take **30–60 seconds**).
3. **MySQL** → Must be **on the public internet** (your laptop MySQL will not work). Options:
   - **[TiDB Cloud Serverless](https://tidbcloud.com/)** — free tier, **MySQL-compatible** (good fit for this project; enable **SSL** and set `DB_SSL=true` if required).
   - **db4free.net** / similar — free MySQL for **demos only** (slow, can be unreliable).
   - **University / lab** MySQL with a public host (if allowed).

Your **business tables** stay `managed = False`; you still run `python manage.py migrate` once on the server so **Django’s** `auth`, `sessions`, etc. exist (same as locally).

---

## A. Backend on Render

1. Push this repo to GitHub (use folder **`my_project`** as the service **root** if the repo contains more than that).
2. In Render: **New → Blueprint** → select repo → point to `render.yaml`, **or** **New → Web Service** with:
   - **Root directory:** `my_project` (if needed)
   - **Build command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start command:** `gunicorn real_estate_api.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan:** Free
3. **Environment variables** (Render → Environment):

| Variable | Example |
|----------|---------|
| `DJANGO_DEBUG` | `false` |
| `DJANGO_SECRET_KEY` | long random string |
| `DJANGO_ALLOWED_HOSTS` | `your-service-name.onrender.com` |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | `https://your-service-name.onrender.com` |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | from your cloud MySQL |
| `DB_SSL` | `true` if the provider requires SSL (e.g. many cloud MySQL services) |
| `CORS_ALLOWED_ORIGINS` | `https://your-site.netlify.app` (your frontend URL, no trailing slash path) |

4. After first deploy, open **Shell** on Render (or run locally against cloud DB) and execute:

   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

5. Copy the API base URL, e.g. `https://your-service-name.onrender.com/api`.

**Cold starts:** the free web service sleeps; that is normal on Render’s free tier.

---

## B. Frontend on Netlify

1. **New site from Git** → choose repo.
2. **Base directory:** `my_project/frontend`
3. Build: `npm run build`, publish: `dist` (already in `frontend/netlify.toml`).
4. **Environment variable** for builds:

   - `VITE_API_URL` = `https://your-service-name.onrender.com/api`

5. Redeploy after changing env vars (Vite bakes them in at build time).

---

## C. “Fully working” checklist

- [ ] Cloud MySQL has your **`DBPROJECT`** schema (import SQL dump if you have one).
- [ ] `migrate` + `createsuperuser` ran against that database.
- [ ] `CORS_ALLOWED_ORIGINS` includes the exact `https://…` frontend origin.
- [ ] `VITE_API_URL` matches the Render API **including** `/api`.
- [ ] Staff user in Django admin has **Staff** checked if you use **Custom SQL** in the UI.

---

## If you need no sleep / faster API

Render’s **paid** starter plan, or **Railway**, **Fly.io**, or a small **VPS** (sometimes with student credits) — still cheap, not free.

---

## Files added for deployment

- `render.yaml` — optional Render Blueprint
- `runtime.txt` — Python version hint for Render
- `build.sh` — optional local/CI mirror of build steps
- `requirements.txt` — includes `gunicorn`, `whitenoise`
- `real_estate_api/settings.py` — WhiteNoise static files when `DEBUG=false`, optional `DB_SSL`
