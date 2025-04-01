import React from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPrint,
  FaFileContract,
} from "react-icons/fa";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ContractCard = ({
  contract,
  room,
  user,
  payments = [],
  services = [],
  onView,
  onEdit,
  onDelete,
  onPrint,
}) => {
  // Xử lý trường hợp không tìm thấy phòng hoặc user
  const roomNumber = room ? room.number : "N/A";
  const roomType = room ? room.type : "N/A";
  const userName = user ? `${user.name || "N/A"}` : "N/A";

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      console.error("Date format error:", error);
      return dateString;
    }
  };

  // Tính toán trạng thái hợp đồng dựa trên ngày bắt đầu và kết thúc
  const calculateStatus = () => {
    if (!contract.start_date || !contract.end_date) return "pending";

    const today = new Date();
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);

    if (today < startDate) return "pending";
    if (today > endDate) return "expired";
    return "active";
  };

  const contractStatus = calculateStatus();

  // Kiểm tra tình trạng thanh toán
  const getPaymentStatus = () => {
    // Lọc các khoản thanh toán thuộc về hợp đồng này
    const contractPayments = payments.filter(
      (payment) => payment.id_contracts === contract.id_contracts
    );

    if (contractPayments.length === 0) return "unpaid";

    // Kiểm tra xem có khoản thanh toán nào chưa thanh toán không
    const hasUnpaidPayments = contractPayments.some(
      (payment) => payment.status === "chua thanh toan"
    );

    return hasUnpaidPayments ? "partially_paid" : "paid";
  };

  const paymentStatus = getPaymentStatus();

  // Tính tổng số tiền đã thanh toán
  const calculateTotalPaid = () => {
    return payments
      .filter(
        (payment) =>
          payment.id_contracts === contract.id_contracts &&
          payment.status === "da thanh toan"
      )
      .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
  };

  // Lấy các dịch vụ của hợp đồng
  const contractServices = services.filter(
    (service) => service.id_contracts === contract.id_contracts
  );

  // Render status badge
  const renderStatusBadge = (status) => {
    let bgColor = "bg-gray-100 text-gray-800";

    switch (status) {
      case "active":
        bgColor = "bg-green-100 text-green-800";
        return (
          <span
            className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}
          >
            Đang hiệu lực
          </span>
        );
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        return (
          <span
            className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}
          >
            Chờ xử lý
          </span>
        );
      case "expired":
        bgColor = "bg-red-100 text-red-800";
        return (
          <span
            className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}
          >
            Hết hạn
          </span>
        );
      default:
        return (
          <span
            className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}
          >
            {status}
          </span>
        );
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tính giá phòng từ thông tin phòng
  const roomPrice = room ? room.price : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Card header with contract ID */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <FaFileContract className="mr-2" />
          <h3 className="font-bold">Hợp đồng #{contract.id_contracts}</h3>
        </div>
        {renderStatusBadge(contractStatus)}
      </div>

      {/* Card content */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Sinh viên:</p>
          <p className="font-semibold">{userName}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Phòng:</p>
          <p className="font-semibold">
            Phòng {roomNumber} ({roomType})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu:</p>
            <p className="font-semibold">{formatDate(contract.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Ngày kết thúc:</p>
            <p className="font-semibold">{formatDate(contract.end_date)}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Giá thuê:</p>
          <p className="font-semibold text-green-600">
            {formatCurrency(roomPrice)}
          </p>
        </div>

        {/* Dịch vụ */}
        {contractServices.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">Dịch vụ đăng ký:</p>
            <div className="flex flex-wrap gap-1">
              {contractServices.map((service, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment status */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-1">Trạng thái thanh toán:</p>
          <div className="flex items-center justify-between">
            <span
              className={`
              ${
                paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : paymentStatus === "partially_paid"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              } 
              px-2 py-1 rounded-full text-xs font-medium`}
            >
              {paymentStatus === "paid"
                ? "Đã thanh toán"
                : paymentStatus === "partially_paid"
                ? "Thanh toán một phần"
                : "Chưa thanh toán"}
            </span>
            <span className="text-sm font-medium">
              {formatCurrency(calculateTotalPaid())}
            </span>
          </div>
        </div>
      </div>

      {/* Card footer with actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-3 flex justify-between">
        <button
          onClick={() => onView(contract)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Xem chi tiết"
        >
          <FaEye />
        </button>
        <button
          onClick={() => onEdit(contract)}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
          title="Chỉnh sửa"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onPrint && onPrint(contract)}
          className="text-green-600 hover:text-green-800 transition-colors"
          title="In hợp đồng"
        >
          <FaPrint />
        </button>
        <button
          onClick={() => onDelete(contract)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Xóa"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default ContractCard;
