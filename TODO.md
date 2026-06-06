# TODO - Dataset import + remove login

- [x] Refactor CSV import logic so it can be reused by both the management command and a new upload API endpoint.

- [x] Add backend endpoint: `POST /api/dataset/import/` to accept an uploaded CSV + `clear` option.

- [x] Disable authentication/permissions so dashboard/report/sales endpoints work without login.

- [x] Update frontend: remove `/login` route, auth guard, JWT interceptors/refresh/redirects.

- [x] Update frontend layout: remove logout/user avatar/name/role.

- [x] Add frontend “Import dataset” UI that uploads CSV and then fetches dashboard KPIs.

- [ ] Update README to document new import flow and remove login instructions.
- [ ] Test end-to-end (import -> dashboard renders) and fix any errors.


