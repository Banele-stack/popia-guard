# popia-guard

Next.js frontend for **POPIAGuard** — POPIA compliance tracking for South African businesses and
the consultancies managing it for them. Backed by [popia-guard-api](../popia-guard-api) (NestJS +
TypeORM + Postgres, real multi-tenant auth) — same architecture as its sibling project
`compliance-pro`.

## Pages

- `/` — Dashboard: stats + a ranked "needs attention" feed across operators, processing
  activities, assessments and breaches
- `/operators` — Third parties who process personal information on your behalf (POPIA's own
  term), each with an "Add Operator" form and per-operator agreement upload
- `/operators/[id]` — Operator detail: agreement checklist (view/download/remove the actual
  signed file, add a new one)
- `/processing-activities` — Your Record of Processing Activities (ROPA), search/filter by
  status and data-subject category, with an "Add Activity" form
- `/processing-activities/[id]` — Full detail of one ROPA entry
- `/assessments`, `/assessments/new`, `/assessments/[id]` — Internal POPIA self-assessments
  against a checklist; a failed item automatically raises an open finding
- `/breaches`, `/breaches/[id]` — The data-breach log, with status changes and
  Regulator/data-subject notification tracking right on the detail page
- `/team` — Invite/remove teammates (admin-gated)
- `/settings` — Information Officer name/email + Information Regulator registration reference
  (admin-gated)
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/accept-invite` — real auth,
  wired to popia-guard-api

## Getting Started

```bash
npm install
# popia-guard-api must be running too — see ../popia-guard-api's README
# (npm run seed there gets you the demo tenant this app expects)
npm run dev
```

Open [http://localhost:4010](http://localhost:4010). Demo login: `demo@popiaguard.co.za` /
`POPIAGuard2026!`.

Or with Docker — `docker compose up` from `../popia-guard-api` starts Postgres + the API + this
frontend together.

## Still unsolved

- No file upload yet for organization-level policy documents (Privacy Policy, PAIA Manual) —
  only operator agreements have file attachments right now.
- No deployment/hosting done — local-only so far.
