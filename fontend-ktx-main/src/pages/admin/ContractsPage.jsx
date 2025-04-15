import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// Xử lý cập nhật hợp đồng
const handleUpdateContract = async (contractData) => {
  try {
    const id = contractData.id_contracts;

    // Loại bỏ id_contracts từ dữ liệu gửi đi để tránh lỗi
    const { id_contracts, ...dataToUpdate } = contractData;

    // Chỉ gửi các trường cần thiết
    const cleanData = {
      id_users: dataToUpdate.id_users,
      id_rooms: dataToUpdate.id_rooms,
      start_date: dataToUpdate.start_date,
      end_date: dataToUpdate.end_date,
    };

    await contractService.updateContract(id, cleanData);

    fetchAllData(); // Refresh data
    setShowContractForm(false);
    setEditingContract(null);
    toast.success("Cập nhật hợp đồng thành công!");
  } catch (error) {
    console.error("Error updating contract:", error);
    toast.error(
      "Lỗi khi cập nhật hợp đồng: " +
        (error.response?.data?.message || error.message)
    );
  }
};

const ContractsPage = () => {
  // State cho dữ liệu
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [buildings, setBuildings] = useState([]);

  // State cho bộ lọc và kết quả
  const [filters, setFilters] = useState({
    status: "all",
    room: "all",
    building: "all",
    user: "all",
    dateFrom: "",
    dateTo: "",
    searchTerm: "",
    paymentStatus: "all",
  });
  const [filteredContracts, setFilteredContracts] = useState([]);

  // Fetch dữ liệu
  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply filters khi contracts hoặc filters thay đổi
  useEffect(() => {
    if (contracts.length > 0) {
      applyFilters();
    } else {
      setFilteredContracts([]);
    }
  }, [contracts, filters]);

  const fetchAllData = async () => {
    try {
      // ...existing code để fetch dữ liệu...

      // Sau khi fetch dữ liệu xong, áp dụng bộ lọc
      if (contracts.length > 0) {
        applyFilters();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi khi tải dữ liệu");
    }
  };

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    let result = [...contracts];

    // Lọc theo ID hợp đồng (searchTerm)
    if (filters.searchTerm) {
      result = result.filter((contract) =>
        String(contract.id_contracts).includes(filters.searchTerm)
      );
    }

    // Lọc theo trạng thái hợp đồng
    if (filters.status !== "all") {
      result = result.filter((contract) => {
        const status = calculateContractStatus(contract);
        return status === filters.status;
      });
    }

    // Lọc theo phòng
    if (filters.room !== "all") {
      result = result.filter(
        (contract) => contract.id_rooms === parseInt(filters.room)
      );
    }

    // Lọc theo tòa nhà
    if (filters.building !== "all") {
      const roomsInBuilding = rooms
        .filter((room) => room.id_buildings === parseInt(filters.building))
        .map((room) => room.id_rooms);

      result = result.filter((contract) =>
        roomsInBuilding.includes(contract.id_rooms)
      );
    }

    // Lọc theo sinh viên
    if (filters.user !== "all") {
      result = result.filter(
        (contract) => contract.id_users === parseInt(filters.user)
      );
    }

    // Lọc theo ngày bắt đầu
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter(
        (contract) => new Date(contract.start_date) >= fromDate
      );
    }

    // Lọc theo ngày kết thúc
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Đặt thời gian cuối ngày
      result = result.filter(
        (contract) => new Date(contract.end_date) <= toDate
      );
    }

    // Lọc theo trạng thái thanh toán
    if (filters.paymentStatus !== "all") {
      result = result.filter((contract) => {
        const paymentStatus = calculatePaymentStatus(contract.id_contracts);
        return paymentStatus === filters.paymentStatus;
      });
    }

    console.log(`Đã lọc: ${result.length}/${contracts.length} hợp đồng`);
    setFilteredContracts(result);
  };

  // Hàm tính trạng thái hợp đồng
  const calculateContractStatus = (contract) => {
    if (!contract.start_date || !contract.end_date) return "pending";

    const today = new Date();
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);

    if (today < startDate) return "pending";
    if (today > endDate) return "expired";
    return "active";
  };

  // Hàm tính trạng thái thanh toán
  const calculatePaymentStatus = (contractId) => {
    const contractPayments = payments.filter(
      (p) => p.id_contracts === contractId
    );

    if (contractPayments.length === 0) return "unpaid";

    const hasUnpaidPayments = contractPayments.some(
      (p) => p.status === "chua thanh toan"
    );
    return hasUnpaidPayments ? "partially_paid" : "paid";
  };

  // Hàm xử lý khi nhận filters từ ContractFilter
  const handleFilter = (newFilters) => {
    console.log("Áp dụng bộ lọc mới:", newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Quản lý hợp đồng
        </h1>
        {/* ...existing buttons... */}
      </div>

      {/* Component filter */}
      <ContractFilter
        rooms={rooms}
        users={users}
        buildings={buildings}
        onFilter={handleFilter}
        initialFilters={filters}
      />

      {/* Hiển thị thông tin về kết quả lọc */}
      <div className="mb-4 text-sm text-gray-600">
        Hiển thị {filteredContracts.length} trên tổng số {contracts.length} hợp
        đồng
        {filters.searchTerm && (
          <span> với từ khóa: "{filters.searchTerm}"</span>
        )}
      </div>

      {/* Sử dụng filteredContracts thay vì contracts */}
      <ContractList
        contracts={filteredContracts}
        rooms={rooms}
        users={users}
        payments={payments}
        services={services}
        onView={handleViewContract}
        onEdit={handleEditContract}
        onDelete={handleDeleteContract}
        onPrint={handlePrintContract}
      />
    </div>
  );
};

export default ContractsPage;
