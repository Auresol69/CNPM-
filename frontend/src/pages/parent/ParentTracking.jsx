import { AlertCircle, Bus, Clock, MapPin, Phone, User } from 'lucide-react';
import { useState } from 'react';
import LiveRouteMap from '../../components/maps/LiveRouteMap';
import { useParentData } from '../../hooks/useParentData';

export default function ParentTracking() {
  const { loading, students } = useParentData();
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Mock bus location data - sẽ được thay thế bằng socket.io real-time
  const [busLocation] = useState({ lat: 10.7769, lng: 106.7009 });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            Theo dõi xe bus
          </h1>
          <p className="text-indigo-100">Xem vị trí xe đưa đón con em của bạn</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="h-[500px]">
                <LiveRouteMap
                  busPosition={busLocation}
                  stations={[
                    { id: '1', name: 'Trạm A', position: [10.7769, 106.7009] },
                    { id: '2', name: 'Trạm B', position: [10.7829, 106.7099] },
                    { id: '3', name: 'Trường', position: [10.7889, 106.7189] },
                  ]}
                />
              </div>
            </div>

            {/* Bus Info */}
            <div className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Xe Bus 51A-12345</h3>
                    <p className="text-sm text-gray-600">Tuyến: Đi đến trường</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Đang di chuyển
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Thời gian còn lại</p>
                  <p className="font-bold text-blue-600">~15 phút</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Khoảng cách</p>
                  <p className="font-bold text-green-600">~2.5 km</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Học sinh</p>
                  <p className="font-bold text-purple-600">12/15</p>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-900">Con em của bạn</h3>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {students.map((student) => {
                  const studentData = student.student || student;
                  const isSelected = selectedStudent?._id === student._id;

                  return (
                    <div
                      key={student._id || student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-4 cursor-pointer transition ${
                        isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="font-bold text-indigo-600">
                            {(studentData.name || 'N/A').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{studentData.name || 'N/A'}</p>
                          <p className="text-xs text-gray-600">Lớp {studentData.class || 'N/A'}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                          Đã lên xe
                        </span>
                      </div>
                    </div>
                  );
                })}
                {students.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Chưa có học sinh</p>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Contact */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Liên hệ tài xế</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tài xế</p>
                    <p className="font-semibold text-gray-900">Nguyễn Văn A</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <p className="font-semibold text-gray-900">0901 234 567</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Gọi điện
                </button>
              </div>
            </div>

            {/* Alert */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Lưu ý</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Vị trí xe được cập nhật mỗi 30 giây. Thời gian dự kiến có thể thay đổi do điều kiện giao thông.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}   