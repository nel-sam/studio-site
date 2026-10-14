# Form / Frequency: Local Studio Prototype

Next.js, TypeScript, GSAP and locally bundled fonts. No Azure, Sanity or Mux resources, credentials or runtime connections are configured. No deployment is included. The parent TypeScript practice project is unchanged.

## Run Locally

Requires Node 22 or newer. From this directory:

```sh
npm install
npm run dev -- --port 3100
```

Open http://127.0.0.1:3100. The server binds to loopback only. All fonts, project imagery, generated videos and SVG artwork are served locally. npm's cache is inside the parent project folder, at `../.studio-npm-cache`.

## Included

- Home, About, Projects, individual project pages and Contact.
- Responsive navigation, project filters, hover/focus video previews, a pointer-reactive SVG waveform, colour-change interaction and motion pause control.
- Reduced-motion support, keyboard-visible focus and local image optimization.
- Local project editor at `/studio`: create, edit, preview, publish, unpublish and delete projects, with image/MP4 upload.

The studio name, copy, generated fractal imagery, SVG artwork and `hello@example.com` address are placeholders. Contact opens an email client; there is no mail-sending backend. Supplied designs and After Effects deliverables have not been integrated because they are not present in the workspace.

## Local Content Workflow

The public site reads published records from `data/projects.json`; drafts appear only in the editor. Saves are serialized and written atomically. The preview inside the editor can show unsaved content. Setting an existing published project to Draft and saving unpublishes it; this prototype does not keep a separate published revision.

Uploads are written to `public/media/`, use generated filenames, and accept JPEG, PNG, WebP or MP4 up to 30 MB. File signatures are checked and SVG uploads are rejected. Project deletion does not delete files, so shared media is not inadvertently removed. Remove unused uploads manually once no project references them. Keep a copy of `data/projects.json` and `public/media/` before substantial content edits.

This editor is a local development substitute, NOT a production CMS. It has no login, revision history, multi-user conflict resolution, malware scanning or video transcoding. Its write routes require loopback Host and matching Origin headers. Do not expose it through a tunnel or bind it to a public/network interface. Draft media files under `public/` are not private. The JSON store is intended for one local server process.

## Checks

```sh
npm run lint
npm run build
mkdir -p .tmp
TMPDIR="$PWD/.tmp" PLAYWRIGHT_BROWSERS_PATH="$PWD/.browsers" ./node_modules/.bin/playwright install chromium
npm test
```

Browser tests use the shipped sample projects and port 3100, or start their own loopback dev server there if available. They cover desktop/mobile layouts, screenshots, no external runtime requests, filters, motion controls, draft isolation, persistence, uploads, publishing, deletion and rejection of invalid/non-local writes. Temporary projects and uploads created by tests are removed. Screenshots go to `test-results/screenshots/`; browsers and browser temporary files remain in `.browsers/` and `.tmp/`.

Dependency audit at implementation: production dependencies have no known advisories. Five high-severity reports remain in the scaffold's development-only `eslint-config-next` dependency tree. npm proposes a breaking framework-config downgrade; it has not been applied. Recheck before production handoff.

## Later Integration, Not Configured

When explicitly authorized, replace the local content functions with Sanity queries, define matching Studio schemas and use the Sanity editor instead of `/studio`. Connect Mux video uploads/playback, processing states and verified webhooks. Add protected draft preview and authenticated publish-triggered cache refresh. Secrets stay server-side. No service accounts or production infrastructure are needed to run this prototype.