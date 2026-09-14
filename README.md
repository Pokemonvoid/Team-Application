# Pokémon Void Recruitment Portal

Static frontend for the Pokémon Void development-team recruitment portal.

## Deploying to GitHub Pages

1. Copy the contents of this folder into the root of the GitHub repository.
2. Commit and push the files.
3. In the repository, open **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select `main` and `/(root)`.
6. Save and wait for the Pages deployment to finish.

`index.html` must stay in the repository root.

## Current state

The frontend includes:

- public recruitment home page
- multi-step application form
- multi-role question flow
- applicant status sign-in page
- applicant interview-ticket layout
- Director queue layout
- help and privacy pages
- mobile layouts

The live backend is intentionally not included here.

## Backend connection

Edit `assets/js/config.js` when the Cloudflare Worker has a production URL:

```js
window.VOID_RECRUITMENT = {
  apiBaseUrl: "https://your-worker.example.workers.dev",
  discordLoginPath: "/auth/discord"
};
```

The public repository must not contain:

- Discord client secrets
- Cloudflare API secrets
- database credentials
- applicant records
- interview contents
- encryption keys
- private access tokens

Those belong on the server-side Cloudflare environment.

## Open roles in this build

- Programming
- Move Animation
- Spriting
- Music

Other roles are currently shown as closed.
