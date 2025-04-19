import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/admin/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const auth = useAuth();
  const user = auth?.user;
  const role = user?.role || "User";

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`bg-blue-800 text-white transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-blue-700">
        {!isCollapsed && <h1 className="text-xl font-bold">KTX Management</h1>}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-blue-700"
        >
          {isCollapsed ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              ></path>
            </svg>
          )}
        </button>
      </div>
      <nav className="mt-5">
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 ${
                location.pathname === "/dashboard"
                  ? "bg-blue-900"
                  : "hover:bg-blue-700"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              {!isCollapsed && <span className="ml-3">Dashboard</span>}
            </Link>
          </li>

          {role === "Admin" && (
            <>
              <li>
                <Link
                  to="/users"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/users"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path>
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3">Quản lý sinh viên</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/rooms"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/rooms"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                  {!isCollapsed && <span className="ml-3">Quản lý phòng</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/contracts"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/contracts"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3">Quản lý hợp đồng</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/payments"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/payments"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3">Quản lý thanh toán</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/services"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3">Quản lý dịch vụ</span>
                  )}
                </Link>
              </li>
            </>
          )}

          {role === "User" && (
            <>
              <li>
                <Link
                  to="/user/dang-ky-noi-tru"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/user/dang-ky-noi-tru"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3">Đăng ký nội trú</span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/user/contracts"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/user/contracts"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  {!isCollapsed && <span className="ml-3">Xem hợp đồng</span>}
                </Link>
              </li>
              <li>
                <Link
                  to="/user/thanh-toan-tien-phong"
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === "/user/thanh-toan-tien-phong"
                      ? "bg-blue-900"
                      : "hover:bg-blue-700"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  {!isCollapsed && (
                    <span className="ml-3">Thanh toán tiền phòng</span>
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
