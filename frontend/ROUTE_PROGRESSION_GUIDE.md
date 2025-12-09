# Route Progression Logic - Hướng dẫn chi tiết

## Tổng quan

Hệ thống đã được cập nhật để hỗ trợ **nhiều tuyến đường trong một ngày** với logic tự động chuyển tuyến khi hoàn thành tuyến hiện tại.

## Cấu trúc dữ liệu

### 1. Routes (Tuyến đường)

```javascript
const ROUTES_TODAY = [
    {
        id: 'route1',
        name: 'Tuyến 01 - Sáng',
        time: '06:30 - 07:30',
        totalStudents: 28,
        stations: [
            { id: 'st1', name: 'Trạm A - Nguyễn Trãi', position: [10.7628, 106.6602], time: '06:35' },
            { id: 'st2', name: 'Trạm B - Lê Văn Sỹ', position: [10.7640, 106.6670], time: '06:42' },
            { id: 'st3', name: 'Trạm C - CMT8', position: [10.7715, 106.6780], time: '06:50' },
            { id: 'st4', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '07:05' },
        ],
    },
    {
        id: 'route2',
        name: 'Tuyến 02 - Chiều',
        time: '16:00 - 17:00',
        totalStudents: 25,
        stations: [
            { id: 'st5', name: 'THPT Lê Quý Đôn', position: [10.7800, 106.6950], time: '16:00' },
            // ... more stations
        ],
    },
    // ... more routes
];
```

## Quy trình hoạt động

### Quy tắc chuyển trạm trong một tuyến

1. **Xe đến trạm** → Dừng lại
2. **Check-in học sinh**:
   - Đợi 3 giây
   - Hiển thị giao diện check-in (60 giây)
   - Nếu **hết giờ → đánh dấu vắng** các học sinh chưa check-in
   - Nếu **check-in đủ → chuyển trạm sớm**
3. **Chuyển trạm tiếp theo** → Lặp lại từ bước 1

### Quy tắc chuyển tuyến

Khi xe đến **trạm cuối cùng** của tuyến hiện tại:

1. Check-in bình thường
2. Sau 2 giây dừng lại
3. **Tự động chuyển sang tuyến tiếp theo**:
   - Đặt lại `currentStationIndex = 0` (trạm đầu tiên của tuyến mới)
   - Xóa dữ liệu check-in cũ (`studentCheckIns = {}`)
   - Bắt đầu quy trình với trạm đầu tiên của tuyến mới

### Khi hết tất cả tuyến

- Hiển thị alert: "HOÀN THÀNH TẤT CẢ CÁC CHUYẾN ĐI HÔM NAY!"
- Dừng theo dõi (`isTracking = false`)
- Reset về trạng thái ban đầu

## Context API - useRouteTracking()

### Trạng thái

```javascript
{
    isTracking,              // boolean - Xe đang chạy?
    currentRouteIndex,       // number - Chỉ số tuyến hiện tại (0-based)
    currentRoute,            // object - Tuyến đang chạy
    routesToday,             // array - Tất cả tuyến trong ngày
    currentStationIndex,     // number - Chỉ số trạm trong tuyến hiện tại
    currentStation,          // object - Trạm đang ở
    stations,                // array - Danh sách trạm của tuyến hiện tại
    currentStudents,         // array - Học sinh của trạm hiện tại
    studentCheckIns,         // object - Trạng thái check-in { studentId: 'present'|'absent'|undefined }
    stationTimer,            // number - Thời gian còn lại check-in (giây)
    isStationActive,         // boolean - Đang check-in?
    lastStoppedState,        // object - Dữ liệu lần dừng cuối cùng
    allStudentsForContact,   // array - Tất cả học sinh
}
```

### Hành động (Actions)

```javascript
startTracking()           // Bắt đầu chuyến (từ tuyến 1, trạm 1)
stopTracking()            // Dừng chuyến và lưu trạng thái
checkInStudent(studentId) // Check-in học sinh
forceDepart()             // Rời trạm ngay (đánh dấu vắng tất cả)
moveToNextRoute()         // Chuyển sang tuyến tiếp theo (tự động)
```

## Ví dụ sử dụng

### DriverHome.jsx

```jsx
const {
    isTracking,
    currentRoute,          // Tuyến hiện tại
    currentStationIndex,
    currentStation,        // Trạm hiện tại
    stations,              // Danh sách trạm của tuyến
    currentStudents,       // Học sinh của trạm
    startTracking,
    stopTracking,
    checkInStudent,
} = useRouteTracking();
```

### DriverDailySchedule.jsx

```jsx
const {
    currentRouteIndex,     // Để highlight tuyến hiện tại
    routesToday,           // Hiển thị tất cả tuyến
    currentRoute,          // Thông tin tuyến hiện tại
    // ... tương tự DriverHome
} = useRouteTracking();
```

## Lưu ý quan trọng

### Khi khởi động chuyến
- Route sẽ được set về **index 0** (tuyến đầu tiên)
- Station sẽ được set về **index 0** (trạm đầu tiên của tuyến)
- Dữ liệu check-in được xóa sạch

### Khi chuyển tuyến (tự động)
- Route index tăng lên 1
- Station index reset về 0
- Check-in data xóa sạch (mỗi tuyến là một phiên check-in mới)
- Bắt đầu quy trình check-in với trạm đầu tiên của tuyến mới

### Khi dừng chuyến
- Lưu trạng thái hiện tại vào `lastStoppedState`
- Lưu vào localStorage để có thể khôi phục sau

## Tích hợp với ba trang Driver

### DriverHome
- Hiển thị **trạm hiện tại** trong header
- Hiển thị **bản đồ** của tuyến hiện tại
- **Check-in giao diện**
- Hiển thị tiến độ các trạm

### DriverDailySchedule
- Hiển thị **danh sách tuyến trong ngày**
- Highlight **tuyến đang chạy**
- Hiển thị **bản đồ** của tuyến hiện tại
- **Check-in giao diện** (giống DriverHome)

### DriverOperations
- **Nút bắt đầu/dừng chuyến** (đồng bộ với hai trang trên)
- **Check-in học sinh**
- **Báo cáo sự cố**
- **Nút gọi khẩn cấp**

## Dữ liệu Check-in

```javascript
// Trạng thái check-in cho mỗi học sinh
studentCheckIns = {
    'hs1': 'present',   // Học sinh đã check-in
    'hs2': 'absent',    // Học sinh vắng
    'hs3': undefined,   // Chưa check-in
}
```

### Luồng xử lý Check-in

1. **Học sinh chưa check-in** (`undefined`)
   - Khi bấm nút check-in → `'present'`
   - Khi hết giờ mà chưa check-in → `'absent'`

2. **Thống kê sau mỗi trạm**
   - Tính số check-in: `studentCheckIns.filter(v => v === 'present').length`
   - Tính số vắng: `studentCheckIns.filter(v => v === 'absent').length`

## Cảnh báo và xử lý

### Auto-mark absent
- Sau 60 giây nếu chưa check-in → tự động đánh dấu vắng
- Nhân viên có thể ấn "Rời trạm" để bỏ qua trạm này

### Hết tuyến
- Alert: "HOÀN THÀNH [TÊN TUYẾN]! Chuyển sang [TUYẾN TIẾP THEO]"

### Hết cả ngày
- Alert: "HOÀN THÀNH TẤT CẢ CÁC CHUYẾN ĐI HÔM NAY!"
- Trạng thái chuyến được dừng lại

## Mở rộng sau

Để thêm tuyến mới, cập nhật `ROUTES_TODAY` trong `RouteTrackingContext.jsx`:

```javascript
{
    id: 'route3',
    name: 'Tuyến 03 - Tối',
    time: '18:00 - 19:00',
    totalStudents: 20,
    stations: [
        { id: 'st8', name: 'Trạm F', position: [10.77, 106.67], time: '18:00' },
        { id: 'st9', name: 'Trạm G', position: [10.78, 106.68], time: '18:15' },
        // ...
    ],
}
```

Cập nhật `STUDENTS_BY_STATION` để gán học sinh cho trạm mới:

```javascript
studentsByStation['st8'] = route3Students.slice(0, 5);
studentsByStation['st9'] = route3Students.slice(5, 10);
// ...
```
