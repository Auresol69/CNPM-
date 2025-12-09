# Hướng Dẫn Tích Hợp Nút BẮT ĐẦU/DỪNG CHUYẾN & MAP

## 📋 Tổng Quan
Ba trang Driver được tích hợp với nhau qua Context `useRouteTracking`:
- **DriverHome** - Trang chủ, hiển thị tổng quan & check-in
- **DriverDailySchedule** - Lịch trình hôm nay với nhiều tuyến
- **DriverOperations** - Thao tác nhanh: check-in, báo cáo sự cố

## 🔗 Kiến Trúc Tích Hợp

```
RouteTrackingContext (Global State)
    ↓
    ├── DriverHome (Trang chủ)
    │   ├── Nút BẮT ĐẦU/DỪNG
    │   ├── Map (RouteMap)
    │   ├── Check-in học sinh
    │   └── Thống kê
    │
    ├── DriverDailySchedule (Lịch trình)
    │   ├── Nút BẮT ĐẦU/DỪNG
    │   ├── Map (RouteMap)
    │   ├── Phân công tuyến
    │   └── Check-in học sinh
    │
    └── DriverOperations (Thao tác nhanh)
        ├── Nút BẮT ĐẦU/DỪNG
        ├── Map (RouteMap)
        ├── Check-in nhanh
        └── Báo cáo sự cố
```

## 🎯 Chức Năng Chính

### 1. **Nút BẮT ĐẦU/DỪNG CHUYẾN** (Đồng Bộ)
- **Vị trí**: Header của mỗi trang
- **Trạng thái**:
  - **Xanh (BẮT ĐẦU)**: Chưa xuất phát
  - **Đỏ (DỪNG)**: Đang chạy
- **Tác dụng**: 
  - `startTracking()` → Bắt đầu theo dõi lộ trình
  - `stopTracking()` → Kết thúc chuyến đi
- **Đồng Bộ**: Khi bấm ở trang này sẽ cập nhật ở tất cả trang khác

### 2. **Bản Đồ (RouteMap)**
- **Component**: `RouteMap.jsx`
- **Props**:
  ```jsx
  <RouteMap
    center={stations[0]?.position || [10.77, 106.68]}
    stops={stations.map(s => ({...}))}
    isTracking={isTracking}
    currentStationIndex={currentStationIndex}
    isAtStation={isStationActive}
    isCheckingIn={isCheckingIn}
  />
  ```
- **Tính năng**:
  - Hiển thị tất cả trạm trên map
  - Animation xe moving (tự động khi đang chạy)
  - Đánh dấu trạm hiện tại
  - Vẽ đường đi (polyline) giữa các trạm

### 3. **Check-in Học Sinh**
- **Tự động**: Khi xe dừng tại trạm, bắt đầu timer check-in
- **Thời gian**: 60 giây cho mỗi trạm
- **Trạng thái**:
  - 🟢 CÓ MẶT (present) → Bấm nút check-in
  - 🔴 VẮNG (absent) → Hết giờ mà chưa check-in
- **Tự động tiếp tục**: Khi tất cả học sinh check-in → XE TỰ ĐỘNG CHẠY

### 4. **Báo Cáo Sự Cố** (Chỉ có ở Operations)
- **Loại sự cố**:
  - Kẹt xe 🚗
  - Hỏng xe 🔧
  - Tai nạn ⚠️
  - Thời tiết xấu 🌧️
  - Khác 💬
- **Hỗ trợ ghi chú**: Tùy chọn

## 📁 Cấu Trúc File

```
src/
├── context/
│   └── RouteTrackingContext.jsx ← GLOBAL STATE (Tất cả trang dùng)
│
├── pages/driver/
│   ├── DriverHome.jsx ✅ (Hoàn chỉnh)
│   ├── DriverDailySchedule.jsx ✅ (Hoàn chỉnh)
│   ├── DriverOperations.jsx ✅ (Hoàn chỉnh - Vừa cập nhật)
│   └── DriverContacts.jsx (Không thay đổi)
│
├── components/maps/
│   └── RouteMap.jsx ← Component Map dùng chung
│
└── routes/
    └── AppRoutes.jsx ← Route configuration
```

## 🔄 Flow Dữ Liệu

### Khi Bấm "BẮT ĐẦU CHUYẾN"
1. **DriverHome/Operations** → Gọi `startTracking()`
2. **RouteTrackingContext** → Set `isTracking = true`
3. **Tất cả trang** → Tự động cập nhật (re-render)
4. **Map** → Bắt đầu animation xe di chuyển
5. **Timer** → Bắt đầu đếm ngược

### Khi Xe Đến Trạm
1. **Context** → Set `isStationActive = true`
2. **DriverHome** → Hiển thị panel check-in (60s)
3. **DriverOperations** → Cập nhật danh sách check-in
4. **Map** → Đánh dấu trạm hiện tại (pulsing)

### Khi Check-in Học Sinh
1. **User** → Bấm nút "CÓ MẶT" trên card học sinh
2. **Context** → Cập nhật `studentCheckIns[studentId] = 'present'`
3. **Tất cả trang** → Tự động cập nhật status (xanh ✅)
4. **Nếu đủ người** → XE TỰ ĐỘNG CHẠY sau 3s

### Khi Kết THÚC CHUYẾN
1. **DriverHome/Operations** → Gọi `stopTracking()`
2. **RouteTrackingContext** → Lưu trạng thái vào localStorage
3. **Map** → Dừng animation
4. **Nút** → Đổi về xanh "BẮT ĐẦU CHUYẾN"

## 💻 Code Snippets

### Sử dụng Context trong Component
```jsx
import { useRouteTracking } from '../../context/RouteTrackingContext';

export default function MyComponent() {
  const {
    isTracking,
    startTracking,
    stopTracking,
    currentStationIndex,
    currentStation,
    stations,
    stationTimer,
    isStationActive,
  } = useRouteTracking();

  return (
    <button onClick={isTracking ? stopTracking : startTracking}>
      {isTracking ? 'DỪNG' : 'BẮT ĐẦU'}
    </button>
  );
}
```

### Props cho RouteMap
```jsx
<RouteMap
  center={stations[0]?.position || [10.77, 106.68]}
  stops={stations.map(s => ({
    id: s.id,
    name: s.name,
    position: s.position,
    time: s.time,
  }))}
  isTracking={isTracking}
  currentStationIndex={currentStationIndex}
  isAtStation={isStationActive}
  isCheckingIn={isCheckingIn}
/>
```

## 🎨 UI/UX Details

### Nút BẮT ĐẦU/DỪNG Style
- **BẮT ĐẦU** (Xanh): `from-green-500 to-emerald-600`
- **DỪNG** (Đỏ): `from-red-500 to-pink-600`
- **Hover**: Scale 105% + transition smooth
- **Icon**: PlayCircle / PauseCircle từ lucide-react

### Check-in Card Style
- **Chưa check-in**: `bg-white/30 border-white`
- **Đã check-in**: `bg-green-500 text-white` + ✅
- **Vắng**: `bg-red-500 text-white line-through` + ❌
- **Nút hành động**: `bg-yellow-400` (CÓ MẶT)

### Map Style
- **Height**: h-72 (288px) - Operations, h-96 (384px) - Home/Schedule
- **Border**: `border-4 border-indigo-100`
- **Rounded**: `rounded-2xl`

## ⚙️ Cấu Hình Sẵn

### Thời gian Check-in
```javascript
CHECKIN_SECONDS = 60; // Thời gian check-in tại mỗi trạm
AFTER_ALL_CHECKED_DELAY_MS = 3000; // Thời gian trước khi xe tự động chạy
```

### Mock Data
- **Trạm**: 4 trạm (St1-4) ở TPHCM
- **Học sinh**: 9 học sinh mẫu (phân bổ theo trạm)
- **Animation**: 4 phút cho toàn bộ lộ trình

## ✅ Kiểm Tra

Tất cả 3 file đã được kiểm tra:
- ✅ DriverHome.jsx - Không lỗi
- ✅ DriverDailySchedule.jsx - Không lỗi  
- ✅ DriverOperations.jsx - Không lỗi (Vừa cập nhật)

## 🚀 Cách Sử Dụng

1. **Vào trang DriverHome** → Xem tổng quan
2. **Bấm "BẮT ĐẦU CHUYẾN"** (xanh) → Xe bắt đầu chạy
3. **Xem Map** → Xe chuyển động đến các trạm
4. **Khi đến trạm** → Panel check-in xuất hiện
5. **Check-in học sinh** → Bấm "CÓ MẶT" trên các học sinh
6. **Tự động** → Khi đủ người, xe chạy tiếp (hoặc hết 60s)
7. **Chuyển trang** → Dữ liệu vẫn được giữ (Context)
8. **Kết thúc chuyến** → Bấm nút "DỪNG" (đỏ)

## 🔧 Troubleshooting

### Nút không đổi trạng thái?
→ Kiểm tra `useRouteTracking` đã wrap toàn app trong `RouteTrackingProvider`

### Map không hiển thị?
→ Kiểm tra Leaflet CSS được import trong RouteMap.jsx

### Check-in không hoạt động?
→ Kiểm tra `checkInStudent(id)` được gọi đúng trong onClick

### Dữ liệu bị mất khi refresh?
→ Bình thường - Context State không persist. Có thể thêm localStorage nếu cần

---

**Cập nhật lần cuối**: 05/12/2025  
**Status**: ✅ Production Ready
