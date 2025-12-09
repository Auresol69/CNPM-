import { Activity, AlertCircle, Bus, Clock, MapPin, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import LiveRouteMap from '../../components/maps/LiveRouteMap';
import { useManagerData } from '../../hooks/useManagerData';

export default function BusTracking() {
  const { loading, buses, trips } = useManagerData();
  const [selectedBus, setSelectedBus] = useState(null);

  // Mock real-time locations - sẽ được thay bằng socket.io
  const busLocations = {
    [buses[0]?._id]: { lat: 10.7769, lng: 106.7009 },
    [buses[1]?._id]: { lat: 10.7829, lng: 106.7099 },
  };

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

  const activeBuses = buses.filter(b => b.status === 'active');
  const currentBus = selectedBus || activeBuses[0];
  const busPosition = currentBus ? busLocations[currentBus._id] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            Theo dõi xe bus Real-time
          </h1>
          <p className="text-blue-100">Giám sát vị trí và trạng thái tất cả các xe</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="h-[500px]">
                <LiveRouteMap
                  busPosition={busPosition || { lat: 10.7769, lng: 106.7009 }}
                  stations={[
                    { id: '1', name: 'Trạm A', position: [10.7769, 106.7009] },
                    { id: '2', name: 'Trạm B', position: [10.7829, 106.7099] },
                    { id: '3', name: 'Trường', position: [10.7889, 106.7189] },
                  ]}
                />
              </div>
            </div>

            {/* Bus Details */}
            {currentBus && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bus className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{currentBus.licensePlate}</h3>
                      <p className="text-sm text-gray-600">{currentBus.model}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    Đang hoạt động
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Thời gian</p>
                    <p className="font-bold text-blue-600">08:30</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Tốc độ</p>
                    <p className="font-bold text-green-600">45 km/h</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Học sinh</p>
                    <p className="font-bold text-purple-600">12/{currentBus.capacity}</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Trạm</p>
                    <p className="font-bold text-orange-600">2/5</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Tài xế:</span>
                      <span className="text-sm font-semibold text-gray-900">Nguyễn Văn A</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                      Liên hệ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bus List */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-900">Danh sách xe ({activeBuses.length})</h3>
              </div>
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {activeBuses.map((bus) => {
                  const isSelected = currentBus?._id === bus._id;
                  const busTrip = trips.find(t => t.bus?._id === bus._id && t.status === 'in-progress');

                  return (
                    <div
                      key={bus._id || bus.id}
                      onClick={() => setSelectedBus(bus)}
                      className={`p-4 cursor-pointer transition ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          bus.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Bus className={`w-5 h-5 ${
                            bus.status === 'active' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{bus.licensePlate}</p>
                          <p className="text-xs text-gray-600">{bus.model}</p>
                          {busTrip && (
                            <p className="text-xs text-blue-600 mt-1">🚌 Đang chạy tuyến</p>
                          )}
                        </div>
                        <span className={`w-2 h-2 rounded-full ${
                          bus.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}></span>
                      </div>
                    </div>
                  );
                })}
                {activeBuses.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>Không có xe nào đang hoạt động</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-900">Lưu ý</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Vị trí xe được cập nhật real-time qua Socket.IO. Dữ liệu hiện tại là demo.
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