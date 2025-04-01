import React, { useState, useEffect } from "react";
import axios from "axios";
import ContractList from "../../components/admin/contract/ContractList";
import ContractForm from "../../components/admin/contract/ContractForm";
import ContractFilter from "../../components/admin/contract/ContractFilter";
import ContractDetail from "../../components/admin/contract/ContractDetail";
import ContractCard from "../../components/admin/contract/ContractCard";
import { FaPlus } from "react-icons/fa";
import API_URL from "../../config/api";

const ContractManagement = () => {
  // State cho dữ liệu
  const [contracts, setContracts] = useState([]);
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
  const [filters, setFilters] = useState({});

  // Fetch data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách hợp đồng
        const contractsRes = await axios.get(`${API_URL}/contracts`);
        setContracts(contractsRes.data);

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
    setFilters(filterValues);
  };

  // Lọc dữ liệu theo filters
  const filteredContracts = contracts.filter((contract) => {
    // Filter logic based on filterValues
    // Implement filtering based on your requirements
    return true; // Return all by default
  });

  // Xử lý thêm/sửa hợp đồng
  const handleSubmit = async (formData) => {
    try {
      if (selectedContract) {
        // Cập nhật hợp đồng
        const response = await axios.put(
          `${API_URL}/contracts/${selectedContract.id_contracts}`,
          formData
        );

        setContracts(
          contracts.map((c) =>
            c.id_contracts === selectedContract.id_contracts ? response.data : c
          )
        );

        alert("Cập nhật hợp đồng thành công!");
      } else {
        // Thêm hợp đồng mới
        const response = await axios.post(`${API_URL}/contracts`, formData);

        setContracts([...contracts, response.data]);
        alert("Thêm hợp đồng mới thành công!");
      }

      // Reset form
      setSelectedContract(null);
      setShowForm(false);
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

        setContracts(
          contracts.filter((c) => c.id_contracts !== contract.id_contracts)
        );

        alert("Xóa hợp đồng thành công!");

        if (
          showDetail &&
          selectedContract?.id_contracts === contract.id_contracts
        ) {
          setShowDetail(false);
          setSelectedContract(null);
        }
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
        onFilter={handleFilter}
        initialFilters={filters}
      />

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
              onPrint={() => handlePrint(contract)} // Thêm chức năng in
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
