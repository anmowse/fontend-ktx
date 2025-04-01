import React, { useState, useEffect } from "react";
import { FaFilter, FaSearch, FaUndo } from "react-icons/fa";

const ContractFilter = ({
  rooms = [],
  users = [],
  onFilter,
  initialFilters = {},
}) => {
  // State lưu trữ giá trị của các bộ lọc
  const [filters, setFilters] = useState({
    status: "all",
    room: "all",
    user: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
    ...initialFilters, // Áp dụng các bộ lọc ban đầu nếu có
  });

  // State để kiểm soát việc hiển thị/ẩn bộ lọc trên mobile
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  // Theo dõi thay đổi initialFilters và cập nhật state nếu có sự thay đổi
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...initialFilters,
    }));
  }, [initialFilters]);

  // Hàm xử lý khi giá trị của các bộ lọc thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Hàm xử lý khi form được submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
    if (window.innerWidth < 768) {
      setIsFilterVisible(false); // Ẩn bộ lọc trên mobile sau khi áp dụng
    }
  };

  // Hàm reset bộ lọc về giá trị mặc định
  const handleReset = () => {
    const defaultFilters = {
      status: "all",
      room: "all",
      user: "all",
      dateFrom: "",
      dateTo: "",
      searchTerm: "",
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  // Toggle hiển thị/ẩn bộ lọc trên mobile
  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700 flex items-center">
          <FaFilter className="mr-2 text-blue-500" /> Bộ lọc hợp đồng
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={toggleFilter}
            className="md:hidden bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
          >
            {isFilterVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 flex items-center"
          >
            <FaUndo className="mr-1" /> Reset
          </button>
        </div>
      </div>

      <div className={`p-4 ${!isFilterVisible ? "hidden md:block" : ""}`}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bộ lọc trạng thái */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Trạng thái hợp đồng
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hiệu lực</option>
                <option value="pending">Chờ xử lý</option>
                <option value="expired">Hết hạn</option>
                <option value="terminated">Đã hủy</option>
              </select>
            </div>

            {/* Bộ lọc phòng */}
            <div>
              <label
                htmlFor="room"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phòng
              </label>
              <select
                id="room"
                name="room"
                value={filters.room}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả các phòng</option>
                {rooms.map((room) => (
                  <option key={room.id_rooms} value={room.id_rooms}>
                    Phòng {room.number}
                  </option>
                ))}
              </select>
            </div>

            {/* Bộ lọc sinh viên */}
            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Sinh viên
              </label>
              <select
                id="user"
                name="user"
                value={filters.user}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả sinh viên</option>
                {users.map((user) => (
                  <option key={user.id_users} value={user.id_users}>
                    {user.fullname || user.email || `User ${user.id_users}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Từ ngày
              </label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Đến ngày
              </label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tìm kiếm theo mã hợp đồng */}
            <div>
              <label
                htmlFor="searchTerm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="searchTerm"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleChange}
                  placeholder="Nhập mã hợp đồng..."
                  className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractFilter;
