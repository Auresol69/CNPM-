import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CategoryIcon from "@mui/icons-material/Category";

// Danh sách menu cho Phụ huynh
const parentMenuItems = [
  { text: "Tổng quan", icon: <DashboardIcon />, link: "/parent/dashboard" },
  { text: "Theo dõi xe", icon: <MapIcon />, link: "/parent/tracking" },
  {
    text: "Thông báo",
    icon: <NotificationsIcon />,
    link: "/parent/notifications",
  },
  { text: "Tiện ích", icon: <CategoryIcon />, link: "/parent/features" },
];

export default function Sidebar() {
  // Định nghĩa các lớp CSS cho NavLink
  const baseLinkClasses =
    "flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100 group";
  const activeLinkClasses = "bg-blue-50 text-blue-600 font-semibold";

  return (
    <aside className="w-64 h-screen" aria-label="Sidebar">
      <div className="h-full px-3 py-4 overflow-y-auto bg-white shadow-lg">
        {/* Bạn có thể thêm logo hoặc tên ứng dụng ở đây */}
        <ul className="space-y-2 font-medium mt-4">
          {parentMenuItems.map((item) => (
            <li key={item.text}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `${baseLinkClasses} ${isActive ? activeLinkClasses : ""}`
                }
              >
                {item.icon}
                <span className="ml-3">{item.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
