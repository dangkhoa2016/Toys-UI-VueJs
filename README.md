# Toy Tale Client (Vue 2, No-Build)

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](README.vi.md)

Toy Tale is a Vue 2 client that loads `.vue` components directly in the browser via `vue2-sfc-loader`, without a bundler.

This client is also used as a manual/integration test UI for the Toy API backend projects:
[Toy-Api-Server-Nodejs](https://github.com/dangkhoa2016/Toy-Api-Server-Nodejs)
and
[Toy-Api-Server-Cloudflare-Worker](https://github.com/dangkhoa2016/Toy-Api-Server-Cloudflare-Worker).

## Feature Highlights

- Load toys from API and auto-seed demo data when the API returns an empty list.
- Show skeleton cards while loading and a full-screen mosaic loader for long-running actions.
- Create toy in modal form with real-time validation and debounced image preview checks.
- Edit toy details without resetting the current like count.
- Like toy instantly with per-card busy state and highlight feedback.
- Delete toy with confirmation modal, backdrop lock, and disabled controls during delete.
- Search toys by name and sort by default / likes descending / likes ascending.
- Show toast notifications for success, warning, and error states.
- Animate list enter/leave/reorder and update pulses for better UX feedback.

## Technologies Used

- Core framework: `Vue 2.7.14` with centralized state via `Vuex 3.6.2`.
- SFC runtime loader: `vue2-sfc-loader` runtime build (served from `vue3-sfc-loader`).
- UI libraries: `Bootstrap 5.2.3` (CSS) and `BootstrapVue 2.23.1` components.
- Browser/runtime APIs: native `ES modules` and `Fetch API` (with retry helpers in project code).
- Runtime support: `es6-promise` polyfill loaded from CDN.
- Local serving workflow: `npx serve` for no-build static hosting.
- Backend integration targets: `Toy-Api-Server-Nodejs` and `Toy-Api-Server-Cloudflare-Worker` REST APIs.

## Quick Start

### 1) Start API server (recommended)

Reference backend repositories (used for testing with this UI):

- https://github.com/dangkhoa2016/Toy-Api-Server-Nodejs
- https://github.com/dangkhoa2016/Toy-Api-Server-Cloudflare-Worker

Option A - run the Node.js backend from workspace root:

```bash
cd Toy-Api-Server-Nodejs
npm install
npm run dev
```

Option B - run the Cloudflare Worker backend from workspace root:

```bash
cd Toy-Api-Server-Cloudflare-Worker
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

If you do not have the Node.js API project locally yet:

```bash
git clone https://github.com/dangkhoa2016/Toy-Api-Server-Nodejs.git
cd Toy-Api-Server-Nodejs
npm install
npm run dev
```

Default API URL expected by this client on localhost:

```text
http://localhost:8080/api/toys
```

If you use the Cloudflare Worker locally, override the API URL to its local Wrangler address before loading the app, for example:

```html
<script>
	window.TOY_API_URL = "http://127.0.0.1:8787/api/toys";
</script>
```

### 2) Run this client with `npx serve`

From this project folder:

```bash
cd Toys-UI-VueJs
npx serve .
```

You can set a fixed port if needed:

```bash
npx serve . -l 3000
```

Then open the local URL printed by serve (for example `http://localhost:3000`).

## API Endpoint Behavior

`assets/js/config.js` chooses API endpoint by hostname:

- On `localhost` / `127.0.0.1`: uses `http://localhost:8080/api/toys`.
- On non-local hosts: uses the forwarded hosted API fallback.

You can override API URL globally before loading `loader.js`:

```html
<script>
	window.TOY_API_URL = "https://your-api.example.com/api/toys";
</script>
```

## Project Structure

| Path | Responsibility |
| --- | --- |
| `index.html` | App shell and CDN runtime dependencies |
| `assets/js/loader.js` | Vue bootstrap + `vue2-sfc-loader` integration + module cache wiring |
| `assets/js/config.js` | Centralized constants/enums, API URL selection, image normalization |
| `assets/js/services/toyService.js` | API integration layer for list/create/update/like/delete |
| `assets/js/services/api.js` | Compatibility service export layer |
| `assets/js/toyStore.helpers.js` | Shared store state helpers for sort/filter/toast/list updates |
| `assets/js/toyForm.js` | Shared form validation, preview lifecycle, submit lock logic |
| `assets/js/toyVueJsForm.js` | Vue-specific bridge helpers for image preview and form computed state |
| `assets/js/modalForm.js` | Backdrop observer and managed form reset utilities |
| `assets/js/utils.js` | Retry helpers and response error normalization |
| `vue/main.vue` | Root app composition and main layout |
| `vue/stores/appStore.js` | App-level state, endpoint and app loaded flags |
| `vue/stores/toyStore.js` | Main toy domain state/actions/mutations/getters |
| `vue/*.vue` and `vue/*.js` | UI components and sidecar logic for controls, collection, forms, modal, toast, loader |
| `assets/db.json` | Demo seed data |
| `assets/images/toys/` | Local toy image assets |

## Runtime Notes

- Serve over HTTP only. Opening `index.html` with `file://` will not work.
- The app keeps a no-build architecture for easy inspection and quick iteration.
- Loader module cache maps shared helper modules so SFC runtime imports stay stable.
- Create and edit forms require valid image preview before submit unlocks.
- Delete modal prevents accidental close during deletion and keeps action buttons disabled while busy.
- Empty API state triggers auto-seed flow using `assets/db.json`.
- Relative and legacy toy image paths are normalized before rendering/sending to API.
- Toasts auto-hide with configurable delays from centralized config.

## Screenshot Gallery

The full screenshot gallery has been moved to [SCREENSHOTS.md](SCREENSHOTS.md).
For Vietnamese captions, see [SCREENSHOTS.vi.md](SCREENSHOTS.vi.md).

## Troubleshooting

- **Unable to load toys**:
	- Ensure API server is running at `http://localhost:8080`.
	- Check browser console/network tab for CORS or connection errors.
	- Retry from the error state button in the collection panel.
- **Image preview stays locked**:
	- Use valid `http://` or `https://` image URL.
	- Or use a valid local toy image path under `assets/images/toys/`.
- **SFCs fail to load**:
	- Verify app is served via HTTP (not `file://`).
	- Check failed module requests in DevTools network tab.

## Developer Reference

For a detailed overview of the project architecture, key files, data flows, and parity notes with [`Toys-UI-Javascript`](https://github.com/dangkhoa2016/Toys-UI-Javascript), see [REFERENCE.md](REFERENCE.md).
For the Vietnamese version, see [REFERENCE.vi.md](REFERENCE.vi.md).

## License

This project is for development/demo purposes in this workspace.
