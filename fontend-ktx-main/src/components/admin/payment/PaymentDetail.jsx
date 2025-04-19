import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [contractInfo, setContractInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPaymentDetail, setNewPaymentDetail] = useState({
    typePay: "tien mat",
    amountPay: "",
  });

  useEffect(() => {
    fetchPaymentData();
  }, [id]);

  const fetchPaymentData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Lấy thông tin thanh toán
      const paymentResponse = await axios.get(
        `http://127.0.0.1:8000/api/payments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (paymentResponse.data) {
        setPayment(paymentResponse.data);

        // Lấy chi tiết thanh toán
        const detailsResponse = await axios.get(
          `http://127.0.0.1:8000/api/payment-details?payment_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (detailsResponse.data) {
          setPaymentDetails(detailsResponse.data);
        }

        // Lấy thông tin hợp đồng
        const contractResponse = await axios.get(
          `http://127.0.0.1:8000/api/contracts/${paymentResponse.data.id_contracts}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (contractResponse.data) {
          setContractInfo(contractResponse.data);

          // Lấy thông tin người dùng
          const userResponse = await axios.get(
            `http://127.0.0.1:8000/api/users/${contractResponse.data.id_users}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userResponse.data) {
            setUserInfo(userResponse.data);
          }

          // Lấy thông tin phòng
          const roomResponse = await axios.get(
            `http://127.0.0.1:8000/api/rooms/${contractResponse.data.id_rooms}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (roomResponse.data) {
            setRoomInfo(roomResponse.data);
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu thanh toán:", error);
      toast.error("Không thể tải thông tin thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPaymentDetail({
      ...newPaymentDetail,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !newPaymentDetail.amountPay ||
      parseFloat(newPaymentDetail.amountPay) <= 0
    ) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://127.0.0.1:8000/api/payment-details",
        {
          id_payments: id,
          typePay: newPaymentDetail.typePay,
          amountPay: newPaymentDetail.amountPay,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật trạng thái thanh toán nếu tổng số tiền đã thanh toán đủ
      const totalPaid =
        paymentDetails.reduce(
          (sum, detail) => sum + parseFloat(detail.amountPay),
          0
        ) + parseFloat(newPaymentDetail.amountPay);

      if (totalPaid >= payment.amount && payment.status === "chua thanh toan") {
        await axios.put(
          `http://127.0.0.1:8000/api/payments/${id}`,
          { status: "da thanh toan" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      toast.success("Đã thêm chi tiết thanh toán thành công!");

      // Reset form và cập nhật dữ liệu
      setNewPaymentDetail({
        typePay: "tien mat",
        amountPay: "",
      });

      fetchPaymentData();
    } catch (error) {
      console.error("Lỗi khi thêm chi tiết thanh toán:", error);
      toast.error("Không thể thêm chi tiết thanh toán. Vui lòng thử lại sau.");
    }
  };

  const handleUpdateStatus = async (newStatus) => {
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
      fetchPaymentData();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại sau.");
    }
  };

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

  const calculateTotalPaid = () => {
    return paymentDetails.reduce(
      (sum, detail) => sum + parseFloat(detail.amountPay),
      0
    );
  };

  const calculateRemainingAmount = () => {
    if (!payment) return 0;
    const totalPaid = calculateTotalPaid();
    return Math.max(0, payment.amount - totalPaid);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Không tìm thấy thông tin thanh toán
          </h2>
          <p className="mb-4">
            Không thể tìm thấy thông tin thanh toán với ID: {id}
          </p>
          <Link
            to="/payments"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Quay lại danh sách thanh toán
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Chi tiết thanh toán #{payment.id_payments}
        </h1>
        <Link
          to="/payments"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin thanh toán */}
        <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Thông tin thanh toán
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 mb-1">Mã thanh toán:</p>
              <p className="font-medium">{payment.id_payments}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Mã hợp đồng:</p>
              <p className="font-medium">{payment.id_contracts}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Tổng số tiền:</p>
              <p className="font-medium">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Hạn thanh toán:</p>
              <p className="font-medium">{formatDate(payment.due_date)}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Trạng thái:</p>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  payment.status === "da thanh toan"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {payment.status === "da thanh toan"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </span>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Số tiền đã thanh toán:</p>
              <p className="font-medium">
                {formatCurrency(calculateTotalPaid())}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Số tiền còn lại:</p>
              <p className="font-medium">
                {formatCurrency(calculateRemainingAmount())}
              </p>
            </div>
          </div>

          <div className="mt-6 flex space-x-2">
            {payment.status === "chua thanh toan" ? (
              <button
                onClick={() => handleUpdateStatus("da thanh toan")}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Đánh dấu đã thanh toán
              </button>
            ) : (
              <button
                onClick={() => handleUpdateStatus("chua thanh toan")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Đánh dấu chưa thanh toán
              </button>
            )}
          </div>
        </div>

        {/* Thông tin hợp đồng và sinh viên */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Thông tin liên quan
          </h2>

          {userInfo && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">
                Thông tin sinh viên
              </h3>
              <p>
                <span className="text-gray-600">Họ tên:</span> {userInfo.name}
              </p>
              <p>
                <span className="text-gray-600">Email:</span> {userInfo.email}
              </p>
              <p>
                <span className="text-gray-600">Số điện thoại:</span>{" "}
                {userInfo.phone}
              </p>
            </div>
          )}

          {roomInfo && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Thông tin phòng</h3>
              <p>
                <span className="text-gray-600">Phòng số:</span>{" "}
                {roomInfo.number}
              </p>
              <p>
                <span className="text-gray-600">Loại phòng:</span>{" "}
                {roomInfo.type}
              </p>
              <p>
                <span className="text-gray-600">Giá phòng:</span>{" "}
                {formatCurrency(roomInfo.price)}
              </p>
            </div>
          )}

          {contractInfo && (
            <div>
              <h3 className="font-bold text-gray-700 mb-2">
                Thông tin hợp đồng
              </h3>
              <p>
                <span className="text-gray-600">Ngày bắt đầu:</span>{" "}
                {formatDate(contractInfo.start_date)}
              </p>
              <p>
                <span className="text-gray-600">Ngày kết thúc:</span>{" "}
                {formatDate(contractInfo.end_date)}
              </p>
              <div className="mt-2">
                <Link
                  to={`/contracts/${contractInfo.id_contracts}`}
                  className="text-blue-500 hover:underline"
                >
                  Xem chi tiết hợp đồng
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lịch sử thanh toán */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Lịch sử thanh toán
        </h2>

        {paymentDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã giao dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phương thức thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentDetails.map((detail) => (
                  <tr key={detail.id_details} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.id_details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.typePay === "tien mat"
                        ? "Tiền mặt"
                        : detail.typePay === "momo"
                        ? "MoMo"
                        : "Tài khoản ngân hàng"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(detail.amountPay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detail.created_at
                        ? formatDate(detail.created_at)
                        : "Không có dữ liệu"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Chưa có giao dịch thanh toán nào.
          </p>
        )}
      </div>

      {/* Form thêm thanh toán mới */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          Thêm giao dịch thanh toán mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Phương thức thanh toán
              </label>
              <select
                name="typePay"
                value={newPaymentDetail.typePay}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="tien mat">Tiền mặt</option>
                <option value="momo">MoMo</option>
                <option value="tai khoan ngan hang">Tài khoản ngân hàng</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Số tiền</label>
              <input
                type="number"
                name="amountPay"
                value={newPaymentDetail.amountPay}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
                min="0"
                step="0.01"
                placeholder="Nhập số tiền"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={
                payment.status === "da thanh toan" &&
                calculateRemainingAmount() <= 0
              }
            >
              Thêm giao dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentDetail;
