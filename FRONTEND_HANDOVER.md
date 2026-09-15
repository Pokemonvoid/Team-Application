# Stage 1 handover

## Ready for Part 2

The static frontend is ready for backend integration. It remains a preview and must not be described as accepting applications until the live services and launch checks are complete.

The current design uses the supplied Team Void logo, unaccented Pokemon Void branding, a prominent PokedexFillers ownership and unpaid-volunteer notice, Sedimite, Scraqua and the two Hydrena forms. No artwork was redrawn. The wiki repository was read-only.

## Frontend map

| File | Responsibility |
| --- | --- |
| `index.html` | Recruitment, role entry links and project disclaimer |
| `apply.html` / `assets/js/apply.js` | Profile, multi-role selection, background, role questions, validation, draft and review |
| `status.html` | Local draft summary and future applicant status |
| `interview.html` | Interview ticket layout; replies disabled |
| `admin.html` | Director queue and record layout |
| `assets/js/portal.js` | Portal rendering, explicit fictional examples and service-read hooks |
| `assets/js/site.js` | Shared navigation, Discord entry links and account state |
| `assets/js/config.js` | Public API origin and Discord sign-in path |
| `help.html` / `privacy.html` | Applicant help and current preview data behaviour |
| `assets/css/site.css` | Shared visual system and responsive layouts |

There is no build pipeline to maintain. All runtime assets are local. The repository contains no applicant data or credentials.

## Integration points

Keep `apiBaseUrl` empty until integrating with a development backend. In that mode, finishing the form only validates and saves the browser-tab draft. Portal examples are fictional and do not send requests.

With a configured API origin, the existing hooks use credentialed requests:

- `GET /api/session` for account state.
- `/auth/discord?returnTo=...` for the Discord sign-in entry.
- `POST /api/application` for the profile, general answers, selected roles and their role details.
- `GET /api/application/status` for the signed-in applicant’s record.
- `GET /api/interview` for an authorised interview read.
- `GET /api/admin/applications` for the authorised Director queue.

See `API_CONTRACT.md` for the intended response shapes and server responsibilities. The application’s `payload()` function is the current field mapping. Unselected role details are null. Age does not restrict roles or introduce a separate application path.

Director record detail fetching and live claim/status/interview actions still need service wiring in Part 2. The current controls deliberately operate only on example records when no API is configured. Never use those local controls as authority for real changes.

Interview reply controls remain disabled even with an API origin. Do not enable them by merely removing `disabled`: the Directors’ confidentiality and encryption design must be agreed and implemented separately.

## Part 2 work

Implement the Cloudflare Worker, D1, Discord OAuth/session flow and server-side Director permissions. Validate every submitted field, derive Discord identity from the session, reject duplicate active applications and add the agreed spam controls, Turnstile and rate limits.

Complete authorised Director detail and mutation routes, connect the frontend to them, and map server responses into applicant progress. Handle sign-out, session expiry, unauthorised access, unavailable services and retryable failures. Test the chosen cross-site session arrangement in the browsers applicants will use.

The later bot is a notification helper; the portal/backend remains the source of truth. Application answers and interview messages must not appear in notification payloads or public repository files.

Before live recruitment, finish the privacy notice with retention, deletion and contact details, verify the production configuration, and run integration, security and load checks. The frontend checks below do not replace those tests.

## Checks completed for this handover

- All eight HTML pages served successfully; local file and anchor references resolved.
- Empty required answers produced a focused error summary and field errors.
- An Under 18 profile could select all four roles without extra eligibility restrictions.
- All four conditional question sections appeared and the review included their answers.
- A malformed optional portfolio URL was rejected; an empty optional URL was accepted.
- Editing an earlier required answer to blank was caught by final validation.
- Removing Music excluded its answers from the review.
- Finishing the preview showed that nothing was submitted; refresh restored the draft and My application recognised preview completion.
- Draft-clear cancellation preserved the sample answer; confirmation removed it across reload.
- Fictional status and interview displays worked; interview replies stayed disabled.
- Director search and filters handled empty results; example claim and status changes updated the queue and record.
- Homepage and application were inspected at desktop, 390-pixel and 320-pixel widths. Remaining pages were checked at 390 pixels without horizontal page overflow or missing images.
- The mobile navigation opened and closed with Escape. JavaScript syntax checks passed. The final browser pass reported no warnings or errors.

No real applications were submitted and no live authentication, private records or backend services were tested. Those are Part 2 and later responsibilities.
