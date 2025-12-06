
# BACKEND SPECIFICATIONS (Dành riêng cho Parent Module)

## 1. Cấu hình Chung

- [cite_start]**Base URL:** `https://smart-school-bus-api.onrender.com/api/v1` [cite: 607]
- [cite_start]**Authentication:** Tất cả API (trừ Login) đều yêu cầu Header: `Authorization: Bearer <access_token>`[cite: 606].

## 2. API Xác thực (Auth)

- **Đăng nhập:**
  - Method: `POST`
  - [cite_start]Endpoint: `/auth/signin` [cite: 610]
  - [cite_start]Body: `{ "email": "...", "password": "..." }` [cite: 614-615]
  - [cite_start]Response: Trả về `token` và thông tin `user` (`_id`, `name`, `role`, `email`) [cite: 620-627].
- **Đăng xuất:**
  - Method: `DELETE`
  - [cite_start]Endpoint: `/auth/logout` [cite: 634]

## 3. API Theo dõi & Bản đồ (Tracking Map)

### Lấy chi tiết chuyến đi (Để vẽ bản đồ & Xem trạng thái)

- [cite_start]**Endpoint:** `GET /trips/:id` [cite: 697]
- **Dữ liệu quan trọng cần lấy:**
  - **Vẽ đường (Polyline):** `data.scheduleId.routeId.shape.coordinates`.
    - [cite_start]*Lưu ý:* Backend trả về `[Lng, Lat]` (Kinh độ trước), cần đảo ngược thành `[Lat, Lng]` cho Leaflet[cite: 692].
  - **Vẽ Trạm (Markers):** `data.scheduleId.stopTimes`. [cite_start]Mỗi phần tử chứa `stationId` (có `name`, `latitude`, `longitude`)[cite: 705].
  - **Trạng thái con (Status):** `data.studentStops`.
    - [cite_start]Chứa `studentId`, `stationId`, `action` (PICKED_UP, DROPPED_OFF, ABSENT), `timestamp` [cite: 654-658].
  - **Thông tin Xe & Tài xế:**
    - [cite_start]Xe: `data.busId.licensePlate`[cite: 641].
    - Tài xế: `data.driverId.name`, `data.driverId.phone` (Cần kiểm tra lại field phone trong response thực tế).

### Dẫn đường đi bộ (Tính năng nâng cao - Optional)

- [cite_start]**Endpoint:** `GET /stations/:id/walking-directions` [cite: 715]
- **Params:** `?lat=...&lng=...` (Vị trí hiện tại của phụ huynh).
- [cite_start]**Công dụng:** Vẽ đường đi bộ từ nhà đến trạm đón[cite: 726].

## 4. API Thông báo (Notifications)

- **Lấy danh sách thông báo:**
  - Method: `GET`
  - [cite_start]Endpoint: `/notifications/me` [cite: 746]
  - [cite_start]Response: Danh sách thông báo (`message`, `createdAt`, `contextStudentId`) [cite: 754-758].
- **Xóa thông báo:**
  - Method: `DELETE`
  - [cite_start]Endpoint: `/notifications/:id` [cite: 769]

## 5. API Hồ sơ (Profile)

- **Cập nhật thông tin cá nhân:**
  - Method: `PATCH`
  - [cite_start]Endpoint: `/users/me` [cite: 736]
  - [cite_start]Body: `{ "name": "...", "avatar": "..." }` [cite: 740-741].

## 6. Socket Events (Real-time)

*Dựa trên ngữ cảnh dự án*

- **Kết nối:** Gửi kèm Token.
- **Lắng nghe (Client on):**
  - `bus:location_changed`: Nhận tọa độ xe `{ lat, lng }` để cập nhật Marker trên bản đồ.
  - `student:checked_in`: Nhận thông báo khi con lên/xuống xe (Có thể kèm `evidenceUrl`).
  - `bus:approaching_station`: Thông báo xe sắp đến trạm.
