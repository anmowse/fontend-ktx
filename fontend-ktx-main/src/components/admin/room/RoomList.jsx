import React, { useState, useEffect, useMemo } from "react";
import { FaEdit, FaTrash, FaEye, FaSync } from "react-icons/fa";
import axios from "axios";
import API_URL from "../../../config/api";
const RoomList = ({ rooms, buildings, onEdit, onDelete, onView }) => {
  const [sortField, setSortField] = useState("id_rooms");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterBuilding, setFilterBuilding] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [roomUsers, setRoomUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Danh sách loại phòng duy nhất - dùng useMemo để tối ưu hiệu năng
  const roomTypes = useMemo(() => {
    return [...new Set(rooms.map((room) => room.type))];
  }, [rooms]);

  // Fetch số lượng người dùng trong các phòng - cải tiến với batching
  const fetchRoomUsers = async () => {
    if (rooms.length === 0) return;

    setLoadingUsers(true);
    const usersData = {};

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      console.log(headers);
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < rooms.length; i += batchSize) {
        batches.push(rooms.slice(i, i + batchSize));
      }

      // Xử lý từng batch một
      for (const batch of batches) {
        await Promise.all(
          batch.map(async (room) => {
            try {
              const response = await axios.get(
                `${API_URL}/room/${room.id_rooms}/users`,
                { headers }
              );
              usersData[room.id_rooms] = response.data?.length || 0;
            } catch (err) {
              console.error(
                `Error fetching users for room ${room.id_rooms}:`,
                err
              );
              usersData[room.id_rooms] = 0;
            }
          })
        );
      }

      setRoomUsers(usersData);
    } catch (error) {
      console.error("Error fetching room users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchRoomUsers();
    // Reset về trang đầu tiên khi thay đổi bộ lọc
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, filterBuilding, filterType]);

  // Xử lý sắp xếp
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Lọc và sắp xếp phòng - sử dụng useMemo để tối ưu
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        if (filterBuilding !== "all" && room.id_buildings != filterBuilding) {
          return false;
        }
        if (filterType !== "all" && room.type !== filterType) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (
          sortField === "id_rooms" ||
          sortField === "price" ||
          sortField === "current_occupancy" ||
          sortField === "number"
        ) {
          return sortDirection === "asc"
            ? a[sortField] - b[sortField]
            : b[sortField] - a[sortField];
        }
        return sortDirection === "asc"
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]));
      });
  }, [rooms, filterBuilding, filterType, sortField, sortDirection]);

  // Tính toán thông tin phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  // Xử lý thay đổi trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Hàm lấy số người tối đa từ loại phòng
  const getMaxOccupancy = (roomType) => {
    if (!roomType) return 0;
    const match = roomType.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  // Format giá phòng
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-700">
          Danh sách phòng ({filteredRooms.length})
        </h2>

        {/* Bộ lọc và nút refresh */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tòa nhà:</label>
            <select
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              {buildings.map((building) => (
                <option
                  key={building.id_buildings}
                  value={building.id_buildings}
                >
                  {building.nameBuild}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Loại phòng:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchRoomUsers}
            disabled={loadingUsers}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
              loadingUsers
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="Cập nhật số người trong phòng"
          >
            <FaSync className={loadingUsers ? "animate-spin" : ""} />
            {loadingUsers ? "Đang tải..." : "Làm mới"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("id_rooms")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                ID{" "}
                {sortField === "id_rooms" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("number")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Số phòng{" "}
                {sortField === "number" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("type")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Loại phòng{" "}
                {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("current_occupancy")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                SL hiện tại{" "}
                {sortField === "current_occupancy" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("price")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Giá phòng{" "}
                {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tòa nhà
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((room) => {
                console.log(room);
                const building = buildings.find(
                  (b) => b.id_buildings === room.id_buildings
                );

                const kiemtraUser =
                  roomUsers[room.id_rooms] !== undefined
                    ? roomUsers[room.id_rooms]
                    : room.current_occupancy;

                const maxOccupancy = getMaxOccupancy(room.type);

                return (
                  <tr key={room.id_rooms} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.id_rooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          kiemtraUser >= maxOccupancy
                            ? "bg-red-100 text-red-800"
                            : kiemtraUser >= maxOccupancy * 0.8
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {loadingUsers && roomUsers[room.id_rooms] === undefined
                          ? "..."
                          : kiemtraUser}{" "}
                        / {maxOccupancy}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(room.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {building ? building.nameBuild : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => onView(room)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => onEdit(room)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        {kiemtraUser === 0 ? (
                          <button
                            onClick={() => {

                              if (!headers) {
                                toast.error(
                                  "Bạn cần đăng nhập để thực hiện chức năng này!"
                                );
                                return;
                              }
                              onDelete(room);
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        ) : (
                          ""
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-4 text-center text-gray-500 text-sm"
                >
                  Không tìm thấy phòng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {filteredRooms.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center">
          <div className="flex space-x-1 mt-2 sm:mt-0">
            {/* Nút Previous */}
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              &laquo;
            </button>

            {/* Số trang */}
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => handlePageChange(number + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === number + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {number + 1}
              </button>
            ))}

            {/* Nút Next */}
            <button
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              &raquo;
            </button>
          </div>

          {/* Thông tin phân trang */}
          <div className="text-sm text-gray-700 mt-2 sm:mt-0">
            Hiển thị {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredRooms.length)} của{" "}
            {filteredRooms.length} phòng
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
