# Danh sách Đề xuất Tối ưu và Cải tiến Dự án "Toy Tale" (Giữ nguyên Vue 2 & No-build)

Tài liệu này tập trung vào các cải tiến khả thi ngay trong môi trường hiện tại (Vue 2, tải SFC trực tiếp trên trình duyệt) mà không cần qua bước đóng gói (build tool).

## 1. Cấu trúc và Chất lượng Code

- [ ] **Loại bỏ việc sử dụng `eval` và biến Global:**
    - Thay đổi cách tải store trong `loader.js` để tránh dùng `eval`. Có thể sử dụng `import()` động nếu trình duyệt hỗ trợ hoặc tận dụng chính `loadModule` của `vue2-sfc-loader`.
    - Hạn chế gắn mọi thứ vào `window`. Sử dụng cơ chế truyền nhận dữ liệu giữa các component chuẩn của Vue.
- [ ] **Tổ chức lại Logic API:**
    - Tạo một file `services/api.js` (tải qua CDN hoặc local JS) để đóng gói các hàm `fetch`. Tránh việc viết trực tiếp logic fetch API bên trong Vuex actions.
- [ ] **Sử dụng JSDoc cho Type Hinting:**
    - Do không dùng TypeScript (vì cần build), có thể sử dụng JSDoc để hỗ trợ nhắc mã (IntelliSense) trong VS Code, giúp quản lý các object như `Toy` tốt hơn.
- [ ] **Cải thiện xử lý lỗi (Error Handling):**
    - Chuẩn hóa hàm `handleErrors` trong `loader.js`.
    - Thêm các thông báo lỗi (Alerts/Toasts) sinh động hơn khi API thất bại.

## 2. Tối ưu Hiệu suất (Performance)

- [ ] **Tối ưu hóa hình ảnh:**
    - Nén các hình ảnh trong thư mục `toys/` bằng các công cụ online để giảm dung lượng tải xuống (vì không có build tool để tự động nén).
- [ ] **Cải thiện cơ chế Loading:**
    - Hiện tại trang chủ hiện Loader từ `index.html`. Có thể tối ưu hóa để Loader này biến mất mượt mà hơn khi Vue app đã sẵn sàng (mounted).
    - Lazy load các thành phần không cần thiết ngay lập tức.

## 3. Cải thiện UI/UX

- [ ] **Xây dựng Skeleton Loading:**
    - Tạo một component `ToySkeleton.vue` để hiển thị khung xám trong khi chờ dữ liệu từ API, thay vì để trống màn hình.
- [ ] **Form Validation:**
    - Thêm kiểm tra dữ liệu cho form thêm đồ chơi (không được để trống, kiểm tra định dạng URL ảnh) bằng logic Javascript thuần trước khi submit.
- [ ] **Thống nhất giao diện (UI Consistency):**
    - Dự án đang dùng CSS Bootstrap 5 nhưng Bootstrap Vue lại dựa trên Bootstrap 4, dẫn đến một số xung đột nhỏ về style. Nên điều chỉnh lại CSS để đồng nhất 1 phiên bản.
- [ ] **Thêm hiệu ứng chuyển cảnh (Transitions):**
    - Sử dụng `<transition>` của Vue để làm mượt các hành động như ẩn/hiện form, thêm/xóa đồ chơi.

## 4. Quản lý và Tài liệu

- [ ] **Quản lý cấu hình (Configuration):**
    - Tạo một file `config.js` riêng để chứa `API_ENDPOINT` và các cấu hình ứng dụng, giúp dễ dàng thay đổi khi chuyển đổi môi trường mà không cần tìm trong mã nguồn.
- [ ] **Cập nhật README.md:**
    - Hướng dẫn cách chạy dự án (ví dụ: dùng Live Server) và cấu trúc của các file `.vue` hiện tại để người sau dễ tiếp cận.

---
*Ghi chú: Tất cả các hạng mục trên đều có thể thực hiện trực tiếp mà không làm thay đổi cấu trúc "No-build" hiện tại của bạn.*
