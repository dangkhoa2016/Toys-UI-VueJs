# Danh sách Đề xuất Tối ưu và Cải tiến Dự án "Toy Tale"

Tài liệu này tổng hợp các hạng mục công việc để hiện đại hóa, tối ưu hóa hiệu suất và cải thiện chất lượng mã nguồn cho dự án.

## 1. Hiện đại hóa Công nghệ (Modernization)

- [ ] **Nâng cấp lên Vue 3:**
    - Chuyển đổi từ Vue 2 sang Vue 3 (sử dụng Composition API).
    - Cập nhật các dependency tương thích với Vue 3.
- [ ] **Chuyển sang Vite làm Build Tool:**
    - Loại bỏ `vue2-sfc-loader` và cơ chế `eval` trong `loader.js`.
    - Cấu hình Vite để hỗ trợ Hot Module Replacement (HMR) và tối ưu hóa khi build (minification, tree-shaking).
- [ ] **Thay thế Vuex bằng Pinia:**
    - Chuyển đổi `appStore.js` và `toyStore.js` sang Pinia store.
    - Tận dụng tính năng TypeScript support tốt hơn của Pinia.

## 2. Cải thiện Cấu trúc và Chất lượng Code

- [ ] **Tổ chức lại thư mục theo chuẩn ES Modules:**
    - Xóa bỏ việc sử dụng biến global (`window.store`, `window.app`).
    - Sử dụng `import/export` chuẩn.
    - Cấu trúc thư mục đề xuất:
        ```
        src/
        ├── assets/       # CSS, Images
        ├── components/   # Vue components
        ├── services/     # API services
        ├── stores/       # Pinia stores
        ├── App.vue
        └── main.js
        ```
- [ ] **Áp dụng TypeScript:**
    - Định nghĩa các Interface cho dữ liệu (ví dụ: `interface Toy`).
    - Tăng tính an toàn và gợi ý code tốt hơn.
- [ ] **Cải thiện quản lý lỗi:**
    - Thay thế hàm `handleErrors` tùy chỉnh bằng một giải pháp tập trung (ví dụ: Axios Interceptors).
    - Hiển thị thông báo lỗi thân thiện hơn cho người dùng (Toast notifications).

## 3. Tối ưu Hiệu suất và UI/UX

- [ ] **Tối ưu hóa Tài nguyên (Assets):**
    - Kiểm tra và nén các file hình ảnh trong thư mục `toys/`.
    - Sử dụng các định dạng ảnh hiện đại như WebP.
- [ ] **Cải thiện trải nghiệm tải trang (Loading State):**
    - Triển khai **Skeleton Loading** thay cho loader đơn giản hiện tại.
    - Lazy-load các hình ảnh đồ chơi khi cuộn trang.
- [ ] **Cải thiện Form và Validation:**
    - Sử dụng thư viện validation (như VeeValidate hoặc Vuelidate).
    - Kiểm tra tính hợp lệ của Image URL và các trường bắt buộc trước khi gửi lên server.
- [ ] **Thống nhất UI Framework:**
    - Loại bỏ sự chồng chéo giữa Bootstrap 5 và Bootstrap Vue (vốn dùng cho Bootstrap 4).
    - Cân nhắc chuyển sang Tailwind CSS hoặc một UI Kit hiện đại như PrimeVue/Element Plus.

## 4. Quản lý và Triển khai (DevOps)

- [ ] **Quản lý biến môi trường:**
    - Sử dụng file `.env` để lưu trữ API Endpoint thay vì hardcode.
- [ ] **Tách biệt Logic API:**
    - Tạo lớp `ToyService.js` để đóng gói các logic gọi API, giúp code trong Component gọn gàng hơn.
- [ ] **Cập nhật tài liệu (Documentation):**
    - Viết lại `README.md` với hướng dẫn cài đặt, chạy môi trường dev và build sản phẩm.

---
*Ghi chú: Bạn có thể chọn thực hiện từng phần hoặc tất cả các thay đổi trên. Tôi sẵn sàng hỗ trợ triển khai theo lựa chọn của bạn.*
