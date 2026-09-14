# Recruitment Backend Contract

This file outlines the boundary between the public recruitment site, the Cloudflare backend, and the Discord notification bot.

## Authentication

The public site starts Discord OAuth through the backend. The Discord client secret stays on the server.

Suggested routes:

- `GET /auth/discord`
- `GET /auth/discord/callback`
- `POST /auth/logout`
- `GET /api/me`

The backend should take the applicant's Discord user ID from the authenticated session. Do not trust a Discord user ID supplied by the browser as proof of identity.

## Applicant routes

- `GET /api/application`
- `POST /api/application`
- `PATCH /api/application`
- `GET /api/interview`
- `POST /api/interview/messages`

The current application payload contains these fields where relevant:

- `preferred_name`
- `timezone`
- `pronouns`
- `age_group`
- `referral`
- `minor_portfolio`
- `guardian_permission`
- `experience`
- `interests`
- `critique`
- `time_commitment`
- `pokemon_projects`
- `anything_else`
- `roles`
- `programming_kind`
- `essentials_familiarity`
- `programming_interest`
- `programming_examples`
- `programming_other`
- `animation_examples`
- `spriting_ability`
- `sprite_portfolio`
- `sprite_style`
- `sprite_no_portfolio`
- `music_portfolio`
- `music_style`
- `music_no_portfolio`

`roles`, `programming_interest`, and `spriting_ability` can contain more than one value.

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

The notification bot does not need application answers or interview contents.

### New application

```json
{
  "type": "application.created",
  "applicationId": "PV-1042",
  "roles": ["Spriting"],
  "submittedAt": "2026-09-14T08:00:00Z"
}
```

### Applicant notification

```json
{
  "type": "applicant.notify",
  "discordUserId": "123456789012345678",
  "notification": "interview_invited"
}
```

The bot can translate the notification key into the approved Discord message text.

## Storage boundary

The GitHub Pages repository stores public frontend files only. Applicant records, application answers, status history, and private ticket data belong on the protected Cloudflare backend.

Interview message storage and encryption should not be enabled until the Director/interviewee access model has been finalised and tested.
