Summary of actions performed:

- Removed front-end-only and deprecated packages from `backend/package.json`:
  - Removed `html2canvas`, `jspdf`, `react-datepicker`, `crypto`
  - Uninstalled them from `node_modules` and updated `package-lock.json`

- Applied non-breaking package updates via `npm update`.
  - Result: `npm audit` vulnerabilities reduced from 10 (including 1 critical) to 2 (both high): `cloudinary` and `multer-storage-cloudinary`.

- Fixed multiple ESLint warnings (unused imports/params, improved error logging).
  - Added minimal ESLint flat config and lint script for `backend`.
  - Ensured `npm run lint` exits cleanly (no warnings/errors remain).

Remaining issues and recommended next steps:

1. Upgrade `cloudinary` to `^2.8.0` and `multer-storage-cloudinary` to `2.2.1` (both are major upgrades). These changes may be breaking and require:
   - Review of `cloudinary` API changes and how `multer-storage-cloudinary` integrates.
   - Tests of image upload, deletion, and storage flows (admin product create/update, deletion).
   - Update any code snippets that rely on old Cloudinary APIs.

2. Upgrade any remaining pinned dependencies (e.g., `mongoose` major bump to v9) with appropriate testing and migration steps.

3. Add CI workflow (GitHub Actions) that runs `npm ci`, `npm run lint`, `npm audit --audit-level=moderate`, and unit tests.

4. Add basic unit/integration tests around auth, checkout/payment verification, and product image upload flows to catch regressions from library upgrades.

Suggested PR title/body (copy-paste into GitHub PR):

Title: chore(deps): remove frontend deps from backend, apply safe upgrades, and fix lint

Body:
- Removed stray frontend deps from `backend` and uninstalled deprecated `crypto` package.
- Applied non-breaking `npm update` to bump patch/minor versions.
- Fixed ESLint warnings and added minimal ESLint config and `lint` script.
- Result: reduced vulnerabilities from 10 → 2 (both are `cloudinary`-related and need major upgrades).

Next steps: test and upgrade `cloudinary` and `multer-storage-cloudinary`, add CI, and add tests for critical flows.

If you'd like, I can open the PR for you or continue and attempt the major upgrades with safe fallbacks and tests.