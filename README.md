# Pokemon Void Recruitment Portal

The public recruitment frontend for PokedexFillers’ Pokemon Void project. All roles are voluntary and unpaid.

## Current stage

This is the Stage 1 website preview. It is intentionally not accepting applications. Leave `apiBaseUrl` empty in `assets/js/config.js` for preview use.

`FRONTEND_HANDOVER.md` records the current frontend checks and the work to connect in Part 2.

The repository includes:

- Recruitment home with the supplied Team Void mark and authentic project sprites.
- Five-section application with multiple roles, conditional questions, validation, editable review and a draft saved in the current browser tab.
- Applicant page that distinguishes a local draft from a submitted application, plus optional fictional status examples.
- Interview shell with an optional fictional conversation. Replies are disabled.
- Director shell with fictional records, search, filters, record review, claim/release and status changes. Example changes reset on reload.
- Help, preview privacy information and a 404 page.

There is no backend, Discord authentication implementation, database, notification bot, upload service or interview encryption implementation in this repository.

## Use the replacement ZIP

Extract the ZIP into the recruitment repository so `index.html`, `assets/` and `.nojekyll` are at its root. The archive is the complete frontend, not a patch. Preserve the repository’s `.git` directory and normal Git history.

For GitHub Pages, publish the selected branch from `/ (root)`. The site uses relative links and assets and works under `/Team-Application/`. No build step or package installation is needed to deploy it.

For a local preview, serve the extracted directory with any static HTTP server. If Python is installed, run `python -m http.server 4173 --bind 127.0.0.1` from that directory and visit `http://127.0.0.1:4173/`.

## Draft behaviour

Answers are stored in `sessionStorage` under `void-recruitment-draft-v1`. A draft survives refreshes and navigation in the same tab. Use **Clear draft** to remove it. Browsers may restore session storage when restoring a closed session, so do not describe closing a tab as guaranteed deletion.

**Finish preview** validates the form and records preview completion locally. It never submits an application when `apiBaseUrl` is empty. Removing a role excludes its answers from review and the future submission payload; those answers remain in the tab draft in case the role is selected again.

## Later integration

`API_CONTRACT.md` describes the intended service boundary. The existing request hooks cover session loading, application submission, applicant status, interview reads and the Director queue. Setting an API origin alone does not complete the later stages or make this site ready for live recruitment.

The Director detail/action controls currently work with fictional records only. Real Director mutations and interview replies remain unconnected. When an API origin is configured, fictional examples are disabled; API failures do not fall back to example records.

Planned later work remains separate:

1. Cloudflare Worker and D1, Discord OAuth, server-side sessions and Director authorisation, validation, spam controls, rate limits and Turnstile.
2. Optional Discord notifications without confidential application or interview contents.
3. Interview confidentiality and encryption design agreed with the Directors before messaging is enabled.
4. End-to-end integration, privacy notice completion, security/load tests and operational handover.

## Public code boundary

Do not commit applicant records, interview conversations, Discord secrets, Cloudflare tokens, database credentials, session data or encryption keys. A public `admin.html` is a frontend shell, not access control; every future protected service request must enforce authorisation on the server.

## Design and assets

The interface uses the project’s purple palette, Pixelify Sans for headings and a conventional body font. All fonts and artwork used by the site are bundled locally. The source is plain HTML, CSS and JavaScript with no runtime framework dependency.

The Team Void marks were supplied by Ed. Sedimite, Scraqua, Hydrena and Corrupted Hydrena were copied unchanged from the wiki; the wiki repository was not modified. See `assets/README.md` for asset notes and `assets/fonts/OFL.txt` for the font license.
