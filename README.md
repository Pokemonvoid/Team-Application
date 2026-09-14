# Pokémon Void Recruitment Portal — Frontend Prototype

Static frontend prototype for the Pokémon Void development-team recruitment website.

## Current pages

- `index.html` — public recruitment landing page
- `apply.html` — four-stage application UI with Discord OAuth integration point
- `status.html` — applicant profile/status shell
- `interview.html` — applicant-facing asynchronous encrypted-ticket UI shell
- `admin.html` — Director queue/admin UI prototype using fake records only
- `help.html` — applicant FAQ
- `privacy.html` — draft technical privacy page
- `API_CONTRACT.md` — backend + Dark bot hand-off contract
- `assets/css/site.css` — shared Void-style UI
- `assets/js/site.js` — frontend-only interactions and preview behaviour

## Visual direction

The design intentionally follows the existing Pokémon Void wiki language rather than generic SaaS/AI-site styling:

- dark purple Void palette (`#9966ff`, `#cc99ff`, `#9980cc`)
- Verdana/Geneva/Tahoma-family typography
- hard-edged panels, rules and game-interface framing
- no stock imagery
- no generated imagery
- no glassmorphism
- no floating gradient blobs
- no oversized rounded cards
- no generic marketing illustrations

## Important security boundaries

This repository is frontend-only.

Never commit:

- applicant answers
- interview messages
- Discord OAuth client secrets
- Cloudflare API secrets
- D1 credentials
- encryption/decryption keys
- production session material

Discord OAuth code exchange, secure sessions, validation, spam filtering and database access must happen server-side through Cloudflare Workers.

## Application preview

Because real Discord OAuth is not wired yet, `apply.html` includes a small **Preview connected state** control. It exists only so the form flow can be reviewed without pretending the frontend has authenticated anyone.

Remove that control before production deployment.

## Director portal

`admin.html` contains fake example data only. Production application data must be loaded from authenticated `/api/director/*` endpoints. Hiding the page link is not security; the Worker API must enforce Director authorization on every request.

## Interview encryption

The interview page is only the UI shell. Do not implement the encrypted interview backend until the Directors have agreed on:

- who holds decryption keys
- whether the host/developer can ever decrypt content
- key recovery/loss behaviour
- device/session model
- metadata retention
- attachment encryption
- archive/deletion rules

## Local preview

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.
