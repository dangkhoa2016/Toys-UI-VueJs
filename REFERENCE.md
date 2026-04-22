# Toys-UI-VueJs Reference

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](REFERENCE.vi.md)

## Purpose

This document serves as a quick reference for the structure and core logic of the [`Toys-UI-VueJs`](https://github.com/dangkhoa2016/Toys-UI-VueJs) project, and records differences from the [`Toys-UI-Javascript`](https://github.com/dangkhoa2016/Toys-UI-Javascript) version.

---

## Architecture Overview

The project uses **Vue 2 + Vuex + bootstrap-vue**, without a bundler.

- `.vue` components are loaded directly in the browser using `vue2-sfc-loader`.
- Global state is managed in Vuex with 2 modules: `appStore` and `toyStore`.
- Shared logic lives in `assets/js/`, and the loader pre-registers selected helper modules in `moduleCache` to avoid re-parsing them across SFCs.
- bootstrap-vue is used for `b-modal`; toast UI is rendered by the custom `toast-region` component.

---

## Entry Points

| File | Description |
|---|---|
| `index.html` | Mounts to `#app`, loads Vue, Vuex, `vue2-sfc-loader`, and bootstrap-vue via CDN, then loads `assets/js/loader.js` |
| `assets/js/loader.js` | Initializes Vuex store, creates Vue instance, registers `vue2-sfc-loader`, mounts `vue/main.vue` |
| `vue/main.vue` | Main layout: header, top actions, toy-collection, modals, toast-region, back-to-top |

---

## Key Files

### Store

#### `vue/stores/appStore.js`

- Manages `endpoint` (API URL) and `appLoaded`.
- Getter `getEndpoint` falls back to `TOY_API_URL` if the endpoint is too short.
- Action `setEndpoint(payload)` supports runtime endpoint changes in the store, although the current UI does not expose an endpoint picker.
- **The API-facing actions in `toyStore` retrieve the endpoint via `rootGetters['appStore/getEndpoint']`.**

#### `vue/stores/toyStore.js`

- Main Vuex module, namespaced as `toyStore`.
- Contains all mutations, actions, and getters for load, seed, create, update, delete, like, toast, and flash.
- State is initialized by `createToyStoreState()` from `toyStore.helpers.js`.
- Key mutations: `SYNC_TOYS`, `PREPEND_TOY`, `UPSERT_TOY`, `REMOVE_DELETE_TARGET_TOY`, `ADD_TOAST`, `REMOVE_TOAST`, `SET_HIGHLIGHTED_TOY`, `ADD_LIKING_TOY_ID`, `REMOVE_LIKING_TOY_ID`.
- Key actions: `loadInitialToys`, `submitCreateToy`, `submitUpdateToy`, `submitDeleteToy`, `incrementToyLikes`, `flashToyCard`, `addToast`, `removeToast`.
- Getter `getToyById(id)` searches the toy `Array` using `find()`.

### Shared Assets JS

#### `assets/js/config.js`

- `TOY_API_URL` — backend URL, prefers `window.TOY_API_URL` if set.
- `DEMO_DATA_PATH` — `/assets/db.json`.
- `TOY_FORM_TIMINGS.IMAGE_PREVIEW_DEBOUNCE_MS` — debounce delay for image preview checks.
- `TOY_UI_DELAYS.HIGHLIGHT_RESET_MS` — duration before card highlight auto-clears.
- `TOY_NETWORK_SETTINGS` — `RETRY_COUNT`, `BACKOFF_MS`, `TIMEOUT_MS` used for retry logic.
- `TOY_TEMPLATE_SETTINGS.SKELETON_CARD_COUNT` — number of skeleton cards shown during loading.
- `normalizeToyImageUrl(image)` — normalizes image paths to `/assets/images/toys/`.
- `toApiImageUrl(image)` — converts image path to absolute URL for API submission.
- `normalizeToy(toy)` — normalizes a toy object (trim name, normalize image, ensure likes >= 0).

#### `assets/js/services/toyService.js`

- All functions accept `endpoint` as the last parameter (default = `TOY_API_URL`).
- `fetchToys(endpoint?)` — GET toy list.
- `seedDemoToys(endpoint?, onEach?)` — POST demo toys from `db.json`, calls `onEach(toy)` after each success.
- `fetchOrSeedToys(endpoint?)` — if the list is empty, seeds then returns `seededToys` (no re-fetch).
- `createToy({ name, image, enabled?, likes? }, endpoint?)` — POST a new toy.
- `updateToy(id, { name, image, likes, enabled }, endpoint?)` — PUT a toy.
- `likeToy(toy, endpoint?)` — PATCH `/likes`.
- `deleteToy(toyId, endpoint?)` — DELETE a toy.
- Includes `ApiError` class and `formatServerErrorMessage()` to normalize server errors.

#### `assets/js/toyStore.helpers.js`

- **`state.toys` is an `Array<toy>`** — traversed using `find()` and `findIndex()`.
- `createToyStoreState()` — creates initial state (toys, searchTerm, sortOrder, toasts, highlightedToy, editingToyId, confirmDeleteToyId, isLoadingToys, isAutoSeeding, etc.).
- `syncToyState(state, toys)` — overwrites `state.toys` and updates `totalToys`.
- `prependToyState(state, toy)` — prepends toy, removing duplicates by id.
- `updateToyState(state, toy)` — upserts toy by id (updates if exists, pushes if not).
- `removeToyState(state, toyId?)` — removes using `splice`, falls back to `confirmDeleteToyId`.
- `getVisibleToys(state)` — filters and sorts from `state.toys` (Array).
- `flashToyState(state, toyId)` — sets `highlightedToy` with `nonce = Date.now()`.
- `addToastState(state, payload)` / `removeToastState(state, id)`.
- `getToastMessage(error, fallback)` — extracts message from error string/object.

#### `assets/js/toyForm.js`

- `IMAGE_PREVIEW_DEBOUNCE_MS` — sourced from `TOY_FORM_TIMINGS` in config.
- `getNameError(value)` / `getImageError({value, normalizedImageUrl, preview})` — returns error string or empty string.
- `loadImagePreview(src)` — tests image loading via `new Image()`, resolves/rejects.
- `getSubmitDisableReason({...})` — determines why the submit button is disabled.
- `createToyFormValues({toy?, includeLikes?})` — creates a values object for the form.
- `createPreviewState({message?, placeholderMessage?})` — creates initial preview state.

#### `assets/js/toyVueJsForm.js`

- Bridge between `toyForm.js` and Vue form components.
- `normalizeImageUrl(value)` — wrapper around `normalizeToyImageUrl`, skips if value has whitespace.
- `getToyImageError(vm, value)` — calls `getImageError` with context from the Vue instance.
- `startToyImagePreviewCheck(vm, source, token)` — calls `loadImagePreview`, updates `vm.preview` via `vm.setPreviewState()`.
- `queueToyImagePreview(vm, immediate?)` — checks state before triggering debounce or immediate check.

#### `assets/js/utils.js`

- `sleep(ms)` — Promise wrapper for setTimeout.
- `fetchWithRetry(url, options?, retries?, backoff?, timeout?)` — fetch with retry and abort signal, uses `TOY_NETWORK_SETTINGS`.
- `handleErrors(response)` — normalizes API responses.

#### `assets/js/modalForm.js`

- Shared helpers for resetting forms and focusing fields after a modal opens.

#### `assets/js/loader.js`

- Registers `vue2-sfc-loader` and seeds `moduleCache` with selected shared helper modules.
- After loading: creates Vuex store, attaches `$handleErrors` and `$sleep` to `Vue.prototype`, mounts app.

### UI Components

| File | Description |
|---|---|
| `vue/main.vue` | Main layout, renders header, top-action, toy-collection, modals, toast, back-to-top |
| `vue/toy-collection.vue` + `.js` | Skeleton, empty state, error state, toy list. Calls `toyStore/loadInitialToys` from `mounted()` |
| `vue/toy.vue` + `.js` | Single toy card. Like/edit/delete buttons dispatch to the store |
| `vue/add-toy-form.vue` + `.js` | Create toy form. Validates name + image preview. Dispatches `submitCreateToy` |
| `vue/edit-toy-form.vue` + `.js` | Edit toy form. Preserves `likes`. Dispatches `submitUpdateToy` |
| `vue/modal-confirm.vue` + `.js` | Delete confirmation modal. Dispatches `submitDeleteToy` |
| `vue/toast-region.vue` | Renders toast list from `getters.getToasts` |
| `vue/top-action.vue` | Renders search/sort/add button bar |
| `vue/toy-skeleton.vue` | Skeleton card shown during loading |
| `vue/mosaic-loader.vue` | Loading indicator during seeding |

---

## Main Flows

### 1. Initial Load

1. `toy-collection` mounts → dispatches `toyStore/loadInitialToys`.
2. Commits `SET_IS_LOADING_TOYS(true)`, `SYNC_TOYS([])`.
3. Calls `fetchToys(endpoint)`.
4. If list is empty: commits `SET_IS_AUTO_SEEDING(true)`, calls `seedDemoToys(endpoint, onEach)`.
5. After each successful POST: `PREPEND_TOY(toy)` + `SET_CREATE_TOY_RESULT(toy)`.
6. After seeding completes: `SET_IS_AUTO_SEEDING(false)`, `SYNC_TOYS(result)`.
7. No re-fetch after seeding.

### 2. Create Toy

1. User opens the add modal by dispatching `toggleCreateToyModal` / `setCreateToyModalOpen`.
2. Form validates name and image preview (via `toyVueJsForm.js`).
3. Submit → dispatches `submitCreateToy({ name, image })`.
4. Action calls `createToyRequest`, `PREPEND_TOY`, shows success toast.

### 3. Update Toy

1. Edit button dispatches `setEditingToy(toyId)` → `editingToyId` updates → edit modal opens.
2. `editingToy` getter returns the current toy to populate the form.
3. Submit → dispatches `submitUpdateToy({ id, name, image })`.
4. Action preserves `currentToy.likes` and `currentToy.enabled`, calls `updateToyRequest`, `UPSERT_TOY`, `flashToyCard`, toast.

### 4. Delete Toy

1. Delete button dispatches `setConfirmDeleteToyId(toyId)` → confirm modal opens.
2. User confirms → dispatches `submitDeleteToy`.
3. Action reads `id` from `state.confirmDeleteToyId`, calls `deleteToyRequest`, `REMOVE_DELETE_TARGET_TOY`, toast.

### 5. Like Toy

1. Like button dispatches `incrementToyLikes(toyId)`.
2. `ADD_LIKING_TOY_ID(toyId)` disables the button while waiting.
3. Calls `likeToyRequest`, `UPSERT_TOY(result)`, `flashToyCard`, toast.
4. `REMOVE_LIKING_TOY_ID(toyId)` in `finally`.

---

## Differences from Toys-UI-Javascript

| Aspect | Toys-UI-VueJs | Toys-UI-Javascript |
|---|---|---|
| Framework | Vue 2 + Vuex + bootstrap-vue | No framework |
| State management | Vuex store modules | Local object in `initApp()` |
| UI rendering | `.vue` components + computed/watchers | Imperative DOM via `dom.js` |
| `state.toys` | `Array<toy>` | `Map<string, toy>` |
| Runtime endpoint | `appStore` stores a runtime endpoint override, but the current UI does not expose an endpoint picker | Fixed from `TOY_API_URL` in config |
| Service parameters | All functions have `endpoint` param | No `endpoint` param |
| `createToy` / `updateToy` | Also accepts `enabled` | Only `name`, `image`, (`likes`) |
| Network retry | `fetchWithRetry` in `utils.js` | None |
| Animation | No dedicated animation | Web Animations API via `dom.js` |
| Toast | Custom `toast-region` driven by Vuex state | Bootstrap 5 Toast direct DOM |
| Form bridge | `toyVueJsForm.js` wraps `toyForm.js` for Vue | `toyForm.js` used directly in `app.js` |

---

## Notes on Parity

- `fetchOrSeedToys()` already uses the `seededToys` + `onEach` pattern without re-fetching — in sync with the Javascript version.
- `loadInitialToys()` also uses the same `onEach` pattern to render each toy immediately during seeding.
- `IMAGE_PREVIEW_DEBOUNCE_MS` is sourced from `TOY_FORM_TIMINGS` in config, consistent with the Javascript version.

---

## How to Navigate the Code

For a specific use case, read in this order:

1. `vue/main.vue` — main layout
2. Relevant component (`toy-collection`, `add-toy-form`, `edit-toy-form`, `modal-confirm`, `toy`)
3. `vue/stores/toyStore.js` — find the related action and mutation
4. `assets/js/services/toyService.js` — if related to an API call
5. `assets/js/toyStore.helpers.js` — if related to state mutation
6. `assets/js/toyVueJsForm.js` + `assets/js/toyForm.js` — if related to form/preview
