import { Bell, CheckCircle, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParentData } from '../../hooks/useParentData';

export default function ParentDashboard() {
  const { loading, error, students, notifications } = useParentData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600">Lỗi: {error}</p>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Dashboard Phụ Huynh</h1>
          <p className="text-indigo-100">Theo dõi con em của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng học sinh</p>
                <p className="text-3xl font-bold text-indigo-600">{students.length}</p>
              </div>
              <Users className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thông báo mới</p>
                <p className="text-3xl font-bold text-orange-600">{unreadNotifications}</p>
              </div>
              <Bell className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <p className="text-sm font-semibold text-green-600 mt-1">Đang hoạt động</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tracking</p>
                <Link to="/parent/tracking" className="text-sm font-semibold text-blue-600 hover:underline mt-1 block">
                  Xem bản đồ →
                </Link>
              </div>
              <MapPin className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Con em của bạn</h2>
          </div>
          <div className="divide-y">
            {students.map((student) => {
              const studentData = student.student || student;
              return (
                <div key={student._id || student.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600">
                          {(studentData.name || 'N/A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{studentData.name || 'N/A'}</h3>
                        <p className="text-gray-600">
                          {studentData.grade && `${studentData.grade} - `}
                          {studentData.class && `Lớp ${studentData.class}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {studentData.school || 'Chưa có thông tin trường'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        Đang hoạt động
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {students.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Chưa có học sinh nào được đăng ký</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Thông báo gần đây</h2>
              <Link to="/parent/notifications" className="text-sm text-indigo-600 hover:underline">
                Xem tất cả →
              </Link>
            </div>
          </div>
          <div className="divide-y">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification._id || notification.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  <Bell className={`w-5 h-5 mt-1 ${notification.isRead ? 'text-gray-400' : 'text-orange-500'}`} />
                  <div className="flex-1">
                    <p className={`${notification.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                      {notification.title || notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.createdAt || Date.now()).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Chưa có thông báo nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}