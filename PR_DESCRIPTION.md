Title: chore: make app deploy-ready (Render + Netlify)

Summary:
- Make backend CORS & Socket.IO origins configurable via FRONTEND_ORIGIN env (comma-separated)
- Change start script to node server.js
- Add /health endpoint and trust proxy for PaaS readiness checks
- Add ENABLE_SCHEDULED_RUNNER env to gate scheduled runner; recommend running scheduled jobs as a Worker/Job
- Add backend and frontend .env.example and DEPLOYMENT.md
- Fix small ESLint warnings

Files changed:
- backend/server.js, backend/src/middleware/securityMiddleware.js, backend/package.json
- backend/.env.example, DEPLOYMENT.md, summer/.env.example
- summer/src/utils/axiosSetup.js and several frontend lint fixes
- Added render.yaml and netlify.toml

Checklist:
- [x] CORS and Socket.IO origins configurable via FRONTEND_ORIGIN
- [x] Start script updated to node server.js
- [x] Health endpoint /health added
- [x] Scheduled runner gate via ENABLE_SCHEDULED_RUNNER
- [x] .env examples and deployment guide added
- [ ] Reviewers or CI to run full test and deploy to a staging target

Notes:
- For production, set NODE_ENV=production, FRONTEND_ORIGIN to your Netlify/production host (comma-separated), and REACT_APP_SERVER_ENDPOINT to the Render service URL for the frontend build.
- Consider running scheduled exports in a separate Render Background Worker or Scheduled Job for reliability.
