# Recruitment Backend Contract

This document defines the intended boundary between the public recruitment frontend, the Cloudflare backend, and the optional Discord notification bot.

## Security boundary

The browser must never receive or contain:

- Discord client secret
- Cloudflare service secrets
- database credentials
- Director permission lists that are trusted without server verification
- interview decryption keys that belong only to another user or role

The backend must enforce access on every protected request. Hiding a page or button in the browser is not access control.

## Authentication

### `GET /auth/discord?returnTo=<url>`
Starts Discord OAuth.

The backend should request the minimum Discord scope needed to identify the user, validate OAuth state, create a secure session, and return the user to an allow-listed site URL.

### GitHub Pages and cross-origin sessions

If the frontend is hosted on `github.io` and the Worker uses `workers.dev`, they are different sites. Do not assume a third-party session cookie will work reliably in every browser. Before launch, choose and test one deliberate production session model, preferably either:

- a custom domain arrangement where the frontend and API are under the same parent site, with strict CORS and secure cookies; or
- a reviewed OAuth/session exchange suitable for a static frontend.

Whatever model is selected, allow only the exact recruitment-site origin in CORS, never `*` for credentialed requests, and keep Discord client secrets server-side.

### `GET /api/session`
Returns the current signed-in user or an unauthenticated response.

Suggested response:

```json
{
  "user": {
    "id": "discord-user-id",
    "username": "username",
    "globalName": "Display Name"
  },
  "roles": {
    "director": false
  }
}
```

### `POST /auth/logout`
Ends the current recruitment session.

## Applicant endpoints

### `POST /api/application`
Creates an application for the signed-in Discord user.

The backend should reject duplicate active applications, enforce rate limits, run the agreed spam checks, and derive the Discord user ID from the authenticated session rather than trusting a user ID supplied by the browser.

Expected body shape:

```json
{
  "profile": {
    "name": "Applicant name",
    "timezone": "NZST/NZDT",
    "pronouns": "they/them",
    "ageGroup": "18–24"
  },
  "general": {
    "experience": "...",
    "interest": "...",
    "critique": "...",
    "pokemonProjects": "...",
    "timeCommitment": "...",
    "anythingElse": "..."
  },
  "roles": ["programmer", "spriter"],
  "roleDetails": {}
}
```

Allowed age values:

- `Under 18`
- `18–24`
- `25–29`
- `30+`

Age does not change eligibility to apply.

### `GET /api/application/status`
Returns only the signed-in user's current application.

Suggested response:

```json
{
  "application": {
    "id": "PV-000123",
    "roles": ["Spriter"],
    "status": "In Review",
    "submittedAt": "2026-09-14T08:00:00Z",
    "updatedAt": "2026-09-14T09:00:00Z",
    "timeline": [
      {"title": "Application submitted", "detail": "Received", "complete": true},
      {"title": "Director review", "detail": "In progress", "complete": false}
    ]
  }
}
```

## Interview endpoint placeholder

### `GET /api/interview`
Returns the signed-in user's interview ticket only if one exists and the user is authorised to read it.

### `POST /api/interview/messages`
Reserved for the approved interview messaging design.

Do not enable this route until the Directors have agreed on the encryption/key model. The transport and storage format should be designed so the intended confidentiality rules are actually enforced rather than merely described in the interface.

## Director endpoints

All `/api/admin/*` routes require a backend-verified Director session.

### `GET /api/admin/applications`
Returns the application queue. Optional query parameters may filter by status.

Suggested response:

```json
{
  "authorized": true,
  "applications": [
    {
      "id": "PV-000123",
      "displayName": "Applicant",
      "roles": ["Spriter"],
      "status": "Submitted",
      "submittedAt": "2026-09-14",
      "claimedBy": null
    }
  ]
}
```

Additional Director actions can be added as the workflow is finalised:

- `GET /api/admin/applications/:id`
- `POST /api/admin/applications/:id/claim`
- `POST /api/admin/applications/:id/status`
- `POST /api/admin/applications/:id/interview`

## Discord notification bot

The bot is tertiary to the portal. The backend remains the source of truth.

The backend may notify the bot of events such as:

```json
{
  "event": "application.submitted",
  "applicationId": "PV-000123",
  "discordUserId": "123456789012345678",
  "status": "Submitted"
}
```

or:

```json
{
  "event": "application.status_changed",
  "applicationId": "PV-000123",
  "discordUserId": "123456789012345678",
  "status": "Interview"
}
```

Do not include full application answers or interview message bodies in notification payloads unless there is a specific reviewed requirement for them.

## Spam controls expected on the backend

- Cloudflare Turnstile on application submission
- one active application per Discord account
- submission cooldowns
- request rate limits
- duplicate/flood checks
- blacklist support
- minimum-answer validation
- suspicious submissions flagged for Director review rather than silently discarded when uncertain
