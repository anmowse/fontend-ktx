import React from "react";
import {
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";

const RoomCard = ({ room, building, onView, onEdit, onDelete }) => {
  // Tính toán phần trăm lấp đầy phòng
  const maxOccupants = parseInt(room.type.split(" ")[0]);
  const occupancyPercentage = (room.current_occupancy / maxOccupants) * 100;

  // Xác định màu sắc dựa trên mức độ lấp đầy
  const getOccupancyColor = () => {
    if (occupancyPercentage < 50) return "bg-green-500";
    if (occupancyPercentage < 90) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Format giá phòng thành định dạng tiền tệ Việt Nam
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header Card - Hiển thị số phòng và trạng thái */}
      <div className="p-4 bg-blue-50 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Phòng {room.number}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium text-white 
          ${
            room.current_occupancy >= maxOccupants
              ? "bg-red-500"
              : "bg-green-500"
          }`}
        >
          {room.current_occupancy >= maxOccupants ? "Đã đầy" : "Còn trống"}
        </span>
      </div>

      {/* Body Card - Thông tin chi tiết */}
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <FaBuilding className="text-gray-500 mr-2" />
          <span className="text-gray-700">
            {building ? building.nameBuild : "N/A"}
          </span>
        </div>

        <div className="mb-4 flex items-center">
          <FaUsers className="text-gray-500 mr-2" />
          <span className="text-gray-700">{room.type}</span>
        </div>

        <div className="mb-4 flex items-center">
          <FaMoneyBillWave className="text-gray-500 mr-2" />
          <span className="text-gray-700 font-semibold">
            {formatPrice(room.price)}
          </span>
        </div>

        {/* Hiển thị tỉ lệ lấp đầy bằng thanh tiến trình */}
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-600">Tỉ lệ lấp đầy</span>
            <span className="text-sm font-semibold text-gray-700">
              {room.current_occupancy}/{maxOccupants}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getOccupancyColor()}`}
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Card - Các nút hành động */}
      <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
        <button
          onClick={() => onView(room)}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaEye className="mr-1" /> Xem
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(room)}
            className="flex items-center text-yellow-600 hover:text-yellow-800"
          >
            <FaEdit className="mr-1" /> Sửa
          </button>
          <button
            onClick={() => onDelete(room)} // Giữ nguyên, bởi vì chúng ta đã xử lý trong handleDeleteRoom
            className="text-red-600 hover:text-red-900"
            title="Xóa"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
