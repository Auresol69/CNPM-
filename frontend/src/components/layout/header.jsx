// import React from 'react';

// export function Header() {
//   return (
//     // <header className="w-full bg-white shadow-sm">
//     <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
          
//           {/* Logo / Title */}
//           <div className="flex items-center gap-3">
//             <div className="flex items-center gap-2">
//               <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white font-semibold">
//                 S
//               </div>
//               <div>
//                 <div className="text-gray-900 font-semibold">
//                   Hệ thống theo dõi xe buýt thông minh
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   SchoolBus Tracker
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Nav */}
//           <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
//             <a className="hover:text-gray-900" href="#">
//               Trang chủ
//             </a>
//             <a className="hover:text-gray-900" href="#">
//               Tính năng
//             </a>
//             <a className="hover:text-gray-900" href="#">
//               Liên hệ
//             </a>
//             <button className="ml-2 rounded-md bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-700">
//               Đăng nhập
//             </button>
//           </nav>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button aria-label="Open menu" className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//           </div>

//         </div>
//       </div>
//     </header>
//   );
// }

// export default Header;
import React from 'react';

export function Header({ onToggleSidebar }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Nút thu gọn Sidebar */}
          <button
            onClick={onToggleSidebar}
            className="mr-3 p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            ☰
          </button>

          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center text-white font-semibold">
                S
              </div>
              <div>
                <div className="text-gray-900 font-semibold">
                  Hệ thống theo dõi xe buýt thông minh
                </div>
                <div className="text-xs text-gray-500">
                  SchoolBus Tracker
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a className="hover:text-gray-900" href="#">Trang chủ</a>
            <a className="hover:text-gray-900" href="#">Tính năng</a>
            <a className="hover:text-gray-900" href="#">Liên hệ</a>
            <button className="ml-2 rounded-md bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-700">
              Đăng nhập
            </button>
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden">
            <button aria-label="Open menu" className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;

