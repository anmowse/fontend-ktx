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
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  // Fetch services and contract services
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Lấy danh sách tất cả dịch vụ
        const servicesRes = await axios.get(
          "http://127.0.0.1:8000/api/services",
          { headers }
        );

        // Lấy tất cả contract-service từ API và lọc theo contractId
        const allContractServicesRes = await axios.get(
          "http://127.0.0.1:8000/api/contract-service",
          { headers }
        );
        const contractServicesData = allContractServicesRes.data.filter(
          (cs) => cs.id_contracts == contractId
        );

        // Ánh xạ các trường nameService và priceService sang service_name và service_price
        // để phù hợp với CreatePayment.jsx
        const mappedServices = servicesRes.data.map((service) => ({
          ...service,
          service_name: service.nameService,
          service_price: service.priceService,
        }));

        setServices(mappedServices);
        setContractServices(contractServicesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu dịch vụ");
        // Đảm bảo setServices và setContractServices được gọi để tránh lỗi
        setServices([]);
        setContractServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId]);

  const addService = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Kiểm tra xem dịch vụ đã tồn tại trong hợp đồng chưa
      const isDuplicate = contractServices.some(
        (cs) => cs.id_service == selectedService
      );

      if (isDuplicate) {
        toast.warning("Dịch vụ này đã được thêm vào hợp đồng!");
        setLoading(false);
        return;
      }

      // Thêm dịch vụ mới vào hợp đồng
      await axios.post(
        "http://127.0.0.1:8000/api/contract-service",
        {
          id_contracts: contractId,
          id_service: selectedService,
        },
        { headers }
      );

      // Làm mới danh sách dịch vụ của hợp đồng bằng cách lấy tất cả và lọc
      const allContractServicesRes = await axios.get(
        "http://127.0.0.1:8000/api/contract-service",
        { headers }
      );
      const contractServicesData = allContractServicesRes.data.filter(
        (cs) => cs.id_contracts == contractId
      );

      setContractServices(contractServicesData);
      setSelectedService("");
      toast.success("Thêm dịch vụ thành công");

      // Notify parent
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
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(
        `http://127.0.0.1:8000/api/contract-service/${contractServiceId}`,
        { headers }
      );

      // Update local state
      setContractServices((prev) =>
        prev.filter((cs) => cs.id_Cont_Ser !== contractServiceId)
      );

      toast.success("Xóa dịch vụ thành công");

      // Notify parent
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      toast.error("Không thể xóa dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm getServiceIcon để sử dụng service_name thay vì nameService
  const getServiceIcon = (serviceName) => {
    if (!serviceName) return null;

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
                      {getServiceIcon(
                        service.service_name || service.nameService
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {service.service_name || service.nameService}
                      </p>
                      <p className="text-green-600 text-sm">
                        {formatCurrency(
                          service.service_price || service.priceService
                        )}
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
                  {service.service_name || service.nameService} -{" "}
                  {formatCurrency(
                    service.service_price || service.priceService
                  )}
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
