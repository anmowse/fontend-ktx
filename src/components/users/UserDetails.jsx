import React, { useState, useEffect } from "react";
import { XMarkIcon as XIcon } from "@heroicons/react/24/outline";
import userService from "../../services/userService";

const UserDetails = ({ userId, onClose }) => {
  // State quản lý dữ liệu chi tiết user
  const [userDetails, setUserDetails] = useState(null);

  // State quản lý dữ liệu phòng của user
  const [userRooms, setUserRooms] = useState([]);

  // State quản lý dữ liệu hợp đồng của user
  const [userContracts, setUserContracts] = useState([]);

  // State quản lý dữ liệu thanh toán của user
  const [userPayments, setUserPayments] = useState([]);

  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  // State quản lý lỗi
  const [error, setError] = useState(null);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Hàm fetch dữ liệu user từ API
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Lấy thông tin chi tiết user
      const details = await userService.getUserDetails(userId);
      setUserDetails(details);

      // Lấy thông tin phòng của user
      const rooms = await userService.getUserRooms(userId);
      setUserRooms(rooms);

      // Lấy thông tin hợp đồng của user
      const contracts = await userService.getUserContracts(userId);
      setUserContracts(contracts);

      // Lấy thông tin thanh toán của user
      const payments = await userService.getUserPayments(userId);
      setUserPayments(payments);

      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Không thể tải thông tin chi tiết. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Format date để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Không tìm thấy thông tin sinh viên
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header với nút đóng */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Thông tin chi tiết sinh viên
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Phần thông tin cơ bản */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thông tin cơ bản
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails.name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails.email}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Số điện thoại
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails.phone}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    userDetails.role === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {userDetails.role}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Phần thông tin phòng */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thông tin phòng
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {userRooms && userRooms.length > 0 ? (
            <div className="overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tòa nhà
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Loại phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Giá
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userRooms.map((room, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.building_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.type || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.price
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(room.price)
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-sm text-gray-500">
              Sinh viên chưa được phân phòng.
            </div>
          )}
        </div>
      </div>

      {/* Phần thông tin hợp đồng */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thông tin hợp đồng
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {userContracts && userContracts.length > 0 ? (
            <div className="overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày bắt đầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày kết thúc
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userContracts.map((contract, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.id_contracts || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contract.room_number || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contract.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(contract.end_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-sm text-gray-500">
              Sinh viên chưa có hợp đồng nào.
            </div>
          )}
        </div>
      </div>

      {/* Phần thông tin thanh toán */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Thông tin thanh toán
          </h3>
        </div>
        <div className="border-t border-gray-200">
          {userPayments && userPayments.length > 0 ? (
            <div className="overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ngày đến hạn
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userPayments.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.id_payments || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.amount
                          ? new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(payment.amount)
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === "da thanh toan"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status === "da thanh toan"
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.due_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-sm text-gray-500">
              Sinh viên chưa có khoản thanh toán nào.
            </div>
          )}
        </div>
      </div>

      {/* Nút đóng */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default UserDetails;
