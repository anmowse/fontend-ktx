import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UserIcon,
  HomeModernIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  // Kiểm tra vai trò người dùng khi component được mount
  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const userRole = localStorage.getItem("userRole");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Kiểm tra xem người dùng có phải là admin không
    const isUserAdmin =
      userRole === "Admin" || user?.role === "Admin" || user?.isAdmin === true;

    setIsAdmin(isUserAdmin);

  }, []);

  // Menu items cho admin
  const adminMenuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      path: "/users",
      name: "Quản lý sinh viên",
      icon: <UserIcon className="h-6 w-6" />,
    },
    {
      path: "/rooms",
      name: "Quản lý phòng",
      icon: <HomeModernIcon className="h-6 w-6" />,
    },
    {
      path: "/contracts",
      name: "Quản lý hợp đồng",
      icon: <DocumentTextIcon className="h-6 w-6" />,
    },
    {
      path: "/payments",
      name: "Quản lý thanh toán",
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
    },
    {
      path: "/services",
      name: "Quản lý dịch vụ",
      icon: <WrenchScrewdriverIcon className="h-6 w-6" />,
    },
  ];

  // Menu items cho user thường
  const userMenuItems = [
    {
      path: "/",
      name: "Trang chủ",
      icon: <HomeIcon className="h-6 w-6" />,
    },
    {
      path: "/rooms",
      name: "Quản lý phòng",
      icon: <HomeModernIcon className="h-6 w-6" />,
    },
    {
      path: "/contracts",
      name: "Quản lý hợp đồng",
      icon: <DocumentTextIcon className="h-6 w-6" />,
    },
    {
      path: "/payments",
      name: "Quản lý thanh toán",
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
    },
  ];

  // Chọn menu phù hợp dựa vào vai trò
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="bg-blue-800 text-white w-64 flex-shrink-0 h-screen">
      <div className="p-4 font-bold text-xl">Quản lý ký túc xá KTX</div>
      <nav className="mt-5">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  flex items-center px-4 py-3 transition-colors
                  ${
                    location.pathname === item.path
                      ? "bg-blue-900 text-white"
                      : "text-blue-200 hover:bg-blue-700 hover:text-white"
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="menu-text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hiển thị vai trò người dùng hiện tại */}
      <div className="absolute bottom-4 left-0 w-full px-4 text-xs text-center text-blue-300">
        {isAdmin
          ? "Đăng nhập với vai trò: Admin"
          : "Đăng nhập với vai trò: User"}
      </div>
    </div>
  );
};

export default Sidebar;
