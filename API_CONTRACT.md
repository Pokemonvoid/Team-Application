# Pokémon Void Recruitment Portal — Backend/API Contract Draft

This is the hand-off boundary between the static frontend, Cloudflare backend and Dark's tertiary Discord notification bot.

## Security rule

The browser never talks directly to D1. All reads/writes go through authenticated Cloudflare Worker endpoints. Every Director endpoint must validate the current Discord session against the server-side Director allowlist/role policy.

## Applicant endpoints

- `GET /auth/discord/start`
  - Creates OAuth state server-side and redirects to Discord.
- `GET /auth/discord/callback`
  - Exchanges Discord code server-side, creates secure session and redirects to portal.
- `POST /auth/logout`
- `GET /api/me`
  - Basic recruitment profile: Discord id, display name/avatar if retained, account state.
- `GET /api/application/me`
  - Returns only the logged-in applicant's active application and permitted status information.
- `POST /api/application`
  - Creates application after server-side validation, rate-limit and spam checks.
- `PATCH /api/application/me`
  - Optional draft/edit endpoint before review begins.
- `GET /api/interview/me`
  - Future encrypted ticket metadata/ciphertext only, according to the final encryption design.
- `POST /api/interview/me/messages`
  - Future encrypted applicant message submission.

## Director endpoints

All `/api/director/*` endpoints must reject non-Director sessions regardless of what the frontend shows.

- `GET /api/director/applications?status=NEW`
- `GET /api/director/applications/:id`
- `POST /api/director/applications/:id/claim`
- `POST /api/director/applications/:id/hold`
- `POST /api/director/applications/:id/request-info`
- `POST /api/director/applications/:id/invite-interview`
- `POST /api/director/applications/:id/decline`
- `POST /api/director/applications/:id/accept`

## Bot integration

Dark's bot should not receive or store full applications/interview content.

Suggested backend-to-bot event payloads:

### New application

```json
{
  "event": "application.created",
  "application_id": "PV-24018",
  "role": "Pixel Artist / Spriter",
  "status": "NEW",
  "flagged": false
}
```

### Applicant notification

```json
{
  "event": "applicant.notify",
  "discord_user_id": "1234567890",
  "notification_type": "interview_invite",
  "application_id": "PV-24018"
}
```

Do not put confidential answers or interview text in Discord webhook payloads unless the Directors explicitly redesign that requirement.

## Frontend hosting

The current site is static and can be hosted on GitHub Pages. No production secrets or confidential records belong in the repo.
