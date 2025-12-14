// Mock dataset roughly aligned with BUS_TRACKING_v2.sql for UI development

export const roles = [
  { role_id: 1, name: 'ADMIN' },
  { role_id: 2, name: 'DRIVER' },
  { role_id: 3, name: 'PARENT' },
]

export const users = [
  { user_id: 1, role_id: 1, name: 'Nguyễn Văn Quản', phone_number: '0901000001', email: 'admin@ssb.edu.vn', is_active: true },
  { user_id: 2, role_id: 2, name: 'Trần Văn Tài', phone_number: '0902000001', email: 'tai.tran@ssb.edu.vn', is_active: true },
  { user_id: 3, role_id: 2, name: 'Lê Thị Bình', phone_number: '0902000002', email: 'binh.le@ssb.edu.vn', is_active: true },
  { user_id: 4, role_id: 3, name: 'Phạm Minh Anh', phone_number: '0903000001', email: 'anh.pham@ssb.edu.vn', is_active: true },
  { user_id: 5, role_id: 3, name: 'Ngô Thị Hoa', phone_number: '0903000002', email: 'hoa.ngo@ssb.edu.vn', is_active: true },
]

export const drivers = [
  { driver_id: 2, license_number: '79A-123456' },
  { driver_id: 3, license_number: '51B-654321' },
]

export const parents = [
  { parent_id: 4, relationship: 'PARENTS' },
  { parent_id: 5, relationship: 'PARENTS' },
]

export const students = [
  { student_id: 1, parent_id: 4, name: 'Phạm Tuấn Kiệt', class: 'Lớp 5A', gender: 'MALE', date_of_birth: '2015-06-12' },
  { student_id: 2, parent_id: 4, name: 'Phạm Ngọc Mai', class: 'Lớp 3B', gender: 'FEMALE', date_of_birth: '2017-04-20' },
  { student_id: 3, parent_id: 5, name: 'Trần Quốc Huy', class: 'Lớp 4C', gender: 'MALE', date_of_birth: '2016-02-10' },
]

export const buses = [
  { bus_id: 1, driver_id: 2, plate_number: '51B-99888', model: 'Hyundai County 2021', status: 'ACTIVE', capacity: 29 },
  { bus_id: 2, driver_id: 3, plate_number: '79A-77665', model: 'Thaco Town 2020', status: 'ACTIVE', capacity: 30 },
]

export const routes = [
  { route_id: 1, name: 'Tuyến 1: Quận 1 - Trường DEF', description: 'Đưa đón học sinh khu vực Quận 1 đến trường DEF' },
  { route_id: 2, name: 'Tuyến 2: Bình Thạnh - Trường DEF', description: 'Đưa đón học sinh khu vực Bình Thạnh đến trường' },
]

export const stops = [
  { stop_id: 1, route_id: 1, name: 'Công viên 23/9', latitude: 10.7725, longitude: 106.6942, address: '100 Phạm Ngũ Lão, Q1, TP.HCM', seq_index: 1 },
  { stop_id: 2, route_id: 1, name: 'Chợ Bến Thành', latitude: 10.7782, longitude: 106.6953, address: '45 Lý Tự Trọng, Q1, TP.HCM', seq_index: 2 },
  { stop_id: 3, route_id: 1, name: 'Trường DEF', latitude: 10.7735, longitude: 106.6899, address: '12 Nguyễn Bỉnh Khiêm, Q1, TP.HCM', seq_index: 3 },
  { stop_id: 4, route_id: 2, name: 'Phan Văn Trị', latitude: 10.8102, longitude: 106.6885, address: '200 Phan Văn Trị, Bình Thạnh, TP.HCM', seq_index: 1 },
  { stop_id: 5, route_id: 2, name: 'Lê Quang Định', latitude: 10.8055, longitude: 106.6907, address: '150 Lê Quang Định, Bình Thạnh, TP.HCM', seq_index: 2 },
  { stop_id: 6, route_id: 2, name: 'Trường DEF', latitude: 10.7735, longitude: 106.6899, address: '12 Nguyễn Bỉnh Khiêm, Q1, TP.HCM', seq_index: 3 },
]

export const trips = [
  { trip_id: 1, route_id: 1, bus_id: 1, start_time: '2025-11-29T06:30:00', end_time: '2025-11-29T07:15:00', status: 'COMPLETED' },
  { trip_id: 2, route_id: 2, bus_id: 2, start_time: '2025-11-29T06:45:00', end_time: '2025-11-29T07:30:00', status: 'SCHEDULED' },
]

export const trip_stops = [
  { trip_id: 1, stop_id: 1, stop_order: 1 },
  { trip_id: 1, stop_id: 2, stop_order: 2 },
  { trip_id: 1, stop_id: 3, stop_order: 3 },
  { trip_id: 2, stop_id: 4, stop_order: 1 },
  { trip_id: 2, stop_id: 5, stop_order: 2 },
  { trip_id: 2, stop_id: 6, stop_order: 3 },
]

export const trip_passengers = [
  { trip_id: 1, student_id: 1 },
  { trip_id: 1, student_id: 2 },
  { trip_id: 2, student_id: 3 },
]

export const pickup_records = [
  { record_id: 1, student_id: 1, stop_id: 1, status: 'PICKED_UP', recorded_at: '2025-11-29T06:40:00' },
  { record_id: 2, student_id: 1, stop_id: 3, status: 'DROPPED_OFF', recorded_at: '2025-11-29T07:10:00' },
  { record_id: 3, student_id: 2, stop_id: 2, status: 'PICKED_UP', recorded_at: '2025-11-29T06:45:00' },
  { record_id: 4, student_id: 2, stop_id: 3, status: 'DROPPED_OFF', recorded_at: '2025-11-29T07:15:00' },
  { record_id: 5, student_id: 3, stop_id: 4, status: 'WAITING', recorded_at: '2025-11-29T06:50:00' },
]

export const navigation_logs = [
  { update_id: 1, bus_id: 1, latitude: 10.775, longitude: 106.698, recorded_at: '2025-11-29T06:35:00' },
  { update_id: 2, bus_id: 1, latitude: 10.774, longitude: 106.695, recorded_at: '2025-11-29T06:38:00' },
  { update_id: 3, bus_id: 2, latitude: 10.808, longitude: 106.689, recorded_at: '2025-11-29T06:55:00' },
]

export const messages = [
  { message_id: 1, message_text: 'Xe buýt Tuyến 1 đã khởi hành.', sent_at: '2025-11-29T06:30:00' },
  { message_id: 2, message_text: 'Xe buýt Tuyến 2 đang đến điểm đón Phan Văn Trị.', sent_at: '2025-11-29T06:50:00' },
  { message_id: 3, message_text: 'Học sinh Trần Quốc Huy chưa có mặt tại điểm đón.', sent_at: '2025-11-29T06:55:00' },
]

export const notifications = [
  { notification_id: 1, message_id: 1, type: 'INFO', sent_at: '2025-11-29T06:30:00' },
  { notification_id: 2, message_id: 2, type: 'REMINDER', sent_at: '2025-11-29T06:50:00' },
  { notification_id: 3, message_id: 3, type: 'WARNING', sent_at: '2025-11-29T06:55:00' },
]

export const user_notifications = [
  { notification_id: 1, recipient_id: 4, read_status: false },
  { notification_id: 2, recipient_id: 5, read_status: false },
  { notification_id: 3, recipient_id: 5, read_status: false },
]
