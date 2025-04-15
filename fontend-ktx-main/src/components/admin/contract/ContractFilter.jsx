import React, { useState, useEffect } from "react";
import {
  FaFilter,
  FaSearch,
  FaUndo,
  FaCalendarAlt,
  FaBuilding,
  FaUser,
} from "react-icons/fa";

const ContractFilter = ({
  rooms = [],
  users = [],
  buildings = [],
  onFilter,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState({
    status: "all",
    room: "all",
    building: "all",
    user: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
    paymentStatus: "all",
    ...initialFilters,
  });

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState(rooms);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      ...initialFilters,
    }));
  }, [initialFilters]);

  useEffect(() => {
    if (filters.building === "all") {
      setFilteredRooms(rooms);
    } else {
      const filtered = rooms.filter(
        (room) => room.id_buildings === parseInt(filters.building)
      );
      setFilteredRooms(filtered);
    }
  }, [filters.building, rooms]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,
      };

      if (name === "building") {
        newFilters.room = "all";
      }

      return newFilters;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Đang áp dụng bộ lọc:", filters);
    onFilter(filters);
    if (window.innerWidth < 768) {
      setIsFilterVisible(false);
    }
  };

  const handleReset = () => {
    const defaultFilters = {
      status: "all",
      room: "all",
      building: "all",
      user: "all",
      dateFrom: "",
      dateTo: "",
      searchTerm: "",
      paymentStatus: "all",
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

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
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaCalendarAlt className="inline mr-1 text-blue-500" /> Trạng
                thái hợp đồng
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

            <div>
              <label
                htmlFor="building"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaBuilding className="inline mr-1 text-blue-500" /> Tòa nhà
              </label>
              <select
                id="building"
                name="building"
                value={filters.building}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả các tòa nhà</option>
                {buildings.map((building) => (
                  <option
                    key={building.id_buildings}
                    value={building.id_buildings}
                  >
                    Tòa {building.nameBuild || building.id_buildings}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="room"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaBuilding className="inline mr-1 text-blue-500" /> Phòng
              </label>
              <select
                id="room"
                name="room"
                value={filters.room}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả các phòng</option>
                {filteredRooms.map((room) => (
                  <option key={room.id_rooms} value={room.id_rooms}>
                    Phòng {room.number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="user"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaUser className="inline mr-1 text-blue-500" /> Sinh viên
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
                    {user.name || user.email || `User ${user.id_users}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="paymentStatus"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaCalendarAlt className="inline mr-1 text-blue-500" /> Trạng
                thái thanh toán
              </label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="partially_paid">Thanh toán một phần</option>
                <option value="unpaid">Chưa thanh toán</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="searchTerm"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaSearch className="inline mr-1 text-blue-500" /> Tìm kiếm
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

            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaCalendarAlt className="inline mr-1 text-blue-500" /> Từ ngày
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

            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FaCalendarAlt className="inline mr-1 text-blue-500" /> Đến ngày
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
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaFilter className="mr-2" /> Áp dụng bộ lọc
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractFilter;
