// src/components/driver/VehicleList.jsx
import { Bus, Gauge, User } from 'lucide-react';

export default function VehicleList({ vehicles = [], onSelect, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-500 mt-3">Đang tải danh sách xe...</p>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Bus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Không có xe nào khả dụng</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Danh sách xe ({vehicles.length})</h3>
      </div>
      <ul className="divide-y">
        {vehicles.map(v => {
          const vehicleId = v._id || v.id;
          const licensePlate = v.licensePlate || v.plate || 'N/A';
          const model = v.model || v.name || 'Bus';
          const capacity = v.capacity || 'N/A';
          const status = v.status || 'unknown';
          const driver = v.driver?.name || v.driver || 'Chưa phân công';

          return (
            <li key={vehicleId} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    status === 'active' ? 'bg-green-100' : 
                    status === 'maintenance' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Bus className={`w-6 h-6 ${
                      status === 'active' ? 'text-green-600' : 
                      status === 'maintenance' ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{licensePlate}</div>
                    <div className="text-sm text-gray-600">{model}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {driver}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3" />
                        {capacity} chỗ
                      </span>
                    </div>
                  </div>
                </div>
                {onSelect && (
                  <button
                    onClick={() => onSelect(v)}
                    className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Chọn
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
