# Deployment Guide (Render backend + Netlify frontend)

## Overview
This guide lists steps and environment variables to deploy the backend to Render and the frontend to Netlify. It also includes notes about scheduled jobs, CORS, cookies and Socket.IO.

---

## Backend (Render)

1. Create a new **Web Service** on Render and connect to this repository. Set the Root to the `backend/` folder.
2. Build command: leave default (Render runs `npm install`).
3. Start command: `npm start` (this runs `node server.js`).
4. Environment variables: set values from `backend/.env.example`. Important ones:
   - `NODE_ENV=production`
   - `MONGO_URI` (MongoDB Atlas recommended)
   - `JWT_SECRET` (secure secret)
   - `FRONTEND_ORIGIN` (comma-separated list of allowed frontend domains, e.g. `https://your-site.netlify.app`)
   - `ENABLE_SCHEDULED_RUNNER=false` (by default, disable scheduled runner on web service; enable in a dedicated background worker if needed)
5. Health check: Render can use `GET /health` to confirm readiness (returns { status: 'ok' }).
6. If you need scheduled exports to run reliably, create a separate **Background Worker** or **Scheduled Job** in Render with `ENABLE_SCHEDULED_RUNNER=true`.
7. Socket.IO: allowed origins are read from `FRONTEND_ORIGIN`. Ensure your Netlify/static domain(s) are included.

---

## Frontend (Netlify)

1. Create a new site on Netlify and connect the React app (folder `summer` if using `create-react-app` here).
2. Build command: `npm run build`.
3. Publish directory: `build`.
4. Add env vars:
   - `REACT_APP_SERVER_ENDPOINT` -> `https://<your-render-backend-url>`
   - `REACT_APP_GOOGLE_CLIENT_ID` -> (if using Google OAuth)
5. Ensure Netlify site has HTTPS enabled (Netlify provides it by default).
6. Build picks up `REACT_APP_*` env vars at build time.

---

## Notes & Troubleshooting

- Cookies: backend sets cookies with `Secure` and `SameSite=None` when `NODE_ENV=production`. Ensure frontend runs from an HTTPS origin and `FRONTEND_ORIGIN` includes the exact origin.
- CORS: backend's `corsConfig` uses `FRONTEND_ORIGIN` (comma separated). Confirm that includes both `https://your-site.netlify.app` and `https://www.your-custom-domain.com` if necessary.
- Socket.IO: the server reads `FRONTEND_ORIGIN` for allowed origins. If sockets fail, check console/network and server logs for CORS or handshake errors.
- Scheduled Jobs: For reliability, run heavy/cron-like tasks in a dedicated background worker or scheduled job (Render supports scheduled jobs and background workers).

---

If you'd like, I can make a PR with these changes and include deployment checklist and Render/Netlify step-by-step UI guidance.
