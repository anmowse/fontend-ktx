import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { differenceInMonths } from "date-fns";

const CreatePayment = ({ onSuccess, contractId = null }) => {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [contractServices, setContractServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    id_contracts: contractId || "",
    amount: "",
    due_date: "",
    status: "chua thanh toan",
  });

  useEffect(() => {
    if (!contractId) {
      fetchContracts();
    } else {
      fetchContractInfo(contractId);
    }
    fetchRooms();
    fetchServices();
  }, [contractId]);

  useEffect(() => {
    if (formData.id_contracts) {
      fetchContractInfo(formData.id_contracts);
    }
  }, [formData.id_contracts]);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/contracts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContracts(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hợp đồng:", error);
      toast.error("Không thể tải danh sách hợp đồng");
    }
  };

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(response.data);

      const contractServiceResponse = await axios.get(
        "http://127.0.0.1:8000/api/contract-service",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContractServices(contractServiceResponse.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
    }
  };

  const fetchContractInfo = async (contractId) => {
    setCalculatingPrice(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/contracts/${contractId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const contractData = response.data;
      setSelectedContract(contractData);

      calculateTotalAmount(contractData);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin hợp đồng:", error);
      setCalculatingPrice(false);
    }
  };

  const calculateTotalAmount = (contract) => {
    if (
      !contract ||
      !contract.id_rooms ||
      !contract.start_date ||
      !contract.end_date
    ) {
      setCalculatingPrice(false);
      return;
    }

    try {
      const room = rooms.find((r) => r.id_rooms === contract.id_rooms);
      if (!room) {
        setCalculatingPrice(false);
        return;
      }

      const startDate = new Date(contract.start_date);
      const endDate = new Date(contract.end_date);
      const months = differenceInMonths(endDate, startDate) || 1;

      const roomTotal = room.price * months;

      const contractServiceList = contractServices.filter(
        (cs) => cs.id_contracts === contract.id_contracts
      );

      let serviceTotal = 0;
      contractServiceList.forEach((cs) => {
        const service = services.find((s) => s.id_service === cs.id_service);
        if (service) {
          serviceTotal += parseFloat(service.priceService);
        }
      });

      const totalAmount = roomTotal + serviceTotal;

      setFormData((prev) => ({
        ...prev,
        amount: totalAmount.toFixed(2),
      }));
    } catch (error) {
      console.error("Lỗi khi tính toán:", error);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/payments",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Tạo khoản thanh toán thành công!");

      setFormData({
        id_contracts: contractId || "",
        amount: "",
        due_date: "",
        status: "chua thanh toan",
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tạo khoản thanh toán:", error);
      toast.error("Không thể tạo khoản thanh toán. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-semibold text-gray-800">
          Tạo khoản thanh toán
        </h2>
      </div>

      {/* Body */}
      <div className="p-4 overflow-y-auto flex-grow">
        <form id="payment-form" onSubmit={handleSubmit}>
          {/* Thông tin hợp đồng */}
          {selectedContract && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
              <h3 className="font-medium text-gray-700 mb-2">
                Thông tin hợp đồng
              </h3>
              <div className="grid grid-cols-1 gap-1 text-sm">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Phòng:</span>
                  <span>
                    {rooms.find((r) => r.id_rooms === selectedContract.id_rooms)
                      ?.number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Giá phòng:</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      rooms.find(
                        (r) => r.id_rooms === selectedContract.id_rooms
                      )?.price || 0
                    )}
                    /tháng
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">
                    Thời gian thuê:
                  </span>
                  <span>
                    {differenceInMonths(
                      new Date(selectedContract.end_date),
                      new Date(selectedContract.start_date)
                    ) || 1}{" "}
                    tháng
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Dịch vụ:</span>
                  <span>
                    {
                      contractServices.filter(
                        (cs) =>
                          cs.id_contracts === selectedContract.id_contracts
                      ).length
                    }{" "}
                    dịch vụ
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trường số tiền */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Nhập số tiền"
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {calculatingPrice && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {selectedContract && formData.amount && (
              <p className="text-sm text-green-600 mt-1">
                {formatCurrency(formData.amount)}
              </p>
            )}
          </div>

          {/* Trường hạn thanh toán */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hạn thanh toán
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Trường trạng thái */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="chua thanh toan">Chưa thanh toán</option>
              <option value="da thanh toan">Đã thanh toán</option>
            </select>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onSuccess ? () => onSuccess(null) : null}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              document
                .getElementById("payment-form")
                .dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true })
                );
            }}
            disabled={loading || calculatingPrice}
            className={`px-4 py-2 rounded-md text-white ${
              loading || calculatingPrice
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Tạo khoản thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePayment;
