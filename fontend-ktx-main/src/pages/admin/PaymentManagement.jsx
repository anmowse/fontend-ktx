import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CreatePayment from "../../components/admin/payment/CreatePayment";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thanh toán:", error);
      toast.error("Không thể tải dữ liệu thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://127.0.0.1:8000/api/payments/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Cập nhật trạng thái thanh toán thành công!");
      fetchPayments(); // Cập nhật lại danh sách thanh toán
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePaymentCreated = (newPayment) => {
    setIsAddModalOpen(false);
    fetchPayments();
  };

  // Lọc và sắp xếp thanh toán
  const filteredPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.id_payments.toString().includes(searchTerm) ||
        payment.id_contracts.toString().includes(searchTerm) ||
        payment.amount.toString().includes(searchTerm);

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "paid" && payment.status === "da thanh toan") ||
        (filterStatus === "unpaid" && payment.status === "chua thanh toan");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id_payments") {
        comparison = a.id_payments - b.id_payments;
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "due_date") {
        comparison = new Date(a.due_date) - new Date(b.due_date);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Quản lý thanh toán
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between">
          <div className="mb-2 md:mb-0">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border rounded px-3 py-2 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Tạo khoản thanh toán
            </button>
            <button
              onClick={() => fetchPayments()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id_payments")}
                  >
                    Mã thanh toán
                    {sortBy === "id_payments" && (
                      <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã hợp đồng
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("amount")}
                  >
                    Số tiền
                    {sortBy === "amount" && (
                      <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("due_date")}
                  >
                    Hạn thanh toán
                    {sortBy === "due_date" && (
                      <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id_payments} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.id_payments}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.id_contracts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        <div className="flex space-x-2">
                          <Link
                            to={`/payments/${payment.id_payments}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Chi tiết
                          </Link>
                          {payment.status === "chua thanh toan" ? (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  payment.id_payments,
                                  "da thanh toan"
                                )
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              Đánh dấu đã thanh toán
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  payment.id_payments,
                                  "chua thanh toan"
                                )
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Đánh dấu chưa thanh toán
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Không tìm thấy dữ liệu thanh toán nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo khoản thanh toán mới</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <CreatePayment onSuccess={handlePaymentCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
