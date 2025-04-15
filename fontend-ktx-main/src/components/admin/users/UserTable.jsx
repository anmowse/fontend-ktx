import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import API_URL from "../../../config/api";

const UserTable = ({ users, onEdit, onDelete, onViewDetails }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Hàm kiểm tra ràng buộc trước khi xóa
  const handleDelete = async (userId) => {
    if (isDeleting) return; // Ngăn nhiều lần click

    setIsDeleting(true);

    // Mảng lưu trữ thông tin ràng buộc
    const constraints = [];
    let hasAnyError = false;

    try {
      // Kiểm tra xem sinh viên có hợp đồng đang hoạt động hay không
      try {
        const contractsResponse = await axios.get(
          `${API_URL}/users/${userId}/contracts`
        );

        if (contractsResponse.data && contractsResponse.data.length > 0) {
          // Kiểm tra xem có hợp đồng đang hoạt động không
          const today = new Date();
          const activeContracts = contractsResponse.data.filter((contract) => {
            const endDate = new Date(contract.end_date);
            return endDate > today;
          });

          if (activeContracts.length > 0) {
            constraints.push("hợp đồng đang hoạt động");
          }
        }
      } catch (contractError) {
        console.warn("Không thể kiểm tra ràng buộc hợp đồng:", contractError);
        hasAnyError = true;
      }

      // Kiểm tra xem sinh viên có thanh toán chưa hoàn tất hay không
      try {
        const paymentsResponse = await axios.get(
          `${API_URL}/users/${userId}/payments`
        );

        if (paymentsResponse.data && paymentsResponse.data.length > 0) {
          // Kiểm tra xem có khoản thanh toán nào chưa hoàn tất không
          const unpaidPayments = paymentsResponse.data.filter(
            (payment) =>
              payment.status === "unpaid" ||
              payment.status === "chua thanh toan"
          );

          if (unpaidPayments.length > 0) {
            constraints.push("khoản thanh toán chưa hoàn tất");
          }
        }
      } catch (paymentError) {
        console.warn("Không thể kiểm tra ràng buộc thanh toán:", paymentError);
        hasAnyError = true;
      }

      // Xử lý dựa trên kết quả kiểm tra
      if (constraints.length > 0) {
        // Có ràng buộc - thông báo và không cho phép xóa
        const constraintMessage = constraints.join(", ");
        alert(`Không thể xóa! Sinh viên này đang có ${constraintMessage}`);
        return; // Dừng hàm, không tiếp tục xóa
      } else if (hasAnyError) {
        // Có lỗi khi kiểm tra ràng buộc - cho phép xóa nhưng cảnh báo
        const confirmDelete = window.confirm(
          "Không thể kiểm tra đầy đủ ràng buộc. Bạn vẫn muốn tiếp tục xóa sinh viên này?"
        );
        if (confirmDelete) {
          onDelete(userId);
        }
      } else {
        // Không có ràng buộc - cho phép xóa bình thường
        const confirmDelete = window.confirm(
          "Bạn có chắc chắn muốn xóa sinh viên này?"
        );
        if (confirmDelete) {
          onDelete(userId);
        }
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra ràng buộc:", error);

      // Vẫn cho phép xóa, nhưng cảnh báo người dùng
      const confirmDelete = window.confirm(
        "Không thể kiểm tra ràng buộc. Bạn vẫn muốn tiếp tục xóa sinh viên này?"
      );
      if (confirmDelete) {
        onDelete(userId);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Header của bảng */}
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tên
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              SĐT
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Vai trò
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Tác vụ
            </th>
          </tr>
        </thead>

        {/* Body của bảng */}
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            // Hiển thị khi không có dữ liệu
            <tr>
              <td
                colSpan="6"
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                Không có dữ liệu sinh viên
              </td>
            </tr>
          ) : (
            // Map qua danh sách users để hiển thị
            users.map((user) => (
              <tr key={user.id_users}>
                {/* Cột ID */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id_users}
                </td>

                {/* Cột Tên - có thể click để xem chi tiết */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => onViewDetails(user)}
                  >
                    {user.name}
                  </div>
                </td>

                {/* Cột Email */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>

                {/* Cột Số điện thoại */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>

                {/* Cột Vai trò - hiển thị với màu khác nhau */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === "Admin"
                        ? "bg-purple-100 text-purple-800" // Màu cho Admin
                        : "bg-green-100 text-green-800" // Màu cho User
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Cột Tác vụ - chứa các nút chức năng */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Nút xem chi tiết */}
                  <button
                    onClick={() => onViewDetails(user)}
                    className="text-blue-600 hover:text-blue-900 mx-1"
                    title="Xem chi tiết"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>

                  {/* Nút chỉnh sửa */}
                  <button
                    onClick={() => onEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mx-1"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>

                  {/* Nút xóa - đã được cập nhật để sử dụng hàm kiểm tra ràng buộc */}
                  <button
                    onClick={() => handleDelete(user.id_users)}
                    className={`text-red-600 hover:text-red-900 mx-1 ${
                      isDeleting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    title="Xóa"
                    disabled={isDeleting}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
