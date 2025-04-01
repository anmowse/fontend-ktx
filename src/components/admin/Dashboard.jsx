import React from "react";
import DashboardStats from "./DashboardStats";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>

      {/* Thống kê tổng quan */}
      <DashboardStats />

      {/* Các phần khác của Dashboard sẽ được thêm sau */}
      <div className="mt-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-blue-600">
              Thông tin tổng quan KTX
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Chào mừng đến với hệ thống quản lý KTX. Hệ thống này giúp bạn quản
              lý thông tin sinh viên, phòng ở, hợp đồng, thanh toán và các dịch
              vụ khác trong khu ký túc xá.
            </p>
            <p className="text-gray-700">
              Sử dụng các chức năng từ menu để quản lý chi tiết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
