# Recruitment Backend Contract

This document is a working interface outline for the Cloudflare backend and the tertiary Discord notification bot.

## Public frontend

The frontend should only call HTTPS API routes. It must never receive database credentials, Discord client secrets, or encryption keys intended for server-side use.

Suggested routes:

- `GET /auth/discord`
- `GET /auth/discord/callback`
- `POST /auth/logout`
- `GET /api/me`
- `GET /api/application`
- `POST /api/application`
- `PATCH /api/application`
- `GET /api/interview`
- `POST /api/interview/messages`

## Director routes

Every Director route must verify the authenticated Discord account against the authorised Director list on the backend.

Suggested routes:

- `GET /api/director/applications`
- `GET /api/director/applications/:id`
- `POST /api/director/applications/:id/claim`
- `POST /api/director/applications/:id/hold`
- `POST /api/director/applications/:id/interview`
- `POST /api/director/applications/:id/accept`
- `POST /api/director/applications/:id/decline`

## Bot events

The bot does not need application answers or interview contents just to send notifications.

Suggested outbound events from the backend:

### New application

```json
{
  "type": "application.created",
  "applicationId": "PV-1042",
  "roles": ["Spriting"],
  "submittedAt": "2026-09-14T08:00:00Z"
}
```

### Applicant status notification

```json
{
  "type": "applicant.notify",
  "discordUserId": "123456789012345678",
  "notification": "interview_invited"
}
```

The bot can translate the notification key into the approved Discord message text.

## Storage boundary

The static GitHub Pages repository stores public frontend files only. Sensitive recruitment records belong in Cloudflare storage. The interview encryption design should be finalised before interview messages are stored in production.
