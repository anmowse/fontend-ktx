import React, { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/outline";
import API_URL from "../../../config/api";
const UserDetails = ({ userId, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [userRooms, setUserRooms] = useState([]);
  const [userContracts, setUserContracts] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponses, setApiResponses] = useState({});

  useEffect(() => {
    // Function to fetch all user data
    const fetchAllUserData = async () => {
      setLoading(true);
      setError(null);
      const responses = {};

      try {
        // Fetch basic user info
        const userResponse = await axios.get(`${API_URL}/users/${userId}`);
        setUserData(userResponse.data);
        responses.user = userResponse.data;
        console.log("User data:", userResponse.data);

        // Fetch user rooms

        // Fetch user contracts
        try {
          const contractsResponse = await axios.get(
            `${API_URL}/users/${userId}/contracts`
          );
          console.log("Contracts data:", contractsResponse.data);
          responses.contracts = contractsResponse.data;

          setUserContracts(
            Array.isArray(contractsResponse.data) ? contractsResponse.data : []
          );
        } catch (contractsError) {
          console.error("Error fetching contracts:", contractsError);
          responses.contractsError = contractsError.message;
          setUserContracts([]);
        }

        // Fetch user payments
        try {
          const paymentsResponse = await axios.get(
            `${API_URL}/users/${userId}/payments`
          );
          console.log("Payments data:", paymentsResponse.data);
          responses.payments = paymentsResponse.data;

          setUserPayments(
            Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []
          );
        } catch (paymentsError) {
          console.error("Error fetching payments:", paymentsError);
          responses.paymentsError = paymentsError.message;
          setUserPayments([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        responses.mainError = err.message;
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
      } finally {
        setApiResponses(responses);
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllUserData();
    }
  }, [userId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Chi tiết người dùng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data found state
  if (!userData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Chi tiết người dùng
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Không tìm thấy thông tin người dùng
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render user details
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto overflow-y-auto max-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">Chi tiết người dùng</h2>
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* User Information */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              Thông tin cơ bản
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Họ và tên</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userData.name || "N/A"}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userData.email || "N/A"}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Số điện thoại
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {userData.phone || "N/A"}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      userData.role === "Admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {userData.role || "User"}
                  </span>
                </dd>
              </div>
              {userData.address && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userData.address}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Contract Information - Updated for the new data structure */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              Thông tin hợp đồng
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {userContracts.length > 0 ? (
              <div className="overflow-hidden">
                {userContracts.map((contract, index) => (
                  <div key={index} className="divide-y divide-gray-200">
                    <dl>
                      {contract.name && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Tên sinh viên
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {contract.name}
                          </dd>
                        </div>
                      )}
                      {contract.phone && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Số điện thoại
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {contract.phone}
                          </dd>
                        </div>
                      )}
                      {contract.number && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Số phòng
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {contract.number}
                          </dd>
                        </div>
                      )}
                      {contract.start_date && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Ngày bắt đầu
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatDate(contract.start_date)}
                          </dd>
                        </div>
                      )}
                      {contract.end_date && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Ngày kết thúc
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatDate(contract.end_date)}
                          </dd>
                        </div>
                      )}
                      {contract.amount && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Số tiền
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatCurrency(contract.amount)}
                          </dd>
                        </div>
                      )}
                      {contract.status && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Trạng thái thanh toán
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                contract.status === "da thanh toan"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {contract.status === "da thanh toan"
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </span>
                          </dd>
                        </div>
                      )}
                      {contract.due_date && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Hạn thanh toán
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {formatDate(contract.due_date)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5 text-center text-gray-500">
                Không có thông tin hợp đồng
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              Lịch sử thanh toán
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {userPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Mã thanh toán
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Số tiền
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ngày hạn
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userPayments.map((payment, index) => (
                      <tr key={payment.id_payments || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.id_payments || index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              payment.status === "da thanh toan" ||
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status === "da thanh toan" ||
                            payment.status === "paid"
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-4 py-5 text-center text-gray-500">
                Không có thông tin thanh toán
              </div>  
            )}
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default UserDetails;
