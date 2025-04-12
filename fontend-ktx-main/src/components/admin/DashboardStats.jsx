import React, { useState, useEffect } from "react";
import StatisticCard from "./StatisticCard";
import axios from "axios";
import API_URL from "../../config/api";
import {
  UserIcon,
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

// Định nghĩa API URL
// Thống kê bảng điều khiển
const DashboardStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    rooms: { total: 0, occupied: 0 },
    contracts: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersResponse = await axios.get(`${API_URL}/users`);

        // Fetch rooms data
        const roomsResponse = await axios.get(`${API_URL}/rooms`);
        const rooms = roomsResponse.data;
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(
          (room) => room.current_occupancy > 0
        ).length;

        // Fetch contracts
        const contractsResponse = await axios.get(`${API_URL}/contracts`);

        // Fetch payments
        const paymentsResponse = await axios.get(`${API_URL}/payments`);
        const pendingPayments = paymentsResponse.data.filter(
          (payment) => payment.status === "chua thanh toan"
        ).length;

        setStats({
          users: usersResponse.data.length,
          rooms: { total: totalRooms, occupied: occupiedRooms },
          contracts: contractsResponse.data.length,
          pendingPayments: pendingPayments,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
        setError("Failed to load dashboard statistics");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatisticCard
        title="TỔNG SỐ SINH VIÊN"
        value={stats.users}
        icon={<UserIcon className="h-8 w-8" />}
        color="border-blue-500"
        bgColor="text-blue-600"
        link="/users"
      />

      <StatisticCard
        title="PHÒNG (ĐÃ SỬ DỤNG/TỔNG)"
        value={`${stats.rooms.occupied}/${stats.rooms.total}`}
        icon={<HomeIcon className="h-8 w-8" />}
        color="border-green-500"
        bgColor="text-green-600"
        link="/rooms"
      />

      <StatisticCard
        title="HỢP ĐỒNG ĐANG HIỆU LỰC"
        value={stats.contracts}
        icon={<DocumentTextIcon className="h-8 w-8" />}
        color="border-yellow-500"
        bgColor="text-yellow-600"
        link="/contracts"
      />

      <StatisticCard
        title="THANH TOÁN CHƯA HOÀN THÀNH"
        value={stats.pendingPayments}
        icon={<CurrencyDollarIcon className="h-8 w-8" />}
        color="border-red-500"
        bgColor="text-red-600"
        link="/payments"
      />
    </div>
  );
};

export default DashboardStats;
