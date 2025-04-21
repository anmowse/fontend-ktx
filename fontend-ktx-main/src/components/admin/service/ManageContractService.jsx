import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaWifi,
  FaPlug,
  FaCar,
  FaTrashAlt,
} from "react-icons/fa";

const ManageContractService = ({ contractId, onClose, onUpdate }) => {
  const [services, setServices] = useState([]);
  const [contractServices, setContractServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchContractServices();
  }, [contractId]);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
      toast.error("Không thể tải danh sách dịch vụ");
    }
  };

  const fetchContractServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/contract-service",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Lọc dịch vụ theo contractId
      const filteredServices = response.data.filter(
        (cs) => cs.id_contracts == contractId
      );
      setContractServices(filteredServices);
    } catch (error) {
      console.error("Lỗi khi lấy dịch vụ của hợp đồng:", error);
      toast.error("Không thể tải dịch vụ của hợp đồng");
    }
  };

  const addService = async () => {
    if (!selectedService) {
      toast.warning("Vui lòng chọn dịch vụ");
      return;
    }

    // Kiểm tra dịch vụ đã tồn tại cho hợp đồng này chưa
    const exists = contractServices.some(
      (cs) => cs.id_service == selectedService
    );
    if (exists) {
      toast.warning("Dịch vụ này đã được thêm vào hợp đồng");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://127.0.0.1:8000/api/contract-service",
        {
          id_contracts: contractId,
          id_service: selectedService,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Thêm dịch vụ thành công!");
      fetchContractServices();
      setSelectedService("");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      toast.error("Không thể thêm dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const removeService = async (contractServiceId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/contract-service/${contractServiceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Xóa dịch vụ thành công!");
      fetchContractServices();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      toast.error("Không thể xóa dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName.toLowerCase();
    if (name.includes("internet") || name.includes("wifi"))
      return <FaWifi className="text-blue-500" />;
    if (name.includes("dien") || name.includes("nuoc"))
      return <FaPlug className="text-yellow-500" />;
    if (name.includes("xe") || name.includes("giu"))
      return <FaCar className="text-green-500" />;
    if (name.includes("rac")) return <FaTrashAlt className="text-gray-500" />;
    return null;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount || 0)
      .replace(/\s₫/, " đ");
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
      style={{ maxHeight: "450px" }}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-3">
        <h2 className="text-lg font-semibold">Quản lý dịch vụ</h2>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto">
        <h3 className="font-medium mb-2">Dịch vụ đã đăng ký</h3>
        {contractServices.length > 0 ? (
          <ul className="mb-4">
            {contractServices.map((cs) => {
              const service = services.find(
                (s) => s.id_service == cs.id_service
              );
              if (!service) return null;

              return (
                <li
                  key={cs.id_Cont_Ser}
                  className="flex items-center justify-between py-2 border-b"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center mr-2">
                      {getServiceIcon(service.nameService)}
                    </div>
                    <div>
                      <p className="font-medium">{service.nameService}</p>
                      <p className="text-green-600 text-sm">
                        {formatCurrency(service.priceService)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeService(cs.id_Cont_Ser)}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    <FaTrash />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-gray-50 p-3 text-center text-gray-500 rounded-md mb-4">
            Chưa có dịch vụ nào được đăng ký
          </div>
        )}

        <div className="pt-2 border-t">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thêm dịch vụ mới
          </label>
          <div className="flex gap-2">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="flex-grow rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn dịch vụ --</option>
              {services.map((service) => (
                <option key={service.id_service} value={service.id_service}>
                  {service.nameService} - {formatCurrency(service.priceService)}
                </option>
              ))}
            </select>
            <button
              onClick={addService}
              disabled={loading || !selectedService}
              className={`px-4 py-2 rounded-md text-white flex-shrink-0 ${
                loading || !selectedService
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-50 border-t mt-auto">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageContractService;
