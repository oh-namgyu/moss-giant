# Contributing to moss-giant

Bug reports and pull requests are welcome, especially ones that make the film look better or the method easier to reuse.

## Development setup

```sh
npm ci
npx playwright install chromium
npm run lint
npm test
```

CI runs lint, the tests and a short MP4 render on Ubuntu.

## Conventions

- `src/*.js` is one classic script split across files. `tools/build.mjs` lists the concatenation order, so add new files there.
- Keep the film free of image, video and audio files, and free of network requests. A test enforces this.
- Keep rendering deterministic: use seeded `rng()`, never `Math.random()`, and compute motion from time rather than from the previous frame.
- When refactoring, compare frame hashes before and after to show that the picture did not change.
- Include a before-and-after frame in pull requests that change the picture. `npm run still -- <frame>` makes one.
