// import React from 'react'


// export function Footer() {
// return (
// <footer className="mt-8">
// {/* CTA band */}
// <div className="w-full bg-indigo-600 py-8">
// <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
// <div className="text-lg font-semibold">Bạn đã sẵn sàng để bảo vệ con mình an toàn chưa?</div>
// <div className="text-sm opacity-90 mt-1">Hãy cùng hàng ngàn phụ huynh và trường học tin tưởng sử dụng hệ thống để đảm bảo an toàn cho con em mình.</div>
// <div className="mt-4">
// <button className="rounded-md bg-white text-indigo-600 px-4 py-2 font-medium">Bắt đầu ngay hôm nay</button>
// </div>
// </div>
// </div>


// {/* Main footer */}
// <div className="w-full bg-[#04123B] text-white">
// <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
// <div>
// <div className="font-semibold">Hệ thống theo dõi xe buýt thông minh</div>
// <div className="text-sm text-gray-300 mt-2">Bảo vệ em an toàn cho trẻ em — từng chuyến đi một.</div>
// </div>


// <div>
// <div className="font-semibold">Sản phẩm</div>
// <ul className="mt-2 text-sm text-gray-300 space-y-1">
// <li>Giao diện</li>
// <li>Bảng giá</li>
// <li>Bảo mật</li>
// <li>Cập nhật</li>
// </ul>
// </div>


// <div>
// <div className="font-semibold">Hỗ trợ</div>
// <ul className="mt-2 text-sm text-gray-300 space-y-1">
// <li>Trung tâm trợ giúp</li>
// <li>Liên hệ chúng tôi</li>
// <li>Điều khoản</li>
// <li>Tài nguyên</li>
// </ul>
// </div>
// </div>


// <div className="border-t border-[#12214a] py-4">
// <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-400">© 2025 SchoolBus Tracker. Bảo lưu mọi quyền.</div>
// </div>
// </div>
// </footer>
// )
// }


// export default Footer
import React from 'react';

export function Footer({ open }) {
  return (
    <footer className={` mt-8 ${open && "ml-64"}`} > {/* margin-left bằng width sidebar */}
      {/* CTA band */}
      <div className="w-full bg-indigo-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="text-lg font-semibold">Bạn đã sẵn sàng để bảo vệ con mình an toàn chưa?</div>
          <div className="text-sm opacity-90 mt-1">Hãy cùng hàng ngàn phụ huynh và trường học tin tưởng sử dụng hệ thống để đảm bảo an toàn cho con em mình.</div>
          <div className="mt-4">
            <button className="rounded-md bg-white text-indigo-600 px-4 py-2 font-medium">Bắt đầu ngay hôm nay</button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="w-full bg-[#04123B] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-semibold">Hệ thống theo dõi xe buýt thông minh</div>
            <div className="text-sm text-gray-300 mt-2">Bảo vệ em an toàn cho trẻ em — từng chuyến đi một.</div>
          </div>

          <div>
            <div className="font-semibold">Sản phẩm</div>
            <ul className="mt-2 text-sm text-gray-300 space-y-1">
              <li>Giao diện</li>
              <li>Bảng giá</li>
              <li>Bảo mật</li>
              <li>Cập nhật</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold">Hỗ trợ</div>
            <ul className="mt-2 text-sm text-gray-300 space-y-1">
              <li>Trung tâm trợ giúp</li>
              <li>Liên hệ chúng tôi</li>
              <li>Điều khoản</li>
              <li>Tài nguyên</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#12214a] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-gray-400">© 2025 Safe to School. Bảo lưu mọi quyền.</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;