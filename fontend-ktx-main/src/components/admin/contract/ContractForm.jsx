import React, { useState, useEffect } from "react";
import { FaSave, FaTimes, FaCalendar } from "react-icons/fa";
import { differenceInMonths } from "date-fns";

const ContractForm = ({
  contract = null,
  rooms = [],
  users = [],
  onSubmit,
  onCancel,
}) => {
  // Khởi tạo state cho form data - giản lược theo cấu trúc DB
  const [formData, setFormData] = useState({
    id_users: "",
    id_rooms: "",
    start_date: "",
    end_date: "",
    // Các trường tính toán (không có trong DB)
    duration: "", // Chỉ để hiển thị, không gửi lên server
  });

  // State cho errors
  const [errors, setErrors] = useState({});

  // State cho submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kiểm tra và fill data nếu đang edit contract
  useEffect(() => {
    if (contract) {
      // Format dates to YYYY-MM-DD for input fields
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toISOString().split("T")[0];
      };

      // Calculate duration
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const months = differenceInMonths(endDate, startDate);

      setFormData({
        id_users: contract.id_users || "",
        id_rooms: contract.id_rooms || "",
        start_date: formatDate(contract.start_date),
        end_date: formatDate(contract.end_date),
        duration: months.toString(),
      });
    }
  }, [contract]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi khi user bắt đầu sửa
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Tính toán thời hạn khi thay đổi ngày
    if (
      (name === "start_date" || name === "end_date") &&
      formData.start_date &&
      (name === "end_date" ? value : formData.end_date)
    ) {
      try {
        const startDate =
          name === "start_date"
            ? new Date(value)
            : new Date(formData.start_date);
        const endDate =
          name === "end_date" ? new Date(value) : new Date(formData.end_date);

        if (startDate && endDate) {
          const months = differenceInMonths(endDate, startDate) || 0;

          setFormData((prev) => ({
            ...prev,
            duration: months > 0 ? months.toString() : "",
          }));
        }
      } catch (error) {
        console.error("Date calculation error:", error);
      }
    }
  };

  // Validation form trước khi submit
  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra user
    if (!formData.id_users) {
      newErrors.id_users = "Vui lòng chọn sinh viên";
    }

    // Kiểm tra phòng
    if (!formData.id_rooms) {
      newErrors.id_rooms = "Vui lòng chọn phòng";
    }

    // Kiểm tra ngày bắt đầu
    if (!formData.start_date) {
      newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
    }

    // Kiểm tra ngày kết thúc
    if (!formData.end_date) {
      newErrors.end_date = "Vui lòng chọn ngày kết thúc";
    } else if (
      formData.start_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    ) {
      newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị dữ liệu để gửi đi (chỉ những trường có trong DB)
      const dataToSubmit = {
        id_users: parseInt(formData.id_users),
        id_rooms: parseInt(formData.id_rooms),
        start_date: formData.start_date,
        end_date: formData.end_date,
      };

      // Gọi callback từ parent component
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Đã xảy ra lỗi khi lưu hợp đồng. Vui lòng thử lại sau.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tìm thông tin phòng hiện tại
  const selectedRoom = rooms.find(
    (room) => room.id_rooms === parseInt(formData.id_rooms)
  );

  // Hàm lấy sức chứa tối đa của phòng từ loại phòng
  const getRoomCapacity = (roomType) => {
    if (!roomType) return 0;

    // Trích xuất số lượng từ chuỗi loại phòng
    // Ví dụ: "4 người", "Phòng 6 người", "Đơn", "1 người"
    const match = roomType.match(/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1]);
    }

    // Nếu không có số trong chuỗi, xác định dựa trên từ khóa
    if (
      roomType.toLowerCase().includes("đơn") ||
      roomType.toLowerCase().includes("1 người")
    ) {
      return 1;
    }
    if (
      roomType.toLowerCase().includes("đôi") ||
      roomType.toLowerCase().includes("2 người")
    ) {
      return 2;
    }

    // Mặc định
    return 0;
  };

  // Tìm phòng trống đủ điều kiện
  const availableRooms = rooms.filter((room) => {
    // Nếu đang edit hợp đồng và là phòng hiện tại, luôn hiển thị
    if (contract && contract.id_rooms === room.id_rooms) {
      return true;
    }

    // Kiểm tra xem phòng có còn chỗ trống không
    const maxCapacity = getRoomCapacity(room.type);
    const currentOccupancy = room.current_occupancy || 0;

    return currentOccupancy < maxCapacity;
  });

  // Format currency cho hiển thị giá
  const formatCurrency = (value) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Hiển thị thông tin phòng
  const renderRoomOption = (room) => {
    const capacity = getRoomCapacity(room.type);
    const occupancy = room.current_occupancy || 0;
    console.log("Room capacity:", capacity, "Occupancy:", occupancy);

    return `Phòng ${room.number} - ${room.type} (${occupancy}/${capacity} người)`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">
          {contract ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn sinh viên */}
          <div>
            <label
              htmlFor="id_users"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sinh viên <span className="text-red-500">*</span>
            </label>
            <select
              id="id_users"
              name="id_users"
              value={formData.id_users}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.id_users ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">-- Chọn sinh viên --</option>
              {users.map((user) => (
                <option key={user.id_users} value={user.id_users}>
                  {user.name || "N/A"}
                </option>
              ))}
            </select>
            {errors.id_users && (
              <p className="mt-1 text-sm text-red-500">{errors.id_users}</p>
            )}
          </div>

          {/* Chọn phòng */}
          <div>
            <label
              htmlFor="id_rooms"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phòng <span className="text-red-500">*</span>
            </label>
            <select
              id="id_rooms"
              name="id_rooms"
              value={formData.id_rooms}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.id_rooms ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
            >
              <option value="">-- Chọn phòng --</option>
              {availableRooms.map((room) => (
                <option key={room.id_rooms} value={room.id_rooms}>
                  {renderRoomOption(room)}
                </option>
              ))}
            </select>
            {errors.id_rooms && (
              <p className="mt-1 text-sm text-red-500">{errors.id_rooms}</p>
            )}
            {formData.id_rooms && selectedRoom && (
              <p className="mt-1 text-sm text-gray-600">
                Giá phòng: {formatCurrency(selectedRoom.price)}/tháng
              </p>
            )}
          </div>

          {/* Ngày bắt đầu */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaCalendar className="text-gray-400" />
              </div>
            </div>
            {errors.start_date && (
              <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
            )}
          </div>

          {/* Ngày kết thúc */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.end_date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <FaCalendar className="text-gray-400" />
              </div>
            </div>
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
            )}
          </div>

          {/* Thời hạn (chỉ hiển thị, không gửi lên server) */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Thời hạn (tháng)
            </label>
            <input
              type="text"
              id="duration"
              value={formData.duration}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
              disabled={true}
            />
            <p className="mt-1 text-xs text-gray-500">
              Thời hạn được tính tự động từ ngày bắt đầu và kết thúc
            </p>
          </div>
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center hover:bg-gray-300"
            disabled={isSubmitting}
          >
            <FaTimes className="mr-2" /> Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <FaSave className="mr-2" />
            {isSubmitting ? "Đang lưu..." : "Lưu hợp đồng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContractForm;
