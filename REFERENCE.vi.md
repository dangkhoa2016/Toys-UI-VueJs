# Toys-UI-VueJs Reference

> 🌐 Language / Ngôn ngữ: [English](REFERENCE.md) | **Tiếng Việt**

## Mục đích

Tài liệu này dùng để tra nhanh cấu trúc và logic chính của dự án [`Toys-UI-VueJs`](https://github.com/dangkhoa2016/Toys-UI-VueJs), đồng thời ghi lại các điểm khác biệt so với bản [`Toys-UI-Javascript`](https://github.com/dangkhoa2016/Toys-UI-Javascript).

---

## Tổng quan kiến trúc

Dự án dùng **Vue 2 + Vuex + bootstrap-vue**, không đi qua bundler.

- Component `.vue` được load trực tiếp trong browser bằng `vue2-sfc-loader`.
- State toàn cục được đặt trong Vuex với 2 modules: `appStore` và `toyStore`.
- Logic dùng chung nằm trong `assets/js/`, và loader preload một số helper modules vào `moduleCache` để tránh parse lại giữa các SFC.
- bootstrap-vue được dùng cho `b-modal`; phần toast do component `toast-region` tự render.

---

## Điểm vào chính

| File | Mô tả |
|---|---|
| `index.html` | Mount điểm vào `#app`, nạp Vue, Vuex, `vue2-sfc-loader`, bootstrap-vue qua CDN, rồi load `assets/js/loader.js` |
| `assets/js/loader.js` | Khởi tạo Vuex store, tạo Vue instance, đăng ký `vue2-sfc-loader`, mount `vue/main.vue` |
| `vue/main.vue` | Layout tổng: header, top actions, toy-collection, modals, toast-region, back-to-top |

---

## File quan trọng

### Store

#### `vue/stores/appStore.js`

- Quản lý `endpoint` (URL API) và `appLoaded`.
- Getter `getEndpoint` fallback về `TOY_API_URL` nếu endpoint quá ngắn.
- Action `setEndpoint(payload)` hỗ trợ đổi endpoint runtime trong store, nhưng UI hiện tại chưa có control để đổi endpoint.
- **Các action có gọi API trong `toyStore` lấy endpoint qua `rootGetters['appStore/getEndpoint']`.**

#### `vue/stores/toyStore.js`

- Module Vuex chính, namespaced `toyStore`.
- Chứa toàn bộ mutations, actions, getters cho load, seed, create, update, delete, like, toast, flash.
- State được khởi tạo bởi `createToyStoreState()` từ `toyStore.helpers.js`.
- Key mutations: `SYNC_TOYS`, `PREPEND_TOY`, `UPSERT_TOY`, `REMOVE_DELETE_TARGET_TOY`, `ADD_TOAST`, `REMOVE_TOAST`, `SET_HIGHLIGHTED_TOY`, `ADD_LIKING_TOY_ID`, `REMOVE_LIKING_TOY_ID`.
- Key actions: `loadInitialToys`, `submitCreateToy`, `submitUpdateToy`, `submitDeleteToy`, `incrementToyLikes`, `flashToyCard`, `addToast`, `removeToast`.
- Getter `getToyById(id)` tìm toy trong `Array` bằng `find()`.

### Assets JS dùng chung

#### `assets/js/config.js`

- `TOY_API_URL` — URL backend, ưu tiên `window.TOY_API_URL` nếu có.
- `DEMO_DATA_PATH` — `/assets/db.json`.
- `TOY_FORM_TIMINGS.IMAGE_PREVIEW_DEBOUNCE_MS` — debounce thời gian check preview ảnh.
- `TOY_UI_DELAYS.HIGHLIGHT_RESET_MS` — thời gian tự tắt highlight card.
- `TOY_NETWORK_SETTINGS` — `RETRY_COUNT`, `BACKOFF_MS`, `TIMEOUT_MS` dùng cho retry logic.
- `TOY_TEMPLATE_SETTINGS.SKELETON_CARD_COUNT` — số skeleton cards khi loading.
- `normalizeToyImageUrl(image)` — chuẩn hóa path ảnh về `/assets/images/toys/`.
- `toApiImageUrl(image)` — convert path ảnh thành absolute URL để gửi lên API.
- `normalizeToy(toy)` — chuẩn hóa object toy (trim name, normalize image, ensure likes >= 0).

#### `assets/js/services/toyService.js`

- Mọi hàm đều nhận `endpoint` làm tham số cuối (default = `TOY_API_URL`).
- `fetchToys(endpoint?)` — GET danh sách.
- `seedDemoToys(endpoint?, onEach?)` — POST demo toys từ `db.json`, gọi `onEach(toy)` sau mỗi thành công.
- `fetchOrSeedToys(endpoint?)` — nếu danh sách rỗng, seed rồi trả về `seededToys` (không re-fetch).
- `createToy({ name, image, enabled?, likes? }, endpoint?)` — POST toy mới.
- `updateToy(id, { name, image, likes, enabled }, endpoint?)` — PUT toy.
- `likeToy(toy, endpoint?)` — PATCH `/likes`.
- `deleteToy(toyId, endpoint?)` — DELETE toy.
- Có class `ApiError` và `formatServerErrorMessage()` để chuẩn hoá error từ server.

#### `assets/js/toyStore.helpers.js`

- **`state.toys` là `Array<toy>`** — duyệt bằng `find()` và `findIndex()`.
- `createToyStoreState()` — tạo state ban đầu (toys, searchTerm, sortOrder, toasts, highlightedToy, editingToyId, confirmDeleteToyId, isLoadingToys, isAutoSeeding, v.v.).
- `syncToyState(state, toys)` — ghi đè `state.toys` và cập nhật `totalToys`.
- `prependToyState(state, toy)` — thêm toy lên đầu, loại bỏ duplicate theo id.
- `updateToyState(state, toy)` — upsert toy theo id (update nếu có, push nếu chưa có).
- `removeToyState(state, toyId?)` — xóa bằng `splice`, fallback về `confirmDeleteToyId`.
- `getVisibleToys(state)` — filter + sort từ `state.toys` (Array).
- `flashToyState(state, toyId)` — ghi `highlightedToy` với `nonce = Date.now()`.
- `addToastState(state, payload)` / `removeToastState(state, id)`.
- `getToastMessage(error, fallback)` — extract message từ error string/object.

#### `assets/js/toyForm.js`

- `IMAGE_PREVIEW_DEBOUNCE_MS` — lấy từ `TOY_FORM_TIMINGS` trong config.
- `getNameError(value)` / `getImageError({value, normalizedImageUrl, preview})` — trả về error string hoặc rỗng.
- `loadImagePreview(src)` — load ảnh test bằng `new Image()`, resolve/reject.
- `getSubmitDisableReason({...})` — xác định lý do disable nút submit.
- `createToyFormValues({toy?, includeLikes?})` — tạo object values cho form.
- `createPreviewState({message?, placeholderMessage?})` — tạo state preview ban đầu.

#### `assets/js/toyVueJsForm.js`

- Bridge giữa `toyForm.js` và các Vue component form.
- `normalizeImageUrl(value)` — wrapper gọi `normalizeToyImageUrl`, bỏ qua nếu có whitespace.
- `getToyImageError(vm, value)` — gọi `getImageError` với context từ Vue instance.
- `startToyImagePreviewCheck(vm, source, token)` — gọi `loadImagePreview`, cập nhật `vm.preview` bằng `vm.setPreviewState()`.
- `queueToyImagePreview(vm, immediate?)` — kiểm tra trạng thái trước khi trigger debounce hoặc check ngay.

#### `assets/js/utils.js`

- `sleep(ms)` — Promise wrapper cho setTimeout.
- `fetchWithRetry(url, options?, retries?, backoff?, timeout?)` — fetch với retry và abort signal, sử dụng `TOY_NETWORK_SETTINGS`.
- `handleErrors(response)` — chuẩn hóa response từ API.

#### `assets/js/modalForm.js`

- Các helper dùng chung về reset form và focus field sau khi modal mở.

#### `assets/js/loader.js`

- Đăng ký `vue2-sfc-loader` và nạp sẵn một số shared helper modules vào `moduleCache`.
- Sau khi load: tạo Vuex store, đặt `$handleErrors` và `$sleep` lên `Vue.prototype`, mount app.

### UI component

| File | Mô tả |
|---|---|
| `vue/main.vue` | Layout tổng, render header, top-action, toy-collection, modal, toast, back-to-top |
| `vue/toy-collection.vue` + `.js` | Skeleton, empty state, error state, danh sách toys. Gọi `toyStore/loadInitialToys` từ `mounted()` |
| `vue/toy.vue` + `.js` | Card một toy. Nút like/edit/delete dispatch lên store |
| `vue/add-toy-form.vue` + `.js` | Form tạo toy mới. Validate name + image preview. Dispatch `submitCreateToy` |
| `vue/edit-toy-form.vue` + `.js` | Form edit toy. Giữ nguyên `likes`. Dispatch `submitUpdateToy` |
| `vue/modal-confirm.vue` + `.js` | Modal xác nhận xóa. Dispatch `submitDeleteToy` |
| `vue/toast-region.vue` | Render danh sách toast từ `getters.getToasts` |
| `vue/top-action.vue` | Render thanh search/sort/add button |
| `vue/toy-skeleton.vue` | Skeleton card khi loading |
| `vue/mosaic-loader.vue` | Loading indicator khi seeding |

---

## Flow chính

### 1. Load lần đầu

1. `toy-collection` mount → dispatch `toyStore/loadInitialToys`.
2. Commit `SET_IS_LOADING_TOYS(true)`, `SYNC_TOYS([])`.
3. Gọi `fetchToys(endpoint)`.
4. Nếu danh sách rỗng: commit `SET_IS_AUTO_SEEDING(true)`, gọi `seedDemoToys(endpoint, onEach)`.
5. Mỗi request POST thành công: `PREPEND_TOY(toy)` + `SET_CREATE_TOY_RESULT(toy)`.
6. Sau seed xong: `SET_IS_AUTO_SEEDING(false)`, `SYNC_TOYS(result)`.
7. Không re-fetch danh sách sau khi seed.

### 2. Create toy

1. User mở add modal bằng cách dispatch `toggleCreateToyModal` / `setCreateToyModalOpen`.
2. Form validate name và image preview (qua `toyVueJsForm.js`).
3. Submit → dispatch `submitCreateToy({ name, image })`.
4. Action gọi `createToyRequest`, `PREPEND_TOY`, hiện toast thành công.

### 3. Update toy

1. Nút edit dispatch `setEditingToy(toyId)` → `editingToyId` cập nhật → modal edit mở.
2. `editingToy` getter trả về toy hiện tại để populate form.
3. Submit → dispatch `submitUpdateToy({ id, name, image })`.
4. Action giữ `currentToy.likes` và `currentToy.enabled`, gọi `updateToyRequest`, `UPSERT_TOY`, `flashToyCard`, toast.

### 4. Delete toy

1. Nút delete dispatch `setConfirmDeleteToyId(toyId)` → modal confirm mở.
2. User xác nhận → dispatch `submitDeleteToy`.
3. Action lấy `id` từ `state.confirmDeleteToyId`, gọi `deleteToyRequest`, `REMOVE_DELETE_TARGET_TOY`, toast.

### 5. Like toy

1. Nút like dispatch `incrementToyLikes(toyId)`.
2. `ADD_LIKING_TOY_ID(toyId)` để disable nút trong lúc chờ.
3. Gọi `likeToyRequest`, `UPSERT_TOY(result)`, `flashToyCard`, toast.
4. `REMOVE_LIKING_TOY_ID(toyId)` trong `finally`.

---

## Khác biệt so với Toys-UI-Javascript

| Khía cạnh | Toys-UI-VueJs | Toys-UI-Javascript |
|---|---|---|
| Framework | Vue 2 + Vuex + bootstrap-vue | Không có framework |
| State management | Vuex store modules | Object cục bộ trong `initApp()` |
| Render UI | Component `.vue` + computed/watcher | DOM imperative qua `dom.js` |
| `state.toys` | `Array<toy>` | `Map<string, toy>` |
| Endpoint runtime | `appStore` lưu endpoint override ở runtime, nhưng UI hiện tại chưa có bộ chọn endpoint | Cố định từ `TOY_API_URL` trong config |
| Tham số service | Có `endpoint` param trên mọi hàm | Không có `endpoint` param |
| `createToy` / `updateToy` | Nhận thêm `enabled` | Chỉ `name`, `image`, (`likes`) |
| Network retry | `fetchWithRetry` trong `utils.js` | Không có |
| Animation | Không có animation riêng | Web Animations API qua `dom.js` |
| Toast | `toast-region` custom dùng state từ Vuex | Bootstrap 5 Toast DOM trực tiếp |
| Form bridge | `toyVueJsForm.js` wraps `toyForm.js` cho Vue | `toyForm.js` dùng trực tiếp trong `app.js` |

---

## Điểm cần lưu ý khi đối chiếu parity

- `fetchOrSeedToys()` đã dùng pattern `seededToys` + `onEach`, không re-fetch — đã đồng bộ với bản Javascript.
- `loadInitialToys()` cũng dùng cùng pattern `onEach` để render ngay từng toy khi seed.
- `IMAGE_PREVIEW_DEBOUNCE_MS` được lấy từ `TOY_FORM_TIMINGS` trong config, đồng nhất với bản Javascript.

---

## Cách đọc code nhanh

Nếu cần theo một use case cụ thể, nên đọc theo thứ tự sau:

1. `vue/main.vue` — layout tổng
2. Component liên quan (`toy-collection`, `add-toy-form`, `edit-toy-form`, `modal-confirm`, `toy`)
3. `vue/stores/toyStore.js` — tìm action và mutation liên quan
4. `assets/js/services/toyService.js` — nếu liên quan đến API call
5. `assets/js/toyStore.helpers.js` — nếu liên quan đến state mutation
6. `assets/js/toyVueJsForm.js` + `assets/js/toyForm.js` — nếu liên quan đến form/preview

