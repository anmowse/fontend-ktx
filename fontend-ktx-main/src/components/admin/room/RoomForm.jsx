import React, { useState, useEffect } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";
import API_URL from "../../../config/api";
const RoomForm = ({ room = null, buildings = [], onSubmit, onCancel }) => {
  // State cho form data
  const [formData, setFormData] = useState({
    id_buildings: "",
    number: "",
    type: "",
    price: "",
    current_occupancy: room ? room.current_occupancy : 0,
  });

  // State cho lỗi
  const [errors, setErrors] = useState({});

  // State cho trạng thái submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho kiểm tra trùng lặp
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Timeout cho debounce kiểm tra trùng
  const [checkDuplicateTimeout, setCheckDuplicateTimeout] = useState(null);

  // Khởi tạo form data nếu đang chỉnh sửa
  useEffect(() => {
    if (room) {
      setFormData({
        id_buildings: room.id_buildings || "",
        number: room.number || "",
        type: room.type || "",
        price: room.price || "",
        current_occupancy: room.current_occupancy || 0,
      });
    }
  }, [room]);

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

    // Kiểm tra trùng lặp số phòng
    if (name === "number" || name === "id_buildings") {
      if (value) {
        // Clear timeout hiện tại nếu có
        if (checkDuplicateTimeout) {
          clearTimeout(checkDuplicateTimeout);
        }

        // Đặt timeout mới (debounce)
        const timeoutId = setTimeout(() => {
          checkDuplicateRoom(
            formData.id_buildings,
            name === "number" ? value : formData.number
          );
        }, 500);

        setCheckDuplicateTimeout(timeoutId);

        // Xóa lỗi trùng nếu có
        if (errors.duplicate) {
          setErrors((prev) => ({
            ...prev,
            duplicate: null,
          }));
        }
      }
    }
  };

  // Kiểm tra trùng số phòng trong cùng tòa nhà
  const checkDuplicateRoom = async (buildingId, roomNumber) => {
    // Kiểm tra nếu cả tòa nhà và số phòng đều có giá trị
    if (!buildingId || !roomNumber) return;

    setIsCheckingDuplicate(true);

    try {
      const response = await axios.get(`${API_URL}/rooms/check-duplicate`, {
        params: {
          building_id: buildingId,
          room_number: roomNumber,
          exclude_id: room ? room.id_rooms : null,
        },
      });

      if (response.data.exists) {
        setErrors((prev) => ({
          ...prev,
          duplicate: `Phòng số ${roomNumber} đã tồn tại trong tòa nhà này.`,
        }));
      } else {
        // Xóa lỗi nếu không còn trùng
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.duplicate;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Error checking duplicate room:", error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Kiểm tra tòa nhà
    if (!formData.id_buildings) {
      newErrors.id_buildings = "Vui lòng chọn tòa nhà";
    }

    // Kiểm tra số phòng
    if (!formData.number) {
      newErrors.number = "Vui lòng nhập số phòng";
    } else if (!/^\d+$/.test(formData.number)) {
      newErrors.number = "Số phòng phải là số";
    }

    // Loại phòng mặc định là 8 giường
    formData.type = "8 giuong";

    // Kiểm tra giá phòng
    if (!formData.price) {
      newErrors.price = "Vui lòng nhập giá phòng";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Giá phòng phải là số dương";
    }

    // Kiểm tra số sinh viên hiện tại
    if (formData.current_occupancy < 0) {
      newErrors.current_occupancy = "Số sinh viên không thể là số âm";
    }

    // Kiểm tra số sinh viên không vượt quá sức chứa
    if (formData.type && formData.current_occupancy) {
      const maxCapacity = parseInt(formData.type.split(" ")[0]);
      if (parseInt(formData.current_occupancy) > maxCapacity) {
        newErrors.current_occupancy = `Số sinh viên không thể vượt quá ${maxCapacity} (sức chứa của phòng)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Kiểm tra trùng lặp một lần nữa
    if (errors.duplicate) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuyển đổi kiểu dữ liệu
      const dataToSubmit = {
        ...formData,
        id_buildings: parseInt(formData.id_buildings),
        price: parseFloat(formData.price),
        current_occupancy: parseInt(formData.current_occupancy || 0),
      };

      // Gọi hàm onSubmit từ component cha
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Error submitting form:", error);

      // Xử lý lỗi từ server
      if (error.response) {
        if (error.response.status === 422) {
          // Lỗi validation từ Laravel
          const serverErrors = error.response.data.errors;
          const formattedErrors = {};

          for (const key in serverErrors) {
            formattedErrors[key] = serverErrors[key][0];
          }

          setErrors((prev) => ({
            ...prev,
            ...formattedErrors,
          }));
        } else {
          // Lỗi khác
          setErrors((prev) => ({
            ...prev,
            submit:
              error.response.data.message ||
              "Đã xảy ra lỗi khi lưu phòng. Vui lòng thử lại sau.",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          submit:
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại sau.",
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {room ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="id_buildings"
          >
            Tòa nhà <span className="text-red-500">*</span>
          </label>
          <select
            id="id_buildings"
            name="id_buildings"
            value={formData.id_buildings}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.id_buildings || errors.duplicate
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-blue-500"
            }`}
            disabled={isSubmitting}
          >
            <option value="">-- Chọn tòa nhà --</option>
            {buildings.map((building) => (
              <option key={building.id_buildings} value={building.id_buildings}>
                {building.nameBuild} - {building.location}
              </option>
            ))}
          </select>
          {errors.id_buildings && (
            <p className="text-red-500 text-xs mt-1">{errors.id_buildings}</p>
          )}
        </div>

        <div className="mb-4 relative">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="number"
          >
            Số phòng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.number || errors.duplicate
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-blue-500"
            }`}
            placeholder="Nhập số phòng"
            disabled={isSubmitting}
          />
          {errors.number && (
            <p className="text-red-500 text-xs mt-1">{errors.number}</p>
          )}
          {isCheckingDuplicate && (
            <span className="absolute right-3 top-9 text-blue-500">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          )}
        </div>

        {errors.duplicate && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            <p className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.duplicate}
            </p>
          </div>
        )}

        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="price"
          >
            Giá phòng (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
              errors.price
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-blue-500"
            }`}
            placeholder="Nhập giá phòng"
            min="0"
            disabled={isSubmitting}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price}</p>
          )}
        </div>

        {room && (
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="current_occupancy"
            >
              Số sinh viên hiện đang ở
            </label>
            <input
              type="number"
              id="current_occupancy"
              name="current_occupancy"
              value={formData.current_occupancy}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                errors.current_occupancy
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
              min="0"
              max={formData.type ? parseInt(formData.type.split(" ")[0]) : 0}
              disabled={isSubmitting}
            />
            {errors.current_occupancy && (
              <p className="text-red-500 text-xs mt-1">
                {errors.current_occupancy}
              </p>
            )}
          </div>
        )}

        {/* Lỗi chung */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Các nút action */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <FaTimes className="mr-2" /> Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors"
            disabled={
              isSubmitting ||
              isCheckingDuplicate ||
              Object.keys(errors).length > 0
            }
          >
            <FaSave className="mr-2" />{" "}
            {isSubmitting ? "Đang lưu..." : "Lưu phòng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;
