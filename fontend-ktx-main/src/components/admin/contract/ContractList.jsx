import React, { useState, useMemo } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPrint,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { format, differenceInMonths } from "date-fns";
import { vi } from "date-fns/locale";

const ContractList = ({
  contracts = [],
  rooms = [],
  users = [],
  payments = [],
  services = [],
  onView,
  onEdit,
  onDelete,
  onPrint,
}) => {
  // State for sorting
  const [sortConfig, setSortConfig] = useState({
    key: "id_contracts",
    direction: "ascending",
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Get room and user information
  const getRoom = (roomId) => rooms.find((r) => r.id_rooms === roomId) || {};
  const getUser = (userId) => users.find((u) => u.id_users === userId) || {};

  // Calculate contract status based on dates
  const calculateStatus = (contract) => {
    if (!contract.start_date || !contract.end_date) return "pending";

    const today = new Date();
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);

    if (today < startDate) return "pending";
    if (today > endDate) return "expired";
    return "active";
  };

  // Calculate payment status based on payments
  const getPaymentStatus = (contractId) => {
    const contractPayments = payments.filter(
      (p) => p.id_contracts === contractId
    );

    if (contractPayments.length === 0) return "unpaid";

    const hasUnpaidPayments = contractPayments.some(
      (p) => p.status === "chua thanh toan"
    );
    return hasUnpaidPayments ? "partially_paid" : "paid";
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const sortedContracts = useMemo(() => {
    const sortableContracts = [...contracts];

    sortableContracts.sort((a, b) => {
      let aValue, bValue;

      // Determine values to compare based on sort key
      switch (sortConfig.key) {
        case "student":
          aValue = getUser(a.id_users)?.name || "";
          bValue = getUser(b.id_users)?.name || "";
          break;
        case "room":
          aValue = getRoom(a.id_rooms)?.number || "";
          bValue = getRoom(b.id_rooms)?.number || "";
          break;
        case "start_date":
        case "end_date":
          aValue = new Date(a[sortConfig.key] || 0).getTime();
          bValue = new Date(b[sortConfig.key] || 0).getTime();
          break;
        case "status":
          aValue = calculateStatus(a);
          bValue = calculateStatus(b);
          break;
        default:
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
      }

      // Compare the values
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    return sortableContracts;
  }, [contracts, sortConfig, rooms, users]);

  // Get current page data
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedContracts, currentPage]);

  // Total pages
  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);

  // Render sort icon
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FaSort className="ml-1 text-gray-400" />;
    }
    return sortConfig.direction === "ascending" ? (
      <FaSortUp className="ml-1 text-blue-500" />
    ) : (
      <FaSortDown className="ml-1 text-blue-500" />
    );
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    let bgColor = "bg-gray-100 text-gray-800";
    let text = "Không xác định";

    switch (status) {
      case "active":
        bgColor = "bg-green-100 text-green-800";
        text = "Đang hiệu lực";
        break;
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        text = "Chờ xử lý";
        break;
      case "expired":
        bgColor = "bg-red-100 text-red-800";
        text = "Hết hạn";
        break;
    }

    return (
      <span className={`${bgColor} px-1.5 py-0.5 rounded-md text-xs`}>
        {text}
      </span>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("id_contracts")}
              >
                <div className="flex items-center">
                  Mã HD {renderSortIcon("id_contracts")}
                </div>
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("student")}
              >
                <div className="flex items-center">
                  Sinh viên {renderSortIcon("student")}
                </div>
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("room")}
              >
                <div className="flex items-center">
                  Phòng {renderSortIcon("room")}
                </div>
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("start_date")}
              >
                <div className="flex items-center">
                  Thời gian {renderSortIcon("start_date")}
                </div>
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort("status")}
              >
                <div className="flex items-center">
                  Trạng thái {renderSortIcon("status")}
                </div>
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedContracts.map((contract) => {
              const room = getRoom(contract.id_rooms);
              const user = getUser(contract.id_users);
              const status = calculateStatus(contract);
              const duration = differenceInMonths(
                new Date(contract.end_date || Date.now()),
                new Date(contract.start_date || Date.now())
              );

              return (
                <tr key={contract.id_contracts} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs font-medium text-gray-900">
                      {contract.id_contracts}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-900">
                      {user?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.student_id || user?.email || ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-900">
                      P.{room?.number || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {room?.type || ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-900">
                      {formatDate(contract.start_date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      đến {formatDate(contract.end_date)} ({duration} tháng)
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {renderStatusBadge(status)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-1.5">
                      <button
                        onClick={() => onView(contract)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Xem chi tiết"
                      >
                        <FaEye className="text-xs" />
                      </button>
                      <button
                        onClick={() => onEdit(contract)}
                        className="text-yellow-600 hover:text-yellow-900 p-1"
                        title="Chỉnh sửa"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      {onPrint && (
                        <button
                          onClick={() => onPrint(contract)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="In hợp đồng"
                        >
                          <FaPrint className="text-xs" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(contract)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Xóa"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedContracts.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-3 py-4 text-center text-gray-500 text-xs"
                >
                  Không tìm thấy hợp đồng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Simplified pagination */}
      {totalPages > 1 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded-md text-xs ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700"
              }`}
            >
              Trước
            </button>
            <span className="self-center mx-2 text-xs">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-md text-xs ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700"
              }`}
            >
              Sau
            </button>
          </div>

          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-gray-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                -
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedContracts.length)}
                </span>{" "}
                /<span className="font-medium">{sortedContracts.length}</span>
              </p>
            </div>

            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-2 py-1 rounded-l-md border text-xs ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700"
                  }`}
                >
                  &laquo;
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border text-xs ${
                        pageNum === currentPage
                          ? "bg-blue-50 text-blue-600 border-blue-500"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 rounded-r-md border text-xs ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700"
                  }`}
                >
                  &raquo;
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractList;
