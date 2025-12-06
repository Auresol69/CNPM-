import { Activity, Bus, Calendar, CheckCircle, Clock, MapPin, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useManagerData } from '../../hooks/useManagerData';

export default function ManagerDashboard() {
  const { loading, error, trips, routes, buses, stations, students } = useManagerData();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu quản lý...</p>
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

  const activeTrips = trips.filter(t => t.status === 'active' || t.status === 'in-progress').length;
  const activeBuses = buses.filter(b => b.status === 'active').length;
  const totalRoutes = routes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Bảng điều khiển quản lý</h1>
          <p className="text-blue-100">Tổng quan hệ thống đưa đón học sinh</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chuyến đi hôm nay</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{activeTrips}</p>
                <p className="text-xs text-gray-500 mt-1">Tổng: {trips.length}</p>
              </div>
              <Activity className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Xe đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeBuses}</p>
                <p className="text-xs text-gray-500 mt-1">Tổng: {buses.length}</p>
              </div>
              <Bus className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Học sinh</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{students.length}</p>
                <p className="text-xs text-gray-500 mt-1">Đang theo học</p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tuyến đường</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{totalRoutes}</p>
                <p className="text-xs text-gray-500 mt-1">{stations.length} trạm</p>
              </div>
              <MapPin className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/manager/bus-tracking" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-200 hover:border-blue-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Theo dõi xe bus</h3>
                <p className="text-sm text-gray-600">Xem vị trí real-time</p>
              </div>
            </div>
          </Link>

          <Link to="/manager/schedule-management" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-200 hover:border-green-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Quản lý lịch trình</h3>
                <p className="text-sm text-gray-600">Tạo và chỉnh sửa</p>
              </div>
            </div>
          </Link>

          <Link to="/manager/reports" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-200 hover:border-purple-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Báo cáo</h3>
                <p className="text-sm text-gray-600">Thống kê và phân tích</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Trips */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Chuyến đi gần đây</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chuyến</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tuyến</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Xe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài xế</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {trips.slice(0, 10).map((trip) => (
                  <tr key={trip._id || trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trip.type === 'pickup' ? '🔵 Đón' : '🔴 Trả'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(trip.date || trip.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.schedule?.route?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.bus?.licensePlate || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.driver?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        trip.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        trip.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status === 'completed' ? 'Hoàn thành' :
                         trip.status === 'in-progress' ? 'Đang diễn ra' :
                         trip.status === 'cancelled' ? 'Đã hủy' : trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>Chưa có chuyến đi nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buses Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Trạng thái xe bus</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {buses.slice(0, 6).map((bus) => (
              <div key={bus._id || bus.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{bus.licensePlate || 'N/A'}</h3>
                  <span className={`w-3 h-3 rounded-full ${
                    bus.status === 'active' ? 'bg-green-500' :
                    bus.status === 'maintenance' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Model: {bus.model || 'N/A'}</p>
                  <p>Sức chứa: {bus.capacity || 'N/A'} chỗ</p>
                  <p className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {bus.status === 'active' ? 'Hoạt động' :
                     bus.status === 'maintenance' ? 'Bảo trì' : 'Không hoạt động'}
                  </p>
                </div>
              </div>
            ))}
            {buses.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Chưa có xe bus nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}