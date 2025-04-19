import React, { useState } from "react";
import {
  FaEdit,
  FaPrint,
  FaTimes,
  FaUser,
  FaHome,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileContract,
  FaWifi,
  FaPlug,
} from "react-icons/fa";
import { format, differenceInMonths } from "date-fns";
import { vi } from "date-fns/locale";
import CreatePayment from "../payment/CreatePayment";

const ContractDetail = ({
  contract,
  room,
  user,
  payments = [],
  services = [],
  contractServices = [],
  buildings = [],
  onClose,
  onEdit,
  onPrint,
  onCreatePayment, // Thêm prop này nếu muốn xử lý tạo thanh toán ở component cha
}) => {
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
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

  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let bgColor = "bg-gray-100 text-gray-800";
    let statusText = "Không xác định";

    switch (status) {
      case "active":
        bgColor = "bg-green-100 text-green-800";
        statusText = "Đang hiệu lực";
        break;
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        statusText = "Chờ xử lý";
        break;
      case "expired":
        bgColor = "bg-red-100 text-red-800";
        statusText = "Hết hạn";
        break;
      default:
        statusText = status;
    }

    return (
      <span
        className={`${bgColor} px-1.5 py-0.5 rounded-full text-xs font-medium`}
      >
        {statusText}
      </span>
    );
  };

  // Tính số tháng giữa ngày bắt đầu và kết thúc
  const calculateDuration = () => {
    if (!contract.start_date || !contract.end_date) return "N/A";

    try {
      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);

      const months = differenceInMonths(endDate, startDate);
      return `${months} tháng`;
    } catch (error) {
      return "N/A";
    }
  };

  // Lọc thanh toán của hợp đồng này
  const contractPayments = payments.filter(
    (payment) => payment.id_contracts === contract.id_contracts
  );

  // Tính tổng tiền đã thanh toán
  const totalPaid = contractPayments
    .filter((payment) => payment.status === "da thanh toan")
    .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

  // Lấy các dịch vụ đăng ký của hợp đồng này
  const servicesForContract = contractServices
    .filter((cs) => cs.id_contracts === contract.id_contracts)
    .map((cs) => {
      const serviceInfo = services.find(
        (s) => s.id_services === cs.id_services
      );
      return {
        ...cs,
        name: serviceInfo?.name || "Không xác định",
        price: serviceInfo?.price || 0,
      };
    });

  // Tính giá phòng
  const roomPrice = room ? room.price : 0;

  // Lấy tên tòa nhà từ building_id của phòng
  const getBuildingName = () => {
    if (!room || !room.id_buildings) return "N/A";

    const building = buildings.find(
      (b) => b.id_buildings === room.id_buildings
    );
    console.log(building);
    return building ? building.nameBuild : "N/A";
  };

  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);

  const handlePaymentCreated = (newPayment) => {
    setIsCreatePaymentOpen(false);
    // Cập nhật danh sách thanh toán nếu cần
    // Thông báo cho component cha nếu cần
    if (onCreatePayment) {
      onCreatePayment(newPayment);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full max-w-3xl transform scale-95 origin-top">
      {/* Header - Giảm padding */}
      <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
        <div className="flex items-center">
          <FaFileContract className="text-xl mr-2" />
          <div>
            <h2 className="text-base font-bold">
              Hợp đồng #{contract.id_contracts}
            </h2>
            <p className="text-blue-100 text-xs">
              Ngày tạo: {formatDate(contract.created_at || contract.start_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {renderStatusBadge(contractStatus)}
          <button
            onClick={onClose}
            className="ml-3 text-white p-1.5 rounded-full hover:bg-blue-500 transition-colors"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>

      {/* Content - Giảm padding và gap */}
      <div className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Left column */}
          <div>
            {/* Student Information - Thu gọn */}
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-2 flex items-center text-gray-700">
                <FaUser className="mr-1.5 text-sm" />
                Thông tin sinh viên
              </h3>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div>
                    <p className="text-xs text-gray-500">Họ và tên:</p>
                    <p className="font-medium">{user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mã SV:</p>
                    <p className="font-medium">{user?.id_users || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email:</p>
                    <p className="font-medium truncate">
                      {user?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Điện thoại:</p>
                    <p className="font-medium">{user?.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Information - Sửa phần hiển thị tên tòa nhà */}
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-2 flex items-center text-gray-700">
                <FaHome className="mr-1.5 text-sm" />
                Thông tin phòng
              </h3>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div>
                    <p className="text-xs text-gray-500">Số phòng:</p>
                    <p className="font-medium">{room?.number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tòa nhà:</p>
                    <p className="font-medium">{getBuildingName()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Loại phòng:</p>
                    <p className="font-medium">{room?.type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Giá phòng:</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(roomPrice)}/tháng
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Contract Details - Thu gọn */}
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-2 flex items-center text-gray-700">
                <FaCalendarAlt className="mr-1.5 text-sm" />
                Chi tiết hợp đồng
              </h3>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                <div className="mb-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Thời gian:</span>
                    <span className="font-medium">
                      {formatDate(contract.start_date)} -{" "}
                      {formatDate(contract.end_date)} ({calculateDuration()})
                    </span>
                  </div>
                </div>

                {/* Dịch vụ đăng ký - Gọn hơn */}
                <div className="mb-2">
                  <p className="text-xs text-gray-500">Dịch vụ đăng ký:</p>
                  {servicesForContract.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {servicesForContract.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs"
                        >
                          {service.name.includes("Internet") && (
                            <FaWifi className="mr-1 text-xs text-blue-500" />
                          )}
                          {service.name.includes("Dien") && (
                            <FaPlug className="mr-1 text-xs text-yellow-500" />
                          )}
                          {service.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">
                      Không có dịch vụ đăng ký
                    </p>
                  )}
                </div>

                <div className="mt-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">
                      Đã thanh toán:
                    </span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History - Thu gọn */}
            <div>
              <h3 className="text-base font-semibold mb-2 flex items-center text-gray-700">
                <FaMoneyBillWave className="mr-1.5 text-sm" />
                Lịch sử thanh toán
              </h3>
              {contractPayments.length > 0 ? (
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-sm">
                  <div className="overflow-x-auto max-h-28">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày
                          </th>
                          <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số tiền
                          </th>
                          <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {contractPayments.map((payment, index) => (
                          <tr key={index}>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-500">
                              {formatDate(payment.due_date)}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-right text-gray-900 font-medium">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-xs text-center">
                              <span
                                className={`inline-block w-2 h-2 rounded-full ${
                                  payment.status === "da thanh toan"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                                title={
                                  payment.status === "da thanh toan"
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"
                                }
                              ></span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 text-center text-xs text-gray-500">
                  Chưa có lịch sử thanh toán
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with actions - Thu gọn */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex justify-end space-x-2">
        <button
          onClick={() => setIsCreatePaymentOpen(true)}
          className="flex items-center px-2.5 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          <FaMoneyBillWave className="mr-1" /> Tạo khoản thanh toán
        </button>
        <button
          onClick={() => onPrint && onPrint(contract)}
          className="flex items-center px-2.5 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          <FaPrint className="mr-1" /> In
        </button>
        <button
          onClick={() => onEdit(contract)}
          className="flex items-center px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <FaEdit className="mr-1" /> Sửa
        </button>
      </div>

      {/* Modal tạo khoản thanh toán */}
      {isCreatePaymentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tạo khoản thanh toán mới</h2>
              <button
                onClick={() => setIsCreatePaymentOpen(false)}
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
            <CreatePayment
              contractId={contract.id_contracts}
              onSuccess={handlePaymentCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
