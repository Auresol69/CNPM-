// import React from 'react'
// import Header from './header'
// import Sidebar from './sidebar'
// import Footer from './footer'


// export default function PageLayout({ children }) {
//     return (
//         <div className="min-h-screen bg-gray-50">
//             <Header />
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
//                 <Sidebar />
//             <main className="flex-1 py-8">{children}</main>
//             </div>
//             <Footer />
//         </div>
//     )
// }
import React from 'react'
import Header from './header'
import Sidebar from './sidebar'
import Footer from './footer'
import { useState} from 'react'
import { Outlet } from 'react-router-dom'

export default function PageLayout() {
    const [openSidebar, setOpenSidebar] = useState(false)
    const handleToggleSidebar = () => {setOpenSidebar(!openSidebar)}
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header cố định */}
            <Header className="fixed top-0 left-0 w-full z-50" onToggleSidebar={handleToggleSidebar} />

            {/* Layout chính: margin-top = chiều cao Header (h-16 = 64px) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 mt-16">
                {/* Sidebar bắt đầu ngay dưới Header */}
                <Sidebar open={openSidebar}/>

                {/* Nội dung chính */}
                <main className={`flex-1 ${openSidebar ? `py-8 ml-64` : 'py-0'}`}>
                    <Outlet></Outlet>
                </main>
            </div>

            {/* Footer bình thường, nằm dưới nội dung */}
            <Footer open={openSidebar}/>
        </div>
    )
}
