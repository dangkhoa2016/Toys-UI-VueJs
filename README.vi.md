# Toy Tale Client (Vue 2, No-Build)

> 🌐 Language / Ngôn ngữ: [English](README.md) | **Tiếng Việt**

Toy Tale là client Vue 2 tải trực tiếp các component `.vue` trên trình duyệt bằng `vue2-sfc-loader`, không cần bundler.

Client này cũng đang được dùng như giao diện test thủ công/integration cho các dự án backend Toy API:
[Toy-Api-Server-Nodejs](https://github.com/dangkhoa2016/Toy-Api-Server-Nodejs)
và
[Toy-Api-Server-Cloudflare-Worker](https://github.com/dangkhoa2016/Toy-Api-Server-Cloudflare-Worker).

## Tính Năng Nổi Bật

- Tải danh sách toys từ API và tự động seed dữ liệu demo khi API trả về danh sách rỗng.
- Hiển thị skeleton cards khi đang tải và full-screen mosaic loader cho thao tác mất thời gian.
- Tạo toy trong modal form với validation thời gian thực và kiểm tra preview ảnh có debounce.
- Chỉnh sửa thông tin toy mà không reset số likes hiện tại.
- Like toy tức thì với busy state theo từng card và hiệu ứng highlight phản hồi.
- Xóa toy bằng modal xác nhận, khóa backdrop và disable controls trong lúc đang xóa.
- Tìm kiếm theo tên toy và sắp xếp theo mặc định / likes giảm dần / likes tăng dần.
- Hiển thị toast notifications cho trạng thái thành công, cảnh báo và lỗi.
- Có animation khi item vào/ra danh sách, reorder và pulse khi cập nhật để UX rõ ràng hơn.

## Công nghệ sử dụng

- Framework chính: `Vue 2.7.14` với state tập trung bằng `Vuex 3.6.2`.
- Bộ nạp SFC runtime: build `vue2-sfc-loader` (được phân phối từ `vue3-sfc-loader`).
- Thư viện UI: `Bootstrap 5.2.3` (CSS) và component `BootstrapVue 2.23.1`.
- Browser/runtime APIs: `ES modules` native và `Fetch API` (kèm retry helper trong mã nguồn).
- Hỗ trợ runtime: polyfill `es6-promise` nạp từ CDN.
- Cách chạy local: `npx serve` theo kiến trúc static no-build.
- Backend tích hợp: REST API từ `Toy-Api-Server-Nodejs` và `Toy-Api-Server-Cloudflare-Worker`.

## Bắt Đầu Nhanh

### 1) Khởi động API server (khuyến nghị)

Các repository backend tham chiếu (được dùng để test cùng UI này):

- https://github.com/dangkhoa2016/Toy-Api-Server-Nodejs
- https://github.com/dangkhoa2016/Toy-Api-Server-Cloudflare-Worker

Lựa chọn A - chạy backend Node.js từ thư mục gốc workspace:

```bash
cd Toy-Api-Server-Nodejs
npm install
npm run dev
```

Lựa chọn B - chạy backend Cloudflare Worker từ thư mục gốc workspace:

```bash
cd Toy-Api-Server-Cloudflare-Worker
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Nếu bạn chưa có project Node.js API trên máy:

```bash
git clone https://github.com/dangkhoa2016/Toy-Api-Server-Nodejs.git
cd Toy-Api-Server-Nodejs
npm install
npm run dev
```

API URL mặc định mà client dùng trên localhost:

```text
http://localhost:8080/api/toys
```

Nếu bạn chạy Cloudflare Worker ở local, hãy override API URL sang địa chỉ Wrangler local trước khi app được tải, ví dụ:

```html
<script>
  window.TOY_API_URL = "http://127.0.0.1:8787/api/toys";
</script>
```

### 2) Chạy client bằng `npx serve`

Từ thư mục dự án này:

```bash
cd Toys-UI-VueJs
npx serve .
```

Bạn có thể đặt port cố định nếu cần:

```bash
npx serve . -l 3000
```

Sau đó mở URL local được in ra bởi serve (ví dụ `http://localhost:3000`).

## Cách Chọn API Endpoint

`assets/js/config.js` chọn API endpoint theo hostname:

- Trên `localhost` / `127.0.0.1`: dùng `http://localhost:8080/api/toys`.
- Trên host không phải local: dùng endpoint API fallback đã forward.

Bạn có thể override API URL global trước khi tải `loader.js`:

```html
<script>
  window.TOY_API_URL = "https://your-api.example.com/api/toys";
</script>
```

## Cấu Trúc Dự Án

| Đường dẫn | Vai trò |
| --- | --- |
| `index.html` | Khung app và các CDN runtime dependencies |
| `assets/js/loader.js` | Khởi tạo Vue + tích hợp `vue2-sfc-loader` + module cache wiring |
| `assets/js/config.js` | Bộ constants/enums tập trung, chọn API URL, chuẩn hóa ảnh |
| `assets/js/services/toyService.js` | Tầng tích hợp API cho list/create/update/like/delete |
| `assets/js/services/api.js` | Tầng compatibility export service |
| `assets/js/toyStore.helpers.js` | Helper state dùng chung cho sort/filter/toast/list updates |
| `assets/js/toyForm.js` | Validation form dùng chung, preview lifecycle, submit lock logic |
| `assets/js/toyVueJsForm.js` | Helper bridge riêng cho Vue về image preview và computed form state |
| `assets/js/modalForm.js` | Utility quan sát backdrop và reset form có quản lý |
| `assets/js/utils.js` | Retry helpers và chuẩn hóa lỗi response |
| `vue/main.vue` | Root app composition và layout chính |
| `vue/stores/appStore.js` | State cấp app: endpoint và app loaded flags |
| `vue/stores/toyStore.js` | State/actions/mutations/getters chính của domain toy |
| `vue/*.vue` và `vue/*.js` | UI components và sidecar logic cho controls, collection, forms, modal, toast, loader |
| `assets/db.json` | Dữ liệu demo để seed |
| `assets/images/toys/` | Ảnh toy local |

## Ghi Chú Runtime

- Chỉ chạy qua HTTP. Mở `index.html` bằng `file://` sẽ không hoạt động.
- App giữ kiến trúc no-build để dễ đọc code và iterate nhanh.
- Loader module cache map các helper dùng chung để import runtime của SFC ổn định.
- Form tạo và sửa yêu cầu preview ảnh hợp lệ trước khi mở khóa submit.
- Modal xóa chặn đóng ngoài ý muốn khi đang xóa và disable action buttons trong lúc bận.
- Khi API rỗng, app tự chạy luồng auto-seed bằng `assets/db.json`.
- Đường dẫn ảnh tương đối hoặc dạng cũ sẽ được chuẩn hóa trước khi render/gửi lên API.
- Toasts tự ẩn theo cấu hình delay trong file config tập trung.

## Thư Viện Ảnh Chụp Màn Hình

Bộ ảnh đầy đủ đã được tách ra tại [SCREENSHOTS.vi.md](SCREENSHOTS.vi.md).
Nếu muốn xem bản tiếng Anh, mở [SCREENSHOTS.md](SCREENSHOTS.md).

## Khắc Phục Sự Cố

- **Unable to load toys**:
  - Đảm bảo API server đang chạy tại `http://localhost:8080`.
  - Kiểm tra browser console/network tab để xem lỗi CORS hoặc lỗi kết nối.
  - Bấm nút retry ở trạng thái lỗi trong khu vực danh sách.
- **Image preview stays locked**:
  - Dùng URL ảnh hợp lệ bắt đầu bằng `http://` hoặc `https://`.
  - Hoặc dùng đường dẫn ảnh local hợp lệ trong `assets/images/toys/`.
- **SFCs fail to load**:
  - Đảm bảo app đang được serve qua HTTP (không dùng `file://`).
  - Mở DevTools network tab để xem request module nào bị fail.

## Tài Liệu Tham Khảo Dành Cho Developer

Để xem tổng quan chi tiết về kiến trúc dự án, các file quan trọng, luồng dữ liệu và các điểm parity với [`Toys-UI-Javascript`](https://github.com/dangkhoa2016/Toys-UI-Javascript), xem [REFERENCE.vi.md](REFERENCE.vi.md).
Bản tiếng Anh: [REFERENCE.md](REFERENCE.md).

## Giấy Phép

Dự án này phục vụ mục đích phát triển/demo trong workspace hiện tại.
