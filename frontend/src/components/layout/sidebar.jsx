// import React from 'react';

// export function Sidebar({ className = '' }) {
//   const items = [
//     { label: 'Tổng quan', icon: 'M3 12h18' },
//     { label: 'Tuyến xe', icon: 'M4 6h16' },
//     { label: 'Lịch trình', icon: 'M3 7h18' },
//     { label: 'Học sinh', icon: 'M3 12h18' },
//     { label: 'Báo cáo', icon: 'M3 17h18' },
//     { label: 'Cài đặt', icon: 'M3 22h18' },
//   ];

//   return (
//     <aside className={`fixed top-16 left-0 w-64 bg-white border-r h-[calc(100vh-4rem)] ${className}`}>
//       <div className="p-4">
//         <div className="text-sm text-gray-500 mb-4">Sản phẩm</div>
//         <ul className="space-y-1">
//           {items.map((it, idx) => (
//             <li key={it.label}>
//               <a
//                 href="#"
//                 className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${idx === 1 ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}>
//                 <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
//                   <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//                   </svg>
//                 </div>
//                 <span className="text-sm">{it.label}</span>
//               </a>
//             </li>
//           ))}
//         </ul>

//         <div className="mt-6 p-3 bg-indigo-50 rounded-md">
//           <div className="text-xs text-indigo-700 font-semibold">Bạn đã sẵn sàng để bảo vệ con mình an toàn chưa?</div>
//           <div className="text-xs text-indigo-600 mt-1">Hãy cùng hàng ngàn phụ huynh và trường học tin tưởng sử dụng.</div>
//           <button className="mt-3 w-full rounded-md bg-indigo-600 text-white py-2 text-sm">Bắt đầu ngay hôm nay</button>
//         </div>
//       </div>
//     </aside>
//   );
// }

// export default Sidebar;
import React from 'react';

export function Sidebar({ className = '' , open}) {
  const items = [
    { label: 'Tổng quan', icon: 'M3 12h18' },
    { label: 'Tuyến xe', icon: 'M4 6h16' },
    { label: 'Lịch trình', icon: 'M3 7h18' },
    { label: 'Học sinh', icon: 'M3 12h18' },
    { label: 'Báo cáo', icon: 'M3 17h18' },
    { label: 'Cài đặt', icon: 'M3 22h18' },
  ];

  return (
    <aside className={`fixed top-16 left-0 w-64 bg-white border-r bottom-0 ${className} ${open ? 'block' : 'hidden '} `}>
      <div className="h-full p-4 overflow-auto">
        <div className="text-sm text-gray-500 mb-4">Sản phẩm</div>
        <ul className="space-y-1">
          {items.map((it, idx) => (
            <li key={it.label}>
              <a
                href="#"
                className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${idx === 1 ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'}`}>
                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-sm">{it.label}</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-6 p-3 bg-indigo-50 rounded-md">
          <div className="text-xs text-indigo-700 font-semibold">Bạn đã sẵn sàng để bảo vệ con mình an toàn chưa?</div>
          <div className="text-xs text-indigo-600 mt-1">Hãy cùng hàng ngàn phụ huynh và trường học tin tưởng sử dụng.</div>
          <button className="mt-3 w-full rounded-md bg-indigo-600 text-white py-2 text-sm">Bắt đầu ngay hôm nay</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;