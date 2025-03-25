import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  // Bỏ qua chức năng đăng xuất
  const handleLogout = () => {
    console.log("Logout functionality disabled");
    // Không xóa thông tin đăng nhập và không chuyển hướng
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý KTX</h1>
        <div className="flex items-center">
          <span className="px-4 text-gray-700">Admin</span>
          <button
            onClick={handleLogout}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm font-medium"
          >
            Đăng xuất (đã vô hiệu)
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
