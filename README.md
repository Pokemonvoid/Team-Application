# Pokémon Void Recruitment Portal

Frontend repository for the Pokémon Void development recruitment portal.

## What this repository contains

- Public recruitment home page
- Multi-step application form
- Applicant status page
- Interview ticket interface shell
- Director portal interface shell
- Help and privacy pages
- Frontend integration points for Discord OAuth and the Cloudflare backend

## Hosting boundary

This repository is suitable for static hosting such as GitHub Pages. It must contain public frontend code only.

Do **not** commit:

- Discord client secrets
- Cloudflare API tokens
- database credentials
- applicant records
- interview contents
- private uploads
- encryption keys
- production session data

Private recruitment data belongs on the backend.

## Current backend expectation

The frontend expects a Cloudflare Worker API and D1 database. Set the public API origin in:

`assets/js/config.js`

Example:

```js
window.VOID_RECRUITMENT = {
  apiBaseUrl: "https://recruitment-api.example.workers.dev",
  discordLoginPath: "/auth/discord"
};
```

The API contract is documented in `API_CONTRACT.md`.

## GitHub Pages

Keep `index.html` at the repository root and publish the `main` branch from `/ (root)`.

All internal site links are relative, so the portal works from a GitHub Pages project path such as:

`https://username.github.io/repository-name/`

## Interview tickets

The interview interface is intentionally not wired for sending messages yet. The confidentiality and encryption model should be approved by the Directors before that feature is enabled.
