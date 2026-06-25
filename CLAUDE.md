# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

- `@blognow/sdk` — type-safe JS/TS client for the BlogNow API (`https://api.blognow.tech`), API-key auth.
- Ships triple builds: CJS (`dist/cjs`), ESM (`dist/esm`), UMD (`dist/umd`) + types (`dist/types`).
- Targets Node ≥14, browsers, and edge runtimes — all code must stay isomorphic (native `fetch`, no Node-only globals).

## Commands

- Build all targets: `npm run build` (clean → types → cjs → esm → umd)
- Typecheck only: `npm run typecheck`
- Lint: `npm run lint` / autofix: `npm run lint:fix`
- All tests: `npm test`
- Single file: `npx jest tests/posts.test.ts`
- Single test by name: `npx jest -t "should get published posts"`
- Coverage / watch: `npm run test:coverage` / `npm run test:watch`

## Architecture (big picture)

- `BlogNowClient` (`src/client.ts`) is the entry point — validates config, owns one `HttpClient`, exposes services (`client.posts`).
- `HttpClient` (`src/utils/http.ts`) is the only thing that touches the network. It handles: URL building (`{baseUrl}/{apiVersion}/{path}`), auth header, rate-limit queue, retries (exponential backoff on network/5xx, `retry-after` on 429), timeout via `AbortController`.
  - Response unwrap: `data.data || data` — the API sometimes wraps payloads in `{ data }`. Account for this in tests/mocks.
  - Query params: `get(path, params)` spreads params **verbatim** into the query string — no key remapping. If an endpoint's param name differs from the SDK option name, the service method must remap it before calling `http.get`.
- Services (`src/services/*.ts`) translate domain methods → HTTP calls. `PostsService` is the only one today; list methods have a `getX` + `iterateX` (async-generator auto-pagination) pair — copy that pattern for new list endpoints.
- Types (`src/types/*.ts`) are barrel-exported; public surface re-exported from `src/index.ts`. Wire shape is **snake_case** (`view_count`, `published_at`, `category_id`) — match the API exactly, never camelCase.
- Errors (`src/utils/errors.ts`) — `createErrorFromResponse` maps status codes to typed error classes; throw these, don't throw raw.

## Known issues to solve

- **Stale test suite**: ~20 tests fail because they assert old camelCase fields (`publishedAt`, `viewCount`) and `/api/v1/` paths that no longer match the snake_case source / `v1/` paths. Fix tests to current source, not the other way around.
- **README claims "Zero dependencies"** — revisit if/when a runtime dep (e.g. `node-html-parser`) is added; update README + `external` in `rollup.config.js` accordingly.
- **Commented-out iterators** in `src/services/posts.ts` (`iterateAllPosts`, `iteratePostsByAuthor`) are dead code — delete or implement, don't leave half-in.

## Do

- Keep all changes **additive & backward-compatible** — never alter the `Post` shape, existing method signatures, or response shapes.
- Mirror existing service patterns (`getX` + `iterateX`) and snake_case wire fields.
- Remap differing query-param names inside the service method (the HTTP layer won't do it).
- Add a new runtime dependency to `dependencies` (not `devDependencies`) and verify it bundles in the UMD build.
- Keep new code isomorphic and side-effect-free (`"sideEffects": false`).

## Don't

- Don't introduce camelCase fields or Node-only APIs.
- Don't bypass `HttpClient` for network calls.
- Don't add breaking changes in a minor version.
- Don't "fix" source to satisfy stale tests.

## Conventions

- **Code comments: one-liners only.** Explain the non-obvious "why" in a single line; no block/multi-line comment headers.
- **Commit & PR messages: bulleted lists, focused on *why* not *what*.** The diff shows what changed; the message explains the reason.
- Versioning: SemVer; new exports/methods land as a minor. Note them in `CHANGELOG.md`.
