# Toy Tale

Toy Tale is a small Vue 2 no-build demo that loads Vue single-file components directly in the browser with `vue2-sfc-loader`.

## Stack

- Vue 2.7
- Vuex 3
- Bootstrap 5.2.3
- BootstrapVue 2 runtime components
- Browser-side ES modules
- Remote or local toy API
- Local demo seed data

## Project structure

- `index.html`: bootstraps the app and loads CDN dependencies.
- `assets/js/loader.js`: creates the Vue app and configures `vue2-sfc-loader`.
- `assets/js/config.js`: central app configuration, including the API endpoint.
- `assets/js/services/api.js`: API service wrapper for toy requests.
- `assets/js/utils.js`: shared helpers such as retry logic and error normalization.
- `vue/`: Vue components and Vuex stores.
- `assets/db.json`: demo data used to seed the collection when the API is empty.
- `toys/`: bundled toy images used by the demo dataset.

## Run locally

This project must be served over HTTP. Opening `index.html` directly with `file://` will not work because the app fetches modules and assets at runtime.

You can use any simple static HTTP server from the project root.

### Option 1: VS Code Live Server

Open the project folder and start Live Server from VS Code.

### Option 2: Python static server

From the project root:

```bash
python3 -m http.server 3000
```

Then open `http://localhost:3000` in the browser.

### Option 3: `npx serve`

From the project root:

```bash
npx serve . -l 3000
```

Then open `http://localhost:3000` in the browser.

If `serve` is not installed locally, `npx` will download and run it for you.

## API configuration

The app reads the API endpoint from `assets/js/config.js`.

Example for local backend:

```js
API_ENDPOINT: 'http://localhost:8080/api/toys'
```

Example for Codespaces or another forwarded host:

```js
API_ENDPOINT: 'https://<your-forwarded-host>.app.github.dev/api/toys'
```

The current checked-in value may point to a temporary forwarded URL, so update it before running against another backend.

## Current behavior

- The app fetches toys from the configured API on load.
- The add-toy form validates required fields and image URLs before submit.
- Users can search toys by name from the control panel.
- Users can sort toys by likes in ascending or descending order.
- Users can edit toy details from the collection without resetting the current like count.
- The collection view shows loading skeletons, an error state with retry, and an empty state with manual demo seeding.
- If the API returns an empty list, the app can seed demo toys from `assets/db.json`.
- Demo image paths are converted to absolute URLs before being sent to the API.
- Users can create, like, delete, and edit toys from the UI.
- Success and error actions show toast notifications in the corner of the UI.

## Notes

- The app intentionally keeps the no-build setup for simplicity.
- Request retry and response error normalization live in `assets/js/utils.js`.
- The app uses Bootstrap 5.2.3 for styling while keeping BootstrapVue 2 runtime components, so UI changes should be checked in the browser for compatibility.
- For requests without a body, avoid sending `Content-Type: application/json`; this matters for routes like `DELETE`.
