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
  const [addingDetail, setAddingDetail] = useState(false);
  const [newDetail, setNewDetail] = useState({
    typePay: "tien mat",
    amountPay: "",
  });

  useEffect(() => {
    fetchPaymentData();
    // eslint-disable-next-line
  }, [id]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Lấy payment
      const paymentRes = await axios.get(
        `http://127.0.0.1:8000/api/payments/${id}`,
        { headers }
      );
      setPayment(paymentRes.data);

      // Lấy payment details
      const detailsRes = await axios.get(
        `http://127.0.0.1:8000/api/payment-details?payment_id=${id}`,
        { headers }
      );
      setPaymentDetails(detailsRes.data);

      // Lấy contract
      const contractRes = await axios.get(
        `http://127.0.0.1:8000/api/contracts/${paymentRes.data.id_contracts}`,
        { headers }
      );
      setContractInfo(contractRes.data);

      // Lấy user
      const userRes = await axios.get(
        `http://127.0.0.1:8000/api/users/${contractRes.data.id_users}`,
        { headers }
      );
      setUserInfo(userRes.data);

      // Lấy room
      const roomRes = await axios.get(
        `http://127.0.0.1:8000/api/rooms/${contractRes.data.id_rooms}`,
        { headers }
      );
      setRoomInfo(roomRes.data);

      setLoading(false);
    } catch (error) {
      toast.error("Không thể tải thông tin thanh toán.");
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setNewDetail((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDetail = async (e) => {
    e.preventDefault();
    if (!newDetail.amountPay || Number(newDetail.amountPay) <= 0) {
      toast.warning("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    setAddingDetail(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        "http://127.0.0.1:8000/api/payment-details",
        {
          id_payments: id,
          typePay: newDetail.typePay,
          amountPay: newDetail.amountPay,
        },
        { headers }
      );
      toast.success("Thêm chi tiết thanh toán thành công!");
      setNewDetail({ typePay: "tien mat", amountPay: "" });
      fetchPaymentData();
    } catch (error) {
      toast.error("Không thể thêm chi tiết thanh toán.");
    } finally {
      setAddingDetail(false);
    }
  };

  const handleDeletePayment = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa khoản thanh toán này? Tất cả chi tiết thanh toán liên quan cũng sẽ bị xóa!"
      )
    ) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Xóa từng payment_details liên quan trước
      for (const detail of paymentDetails) {
        await axios.delete(
          `http://127.0.0.1:8000/api/payment-details/${detail.id_details}`,
          { headers }
        );
      }

      // Xóa payment
      await axios.delete(`http://127.0.0.1:8000/api/payments/${id}`, {
        headers,
      });

      toast.success("Đã xóa khoản thanh toán thành công!");
      navigate("/payments");
    } catch (error) {
      toast.error(
        "Không thể xóa khoản thanh toán. Hãy chắc chắn đã xóa hết các dữ liệu liên quan."
      );
    }
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
        <div className="flex gap-2">
          <Link
            to="/payments"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Quay lại danh sách
          </Link>
          <button
            onClick={handleDeletePayment}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Xóa thanh toán
          </button>
        </div>
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
          </div>

          {/* Lịch sử chi tiết thanh toán */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">
              Lịch sử chi tiết thanh toán
            </h3>
            {paymentDetails.filter(
              (d) => String(d.id_payments) === String(payment.id_payments)
            ).length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Mã chi tiết
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Phương thức
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentDetails
                    .filter(
                      (d) =>
                        String(d.id_payments) === String(payment.id_payments)
                    )
                    .map((detail) => (
                      <tr key={detail.id_details}>
                        <td className="px-4 py-2">{detail.id_details}</td>
                        <td className="px-4 py-2">
                          {detail.typePay === "tien mat"
                            ? "Tiền mặt"
                            : detail.typePay === "momo"
                            ? "MoMo"
                            : "Tài khoản ngân hàng"}
                        </td>
                        <td className="px-4 py-2">
                          {formatCurrency(detail.amountPay)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">
                Chưa có chi tiết thanh toán nào.
              </p>
            )}
          </div>

          {/* Thêm chi tiết thanh toán mới */}
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Thêm chi tiết thanh toán</h4>
            <form
              onSubmit={handleAddDetail}
              className="flex flex-col md:flex-row gap-2 items-end"
            >
              <select
                name="typePay"
                value={newDetail.typePay}
                onChange={handleDetailChange}
                className="border rounded px-3 py-2"
              >
                <option value="tien mat">Tiền mặt</option>
                <option value="momo">MoMo</option>
                <option value="tai khoan ngan hang">Tài khoản ngân hàng</option>
              </select>
              <input
                type="number"
                name="amountPay"
                value={newDetail.amountPay}
                onChange={handleDetailChange}
                placeholder="Số tiền"
                className="border rounded px-3 py-2"
                min={0}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={addingDetail}
              >
                {addingDetail ? "Đang thêm..." : "Thêm"}
              </button>
            </form>
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
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;
