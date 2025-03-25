import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");

    // Chuyển hướng về trang login
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý KTX</h1>
        <div className="flex items-center">
          <span className="px-4 text-gray-700">
            {localStorage.getItem("userName") || "Admin"}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
