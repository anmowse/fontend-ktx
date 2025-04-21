import React, { useState, useEffect } from "react";
import axios from "axios";
import ContractList from "../../components/admin/contract/ContractList";
import ContractForm from "../../components/admin/contract/ContractForm";
import ContractFilter from "../../components/admin/contract/ContractFilter";
import ContractDetail from "../../components/admin/contract/ContractDetail";
import ContractCard from "../../components/admin/contract/ContractCard";
import { FaPlus } from "react-icons/fa";
import API_URL from "../../config/api";
import { toast } from "react-toastify";

const ContractManagement = () => {
  // State cho dữ liệu
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [services, setServices] = useState([]);
  const [contractServices, setContractServices] = useState([]);
  const [buildings, setBuildings] = useState([]);

  // State cho UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("list"); // "list", "grid"
  const [showForm, setShowForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Khởi tạo filters với các giá trị mặc định
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

  // Fetch data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách hợp đồng
        const contractsRes = await axios.get(`${API_URL}/contracts`);
        setContracts(contractsRes.data);
        // Đặt filteredContracts ban đầu bằng contracts để hiển thị tất cả
        setFilteredContracts(contractsRes.data);

        // Lấy danh sách phòng
        const roomsRes = await axios.get(`${API_URL}/rooms`);
        setRooms(roomsRes.data);

        // Lấy danh sách người dùng
        const usersRes = await axios.get(`${API_URL}/users`);
        setUsers(usersRes.data);

        // Lấy thanh toán
        const paymentsRes = await axios.get(`${API_URL}/payments`);
        setPayments(paymentsRes.data);

        // Lấy dịch vụ
        const servicesRes = await axios.get(`${API_URL}/services`);
        setServices(servicesRes.data);

        // Lấy dịch vụ đăng ký cho hợp đồng
        const contractServicesRes = await axios.get(
          `${API_URL}/contract-service`
        );
        setContractServices(contractServicesRes.data);

        // Fetch buildings
        const buildingsRes = await axios.get(`${API_URL}/buildings`);
        setBuildings(buildingsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Xử lý lọc hợp đồng
  const handleFilter = (filterValues) => {
    console.log("Nhận bộ lọc mới:", filterValues);
    setFilters(filterValues);

    // Áp dụng bộ lọc ngay sau khi nhận giá trị mới
    const filtered = applyFiltersToContracts(contracts, filterValues);
    setFilteredContracts(filtered);
  };

  // Tách logic lọc thành hàm riêng để có thể tái sử dụng
  const applyFiltersToContracts = (contractsToFilter, currentFilters) => {
    return contractsToFilter.filter((contract) => {
      // Lọc theo từ khóa tìm kiếm (ID hợp đồng)
      if (
        currentFilters.searchTerm &&
        !String(contract.id_contracts).includes(currentFilters.searchTerm)
      ) {
        return false;
      }

      // Lọc theo trạng thái hợp đồng
      if (currentFilters.status !== "all") {
        const status = calculateContractStatus(contract);
        if (status !== currentFilters.status) {
          return false;
        }
      }

      // Lọc theo phòng
      if (
        currentFilters.room !== "all" &&
        contract.id_rooms !== parseInt(currentFilters.room)
      ) {
        return false;
      }

      // Lọc theo tòa nhà
      if (currentFilters.building !== "all") {
        const roomsInBuilding = rooms
          .filter(
            (room) => room.id_buildings === parseInt(currentFilters.building)
          )
          .map((room) => room.id_rooms);

        if (!roomsInBuilding.includes(contract.id_rooms)) {
          return false;
        }
      }

      // Lọc theo sinh viên
      if (
        currentFilters.user !== "all" &&
        contract.id_users !== parseInt(currentFilters.user)
      ) {
        return false;
      }

      // Lọc theo ngày bắt đầu
      if (currentFilters.dateFrom) {
        const fromDate = new Date(currentFilters.dateFrom);
        if (new Date(contract.start_date) < fromDate) {
          return false;
        }
      }

      // Lọc theo ngày kết thúc
      if (currentFilters.dateTo) {
        const toDate = new Date(currentFilters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Đặt thời gian cuối ngày
        if (new Date(contract.end_date) > toDate) {
          return false;
        }
      }

      // Lọc theo trạng thái thanh toán
      if (currentFilters.paymentStatus !== "all") {
        const paymentStatus = calculatePaymentStatus(contract.id_contracts);
        if (paymentStatus !== currentFilters.paymentStatus) {
          return false;
        }
      }

      // Nếu qua tất cả các điều kiện, trả về true
      return true;
    });
  };

  // Sử dụng hàm này để gọi khi cần
  const applyFilters = () => {
    const filtered = applyFiltersToContracts(contracts, filters);
    setFilteredContracts(filtered);
  };

  // Tính toán trạng thái hợp đồng
  const calculateContractStatus = (contract) => {
    if (!contract.start_date || !contract.end_date) return "pending";

    const today = new Date();
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);

    if (today < startDate) return "pending";
    if (today > endDate) return "expired";
    return "active";
  };

  // Tính toán trạng thái thanh toán
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

  // Xử lý thêm/sửa hợp đồng
  const handleSubmit = async (formData) => {
    try {
      if (selectedContract) {
        // Nếu phòng được thay đổi, cần cập nhật current_occupancy của cả phòng cũ và phòng mới
        const oldRoomId = selectedContract.id_rooms;
        const newRoomId = formData.id_rooms;

        // Cập nhật hợp đồng
        const response = await axios.put(
          `${API_URL}/contracts/${selectedContract.id_contracts}`,
          formData
        );

        // Nếu có thay đổi phòng
        if (oldRoomId !== newRoomId) {
          // Giảm current_occupancy của phòng cũ
          const oldRoom = rooms.find((r) => r.id_rooms === oldRoomId);
          if (oldRoom) {
            await axios.put(`${API_URL}/rooms/${oldRoomId}`, {
              ...oldRoom,
              current_occupancy: Math.max(0, oldRoom.current_occupancy - 1),
            });
          }

          // Tăng current_occupancy của phòng mới
          const newRoom = rooms.find((r) => r.id_rooms === newRoomId);
          if (newRoom) {
            await axios.put(`${API_URL}/rooms/${newRoomId}`, {
              ...newRoom,
              current_occupancy: newRoom.current_occupancy + 1,
            });
          }

          // Cập nhật state rooms
          const updatedRooms = rooms.map((room) => {
            if (room.id_rooms === oldRoomId) {
              return {
                ...room,
                current_occupancy: Math.max(0, room.current_occupancy - 1),
              };
            }
            if (room.id_rooms === newRoomId) {
              return { ...room, current_occupancy: room.current_occupancy + 1 };
            }
            return room;
          });
          setRooms(updatedRooms);
        }

        setContracts(
          contracts.map((c) =>
            c.id_contracts === selectedContract.id_contracts ? response.data : c
          )
        );

        toast.success("Cập nhật hợp đồng thành công!");
      } else {
        // Thêm hợp đồng mới
        const response = await axios.post(`${API_URL}/contracts`, formData);

        // Cập nhật current_occupancy của phòng được chọn
        const roomId = formData.id_rooms;
        const room = rooms.find((r) => r.id_rooms === roomId);

        if (room) {
          // Cập nhật trong database
          await axios.put(`${API_URL}/rooms/${roomId}`, {
            ...room,
            current_occupancy: room.current_occupancy + 1,
          });

          // Cập nhật state rooms
          const updatedRooms = rooms.map((r) =>
            r.id_rooms === roomId
              ? { ...r, current_occupancy: r.current_occupancy + 1 }
              : r
          );
          setRooms(updatedRooms);
        }

        setContracts([...contracts, response.data]);
        toast.success("Thêm hợp đồng mới thành công!");
      }

      // Kích hoạt sự kiện cập nhật dữ liệu
      window.dispatchEvent(new Event("contract-data-changed"));

      // Reset form và cập nhật UI
      setSelectedContract(null);
      setShowForm(false);
      applyFilters();
    } catch (error) {
      console.error("Error submitting contract:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi lưu hợp đồng");
    }
  };

  // Xử lý xóa hợp đồng
  const handleDelete = async (contract) => {
    if (window.confirm(`Bạn có chắc muốn xóa hợp đồng này?`)) {
      try {
        await axios.delete(`${API_URL}/contracts/${contract.id_contracts}`);

        // Giảm current_occupancy của phòng khi xóa hợp đồng
        const roomId = contract.id_rooms;
        const room = rooms.find((r) => r.id_rooms === roomId);

        if (room) {
          // Cập nhật trong database
          await axios.put(`${API_URL}/rooms/${roomId}`, {
            ...room,
            current_occupancy: Math.max(0, room.current_occupancy - 1),
          });

          // Cập nhật state rooms
          const updatedRooms = rooms.map((r) =>
            r.id_rooms === roomId
              ? {
                  ...r,
                  current_occupancy: Math.max(0, r.current_occupancy - 1),
                }
              : r
          );
          setRooms(updatedRooms);
        }

        setContracts(
          contracts.filter((c) => c.id_contracts !== contract.id_contracts)
        );

        toast.success("Xóa hợp đồng thành công!");

        // Kích hoạt sự kiện cập nhật dữ liệu
        window.dispatchEvent(new Event("contract-data-changed"));

        if (
          showDetail &&
          selectedContract?.id_contracts === contract.id_contracts
        ) {
          setShowDetail(false);
          setSelectedContract(null);
        }

        // Cập nhật lại danh sách được lọc
        applyFilters();
      } catch (error) {
        console.error("Error deleting contract:", error);
        alert(
          error.response?.data?.message || "Đã xảy ra lỗi khi xóa hợp đồng"
        );
      }
    }
  };

  // Xử lý xem chi tiết hợp đồng
  const handleView = (contract) => {
    setSelectedContract(contract);
    setShowDetail(true);
  };

  // Xử lý mở form chỉnh sửa
  const handleEdit = (contract) => {
    setSelectedContract(contract);
    setShowForm(true);
    setShowDetail(false);
  };

  // Xử lý in hợp đồng (Thêm hàm này)
  const handlePrint = (contract) => {
    // Thực hiện logic in hợp đồng ở đây
    console.log("Printing contract:", contract);
    alert("Chức năng in hợp đồng đang được phát triển");
  };

  // Xử lý đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedContract(null);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-lg text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi!</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý hợp đồng</h1>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView("list")}
            className={`px-3 py-1 rounded ${
              activeView === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setActiveView("grid")}
            className={`px-3 py-1 rounded ${
              activeView === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Lưới
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setSelectedContract(null);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700"
          >
            <FaPlus className="mr-1" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Form bộ lọc */}
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

      {/* Form thêm/sửa hợp đồng */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-4xl">
            <ContractForm
              contract={selectedContract}
              rooms={rooms}
              users={users}
              onSubmit={handleSubmit}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Modal xem chi tiết */}
      {showDetail && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-4xl">
            <ContractDetail
              contract={selectedContract}
              room={rooms.find((r) => r.id_rooms === selectedContract.id_rooms)}
              user={users.find((u) => u.id_users === selectedContract.id_users)}
              payments={payments.filter(
                (p) => p.id_contracts === selectedContract.id_contracts
              )}
              services={services}
              contractServices={contractServices.filter(
                (cs) => cs.id_contracts === selectedContract.id_contracts
              )}
              buildings={buildings}
              onClose={() => setShowDetail(false)}
              onEdit={() => {
                setShowDetail(false);
                handleEdit(selectedContract);
              }}
              onPrint={() => {
                setShowDetail(false);
                handlePrint(selectedContract);
              }}
            />
          </div>
        </div>
      )}

      {/* Hiển thị danh sách hợp đồng */}
      {activeView === "list" ? (
        <ContractList
          contracts={filteredContracts}
          rooms={rooms}
          users={users}
          payments={payments} // Thêm payments vào props
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPrint={handlePrint} // Thêm chức năng in
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id_contracts}
              contract={contract}
              room={rooms.find((r) => r.id_rooms === contract.id_rooms)}
              user={users.find((u) => u.id_users === contract.id_users)}
              payments={payments.filter(
                (p) => p.id_contracts === contract.id_contracts
              )}
              services={contractServices
                .filter((cs) => cs.id_contracts === contract.id_contracts)
                .map((cs) =>
                  services.find((s) => s.id_services === cs.id_services)
                )
                .filter(Boolean)}
              onView={() => handleView(contract)}
              onEdit={() => handleEdit(contract)}
              onDelete={() => handleDelete(contract)}
              onPrint={() => handlePrint(contract)}
            />
          ))}

          {filteredContracts.length === 0 && (
            <div className="col-span-full text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không tìm thấy hợp đồng
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {contracts.length === 0
                  ? "Chưa có hợp đồng nào trong hệ thống."
                  : "Không tìm thấy hợp đồng phù hợp với bộ lọc."}
              </p>
              {contracts.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowForm(true);
                      setSelectedContract(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                    Tạo hợp đồng đầu tiên
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
