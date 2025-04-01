import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaTimes } from "react-icons/fa";

const RoomFilter = ({ buildings, onFilter, initialFilters = {} }) => {
  // State chứa các tiêu chí lọc
  const [filters, setFilters] = useState({
    buildingId: initialFilters.buildingId || "all",
    roomType: initialFilters.roomType || "all",
    priceMin: initialFilters.priceMin || "",
    priceMax: initialFilters.priceMax || "",
    occupancyStatus: initialFilters.occupancyStatus || "all",
    searchTerm: initialFilters.searchTerm || "",
  });

  // State để kiểm soát hiển thị/ẩn bộ lọc mở rộng trên mobile
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Gửi sự kiện lọc khi filters thay đổi
  useEffect(() => {
    // Sử dụng timeout để tránh trigger filter quá nhiều khi user đang nhập
    const handler = setTimeout(() => {
      onFilter(filters);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilter]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset tất cả bộ lọc về giá trị mặc định
  const handleReset = () => {
    setFilters({
      buildingId: "all",
      roomType: "all",
      priceMin: "",
      priceMax: "",
      occupancyStatus: "all",
      searchTerm: "",
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Tìm kiếm phòng - luôn hiển thị */}
        <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
          <div className="relative flex-1 md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleChange}
              placeholder="Tìm kiếm theo số phòng..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Toggle hiển thị bộ lọc nâng cao (mobile only) */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="md:hidden ml-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200"
            aria-label="Toggle filters"
          >
            <FaFilter
              className={
                showAdvancedFilters ? "text-blue-500" : "text-gray-500"
              }
            />
          </button>
        </div>

        {/* Số lượng bộ lọc đang áp dụng */}
        <div className="md:flex items-center hidden">
          {Object.entries(filters).filter(
            ([key, value]) =>
              key !== "searchTerm" && value !== "all" && value !== ""
          ).length > 0 && (
            <span className="text-sm text-gray-600 mr-2">
              {
                Object.entries(filters).filter(
                  ([key, value]) =>
                    key !== "searchTerm" && value !== "all" && value !== ""
                ).length
              }{" "}
              bộ lọc đang áp dụng
            </span>
          )}

          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaTimes className="mr-1" /> Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Bộ lọc nâng cao - ẩn trên mobile, luôn hiển thị trên desktop */}
      <div
        className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 ${
          showAdvancedFilters ? "block" : "hidden md:grid"
        }`}
      >
        {/* Lọc theo tòa nhà */}
        <div>
          <label
            htmlFor="buildingId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tòa nhà
          </label>
          <select
            id="buildingId"
            name="buildingId"
            value={filters.buildingId}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả tòa nhà</option>
            {buildings.map((building) => (
              <option key={building.id_buildings} value={building.id_buildings}>
                {building.nameBuild}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc theo loại phòng */}
        <div>
          <label
            htmlFor="roomType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Loại phòng
          </label>
          <select
            id="roomType"
            name="roomType"
            value={filters.roomType}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại phòng</option>
            <option value="3 giuong">3 giường</option>
            <option value="6 giuong">6 giường</option>
            <option value="8 giuong">8 giường</option>
          </select>
        </div>

        {/* Lọc theo tình trạng lấp đầy */}
        <div>
          <label
            htmlFor="occupancyStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tình trạng
          </label>
          <select
            id="occupancyStatus"
            name="occupancyStatus"
            value={filters.occupancyStatus}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả tình trạng</option>
            <option value="available">Còn chỗ trống</option>
            <option value="full">Đã đầy</option>
          </select>
        </div>

        {/* Lọc theo khoảng giá */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng giá (VND)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              name="priceMin"
              value={filters.priceMin}
              onChange={handleChange}
              placeholder="Từ"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              name="priceMax"
              value={filters.priceMax}
              onChange={handleChange}
              placeholder="Đến"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Nút reset filter (chỉ hiển thị trên mobile) */}
      {showAdvancedFilters && (
        <div className="mt-4 flex justify-end md:hidden">
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <FaTimes className="mr-1" /> Xóa bộ lọc (
            {
              Object.entries(filters).filter(
                ([key, value]) =>
                  key !== "searchTerm" && value !== "all" && value !== ""
              ).length
            }
            )
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomFilter;
