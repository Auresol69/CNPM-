// // src/pages/driver/DriverFeatures.jsx
// import React from 'react';

// const features = [
//   { id: 'f1', title: 'Theo dõi GPS', desc: 'Xem vị trí theo thời gian thực của xe.' },
//   { id: 'f2', title: 'Check-in học sinh', desc: 'Ghi nhận học sinh lên/xuống xe.' },
//   { id: 'f3', title: 'Camera', desc: 'Xem camera hành trình (nếu có).' },
// ];

// export default function DriverFeatures() {
//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//       {features.map(f => (
//         <div key={f.id} className="bg-white rounded shadow p-4 border">
//           <div className="text-sm font-semibold">{f.title}</div>
//           <div className="text-xs text-gray-500 mt-2">{f.desc}</div>
//         </div>
//       ))}
//     </div>
//   );
// }
// src/pages/driver/DriverFeatures.jsx
import React from 'react';
import { 
  Navigation, 
  // GPS
  Users,         // Check-in
  Camera,        // Camera
  Bell,          // Thông báo
  Shield,        // SOS
  MessageCircle, // Chat
  CheckCircle2,
  Clock
} from 'lucide-react';

const features = [
  {
    id: 'gps',
    title: 'Theo dõi GPS realtime',
    desc: 'Xem vị trí xe buýt chính xác từng giây',
    icon: Navigation,
    color: 'from-blue-500 to-cyan-500',
    status: 'active',
    link: '/driver/schedule'
  },
  {
    id: 'checkin',
    title: 'Check-in học sinh',
    desc: 'Điểm danh tự động khi học sinh lên/xuống xe',
    icon: Users,
    color: 'from-green-500 to-emerald-500',
    status: 'active',
    link: '/driver/checkin'
  },
  {
    id: 'camera',
    title: 'Camera hành trình',
    desc: 'Xem trực tiếp camera trong xe (4 góc)',
    icon: Camera,
    color: 'from-purple-500 to-pink-500',
    status: 'soon',
  },
  {
    id: 'notify',
    title: 'Thông báo phụ huynh',
    desc: 'Tự động gửi tin khi xe đến gần trạm',
    icon: Bell,
    color: 'from-orange-500 to-red-500',
    status: 'active',
  },
  {
    id: 'sos',
    title: 'Nút SOS khẩn cấp',
    desc: 'Gửi cảnh báo ngay lập tức đến quản lý & cơ quan chức năng',
    icon: Shield,
    color: 'from-red-600 to-pink-600',
    status: 'active',
  },
  {
    id: 'chat',
    title: 'Chat với phụ huynh',
    desc: 'Nhắn tin trực tiếp với phụ huynh học sinh',
    icon: MessageCircle,
    color: 'from-indigo-500 to-purple-500',
    status: 'soon',
  },
];

export default function DriverFeatures() {
  const handleFeatureClick = (feature) => {
    if (feature.status === 'soon') {
      alert('Tính năng đang được phát triển – Sắp ra mắt nhé!');
      return;
    }

    if (feature.id === 'sos') {
      if (window.confirm('XÁC NHẬN GỬI TÍN HIỆU CỨU HỘ KHẨN CẤP?')) {
        alert('ĐÃ GỬI SOS!\nQuản lý, phụ huynh và lực lượng chức năng đã nhận thông báo ngay lập tức.');
      }
      return;
    }

    // Các tính năng khác
    alert(`Mở tính năng: ${feature.title}`);
    // Ví dụ: navigate(feature.link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header siêu đẹp */}
      <div className="text-center py-12 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl text-white">
        <h1 className="text-5xl font-bold mb-4">Tính năng dành cho tài xế</h1>
        <p className="text-xl opacity-90">
          Công cụ thông minh – Giúp bạn lái xe an toàn, chuyên nghiệp hơn bao giờ hết
        </p>
      </div>

      {/* Grid các tính năng */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              disabled={feature.status === 'soon'}
              className={`
                group relative transform transition-all duration-300 
                hover:scale-105 hover:-translate-y-4 
                ${feature.status === 'soon' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
              `}
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:shadow-2xl hover:border-transparent transition-all h-full text-left">
                {/* Gradient overlay khi hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity`} />

                {/* Icon + Badge */}
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-10 h-10" />
                  </div>

                  {feature.status === 'active' ? (
                    <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Sẵn sàng
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      Sắp có
                    </span>
                  )}
                </div>

                {/* Nội dung */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {feature.desc}
                </p>

                {/* Footer card */}
                <div className="flex items-center justify-between">
                  <span className="text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">
                    {feature.status === 'soon' ? 'Đang phát triển...' : 'Truy cập ngay'}
                  </span>
                  <span className="text-3xl text-indigo-600 group-hover:translate-x-6 transition-transform">
                    →
                  </span>
                </div>

                {/* Đặc biệt cho SOS */}
                
                {feature.id === 'sos' && (
                  <div className="mt-8 pt-8 border-t-8 border-red-500 bg-red-50 rounded-b-3xl -mx-8 -mb-8">
                    <button
                      onClick={() => {
                        if (window.confirm('XÁC NHẬN GỬI TÍN HIỆU CỨU HỘ KHẨN CẤP?\nToàn bộ hệ thống sẽ nhận cảnh báo ngay lập tức!')) {
                          alert('ĐÃ GỬI SOS THÀNH CÔNG!\nQuản lý, phụ huynh và 113 đang được thông báo!');
                          // Gọi API thật ở đây nếu có
                        }
                      }}
                      className="w-full py-6 bg-gradient-to-r from-red-600 to-pink-600 text-white text-2xl font-bold rounded-2xl shadow-2xl animate-pulse hover:animate-none hover:scale-105 transition"
                    >
                      NHẤN ĐỂ GỬI CỨU HỘ KHẨN CẤP
                    </button>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer cuối trang */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl p-10 shadow-2xl max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Sẵn sàng cho chuyến đi an toàn chưa?
          </h2>
          <p className="text-xl opacity-90">
            Hệ thống thông minh – Đồng hành cùng tài xế mỗi hành trình
          </p>
        </div>
      </div>
    </div>
  );
}