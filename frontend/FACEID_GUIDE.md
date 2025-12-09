# Face ID Check-in - Quick Reference

## 🎯 Cách sử dụng

### Bước 1: Hiển thị Modal
Nhấn nút **"Face ID"** trên card học sinh

### Bước 2: Căn Chỉnh Khuôn Mặt
- Hướng camera về phía học sinh
- Đặt khuôn mặt vào **vòng tròn xanh** ở giữa
- Đảm bảo ánh sáng đủ

### Bước 3: Xác Nhận
- Nhấn **"XÁC NHẬN"** để quét khuôn mặt
- Hệ thống xử lý ~1.5 giây
- Tự động check-in khi thành công ✅

### Bước 4: Đóng Modal
- Modal tự động đóng sau khi check-in thành công
- Hoặc nhấn **"Hủy"** để đóng thủ công

## 📱 UI Components

### 1. Face ID Button (trên student card)
```jsx
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
  <Camera /> Face ID
</button>
```

### 2. Face Detection Modal
- Hiển thị bên ngoài (overlay)
- Kích thước: max-w-md (420px)
- Responsive trên mobile

### 3. Camera Feed
- Độ phân giải: 640x480
- Hướng: Portrait hoặc Landscape
- Face guide: Vòng tròn xanh 160px

## 🔧 Technical Details

### Camera Permissions
```javascript
navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false
})
```

### Face Capture
```javascript
// Vẽ frame từ video lên canvas
const ctx = canvasRef.current.getContext('2d');
ctx.drawImage(videoRef.current, 0, 0);

// Gửi lên server để nhận diện (nếu có)
// const imageData = canvasRef.current.toDataURL('image/jpeg');
```

### Stream Cleanup
```javascript
// Dừng tất cả audio/video tracks
stream.getTracks().forEach(track => track.stop());
```

## 🚨 Error Handling

### Lỗi Camera
- Hiển thị message: "Không thể truy cập camera"
- Nút "XÁC NHẬN" bị disable
- Người dùng có thể thử lại hoặc hủy

### Các lỗi có thể:
1. **NotAllowedError** - User từ chối quyền camera
2. **NotFoundError** - Không tìm thấy camera
3. **NotReadableError** - Camera bị sử dụng bởi ứng dụng khác

## 💾 Data Flow

```
Student Card
    ↓
[Face ID Button Click]
    ↓
FaceIDCheckin Modal
    ↓
[Camera Start]
    ↓
[User Positions Face]
    ↓
[Confirm Button Click]
    ↓
[Capture Frame]
    ↓
[Processing 1.5s]
    ↓
[onCheckIn() callback]
    ↓
[Context Updates]
    ↓
Modal Closes
Student Status: 'present' ✅
```

## 🎨 Styling Colors

| Phần | Color | Hex |
|------|-------|-----|
| Face ID Button | Blue-500 | #3b82f6 |
| Face Guide | Green-400 | #4ade80 |
| Processing Overlay | Black/50% | rgba(0,0,0,0.5) |
| Modal Background | White | #ffffff |
| Close Button | Gray-400 | #9ca3af |

## 📊 State Management

### Component State:
```javascript
const [isCameraActive, setIsCameraActive] = useState(false);
const [isProcessing, setIsProcessing] = useState(false);
const [cameraError, setCameraError] = useState(null);
```

### Props:
```javascript
student         // Student object with id, name, avatar
onCheckIn       // Callback: (studentId) => void
isCheckedIn     // Boolean: status === 'present'
```

### Refs:
```javascript
videoRef        // <video> element for camera
canvasRef       // <canvas> element for capture
```

## 🔄 Integration with DriverHome

**Import:**
```javascript
import FaceIDCheckin from '../../components/driver/FaceIDCheckin';
```

**Usage in Student Card:**
```jsx
{!status && (
    <div className="flex flex-col gap-2 mt-3">
        <button onClick={() => checkInStudent(student.id)}>
            CÓ MẶT
        </button>
        <FaceIDCheckin 
            student={student}
            onCheckIn={checkInStudent}
            isCheckedIn={status === 'present'}
        />
    </div>
)}
```

## 📋 Checklist Implementation

- ✅ Camera integration with getUserMedia
- ✅ Face detection modal UI
- ✅ Canvas capture from video
- ✅ Processing simulation (1.5s)
- ✅ Error handling
- ✅ Stream cleanup on unmount
- ✅ Avatar display on student card
- ✅ Two check-in methods (button + Face ID)

## 🚀 Future Improvements

### Phase 2:
- [ ] Real face detection API (TensorFlow.js / Face-api)
- [ ] Liveness detection (eyes blinking)
- [ ] Confidence score display
- [ ] Multiple faces detection
- [ ] Offline face recognition

### Phase 3:
- [ ] Database integration for face enrollment
- [ ] Server-side face verification
- [ ] Audit logs for security
- [ ] Rate limiting
- [ ] Replay attack prevention

---

**Component Version:** 1.0
**React Hooks:** useState, useRef, useEffect
**Browser Support:** Chrome, Firefox, Edge, Safari (camera support required)
**Mobile Support:** Yes (with camera app permission)
