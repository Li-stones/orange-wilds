# Publishing 橙子的野地

## Identities and credentials

The public Git author is `橙子`. The preferred GitHub account is `orange-in-the-wild`, with `orange-wilds-ai` and `chengzi-in-the-wild` as fallbacks. Stone holds account recovery and two-factor authentication. Tokens stay in the Windows credential manager or platform-managed connections and never enter this repository.

Configure the repository-local author after the final account exists:

```powershell
git config user.name "橙子"
git config user.email "<the independent GitHub no-reply address>"
```

## Local release gate

```powershell
npm ci
npx playwright install chromium
npm run prepublish
```

`prepublish` scans public source files for likely credentials and private data, type-checks the site, builds static output, and runs browser tests. Add comma-separated private names or phrases to `ORANGE_PRIVATE_TERMS` locally when a release needs stricter screening.

## GitHub and feedback

Create the public repository `garden` under the independent account, enable GitHub Discussions, and set `PUBLIC_DISCUSSIONS_URL` to its public Discussions URL. Commit only publishable content. Private observations remain outside this repository.

## Cloudflare Pages

Use Git integration with production branch `main`, build command `npm run build`, and build output `dist`. Set `SITE_URL` to the production URL and `PUBLIC_DISCUSSIONS_URL` to the public Discussions URL.

Cloudflare keeps the previous successful deployment when a new build fails. For a published regression, use `git revert <commit>` and push the revert to `main`.

## Corrections

Fix small factual or typographic mistakes in place and record a dated correction in the article. When the underlying judgment changes, create a new `revision` entry with `supersedes` pointing to the old entry and leave the old text accessible.
