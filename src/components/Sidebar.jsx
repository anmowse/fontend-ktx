import React from "react";
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
  // Comment chức năng kiểm tra vai trò
  // const isAdmin = localStorage.getItem("userRole") === "Admin";

  // Luôn coi như là Admin
  const isAdmin = true;

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <HomeIcon className="h-6 w-6" />,
      adminOnly: true,
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
      adminOnly: true,
    },
  ];

  return (
    <div className="bg-blue-800 text-white w-64 hidden md:block flex-shrink-0">
      <div className="p-4 font-bold text-xl">KTX Management</div>
      <nav className="mt-5">
        <ul>
          {menuItems.map((item) => {
            // Skip admin-only items if user is not admin
            if (item.adminOnly && !isAdmin) return null;

            return (
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
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
