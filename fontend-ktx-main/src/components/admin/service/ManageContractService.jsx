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

        // Sử dụng Promise.all để gọi cả hai API đồng thời
        const [servicesRes, allContractServicesRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/services", { headers }),
          axios.get("http://127.0.0.1:8000/api/contract-service", { headers }),
        ]);

        // Lọc dịch vụ theo contractId, đảm bảo sử dụng so sánh đúng kiểu dữ liệu
        const contractServicesData = allContractServicesRes.data.filter(
          (cs) => String(cs.id_contracts) === String(contractId)
        );

        // Log thông tin để debug
        console.log("Contract ID:", contractId, "Loại:", typeof contractId);
        console.log(
          "Tổng số contract services:",
          allContractServicesRes.data.length
        );
        console.log("Số dịch vụ đã lọc:", contractServicesData.length);

        // Ánh xạ các trường nameService và priceService sang service_name và service_price
        // để đảm bảo sự nhất quán trong toàn bộ component
        const mappedServices = servicesRes.data.map((service) => ({
          ...service,
          service_name: service.nameService,
          service_price: service.priceService,
        }));

        setServices(mappedServices);
        setContractServices(contractServicesData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        if (error.response) {
          console.error("Phản hồi từ server:", error.response.data);
          toast.error(
            `Lỗi: ${
              error.response.data.message || "Không thể tải dữ liệu dịch vụ"
            }`
          );
        } else if (error.request) {
          toast.error(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          toast.error("Đã xảy ra lỗi khi xử lý yêu cầu.");
        }
        setServices([]);
        setContractServices([]);
      } finally {
        setLoading(false);
      }
    };

    if (contractId) {
      fetchData();
    }
  }, [contractId]);

  const addService = async () => {
    if (!selectedService) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Kiểm tra xem dịch vụ đã tồn tại trong hợp đồng chưa
      const isDuplicate = contractServices.some(
        (cs) => String(cs.id_service) === String(selectedService)
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

      // Làm mới danh sách dịch vụ của hợp đồng
      const allContractServicesRes = await axios.get(
        "http://127.0.0.1:8000/api/contract-service",
        { headers }
      );
      const contractServicesData = allContractServicesRes.data.filter(
        (cs) => String(cs.id_contracts) === String(contractId)
      );

      setContractServices(contractServicesData);
      setSelectedService("");
      toast.success("Thêm dịch vụ thành công");

      // Thông báo cho component cha cập nhật
      if (onUpdate) onUpdate();

      // Dispatch event để các component khác cũng nhận được thông báo
      const event = new CustomEvent("contract-data-changed");
      window.dispatchEvent(event);
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

      // Cập nhật state local
      setContractServices((prev) =>
        prev.filter((cs) => cs.id_Cont_Ser !== contractServiceId)
      );

      toast.success("Xóa dịch vụ thành công");

      // Thông báo cho component cha
      if (onUpdate) onUpdate();

      // Dispatch event để các component khác cũng nhận được thông báo
      const event = new CustomEvent("contract-data-changed");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);
      toast.error("Không thể xóa dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật hàm getServiceIcon để xử lý nhiều từ khóa hơn và luôn có icon mặc định
  const getServiceIcon = (serviceName) => {
    if (!serviceName)
      return (
        <div className="w-2 h-2 rounded-full bg-blue-400 mr-1 flex-shrink-0"></div>
      );

    const name = serviceName.toLowerCase();

    // Dịch vụ Internet/Wifi
    if (
      name.includes("internet") ||
      name.includes("wifi") ||
      name.includes("mạng") ||
      name.includes("mang")
    )
      return <FaWifi className="text-blue-500" />;

    // Dịch vụ điện/nước
    if (
      name.includes("dien") ||
      name.includes("điện") ||
      name.includes("nuoc") ||
      name.includes("nước") ||
      name.includes("điêu hòa") ||
      name.includes("dieu hoa") ||
      name.includes("thiet bi") ||
      name.includes("thiết bị")
    )
      return <FaPlug className="text-yellow-500" />;

    // Dịch vụ giữ xe
    if (
      name.includes("xe") ||
      name.includes("giu xe") ||
      name.includes("giữ xe") ||
      name.includes("bai") ||
      name.includes("bãi") ||
      name.includes("đỗ") ||
      name.includes("do") ||
      name.includes("đậu")
    )
      return <FaCar className="text-green-500" />;

    // Dịch vụ vệ sinh/xử lý rác
    if (
      name.includes("rac") ||
      name.includes("rác") ||
      name.includes("ve sinh") ||
      name.includes("vệ sinh") ||
      name.includes("dọn") ||
      name.includes("don")
    )
      return <FaTrashAlt className="text-gray-500" />;

    // Dịch vụ khác
    return (
      <div className="w-2 h-2 rounded-full bg-blue-400 mr-1 flex-shrink-0"></div>
    );
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
                (s) => String(s.id_service) === String(cs.id_service)
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
              {services
                // Lọc ra các dịch vụ chưa được thêm
                .filter(
                  (service) =>
                    !contractServices.some(
                      (cs) =>
                        String(cs.id_service) === String(service.id_service)
                    )
                )
                .map((service) => (
                  <option key={service.id_service} value={service.id_service}>
                    {service.service_name || service.nameService} -{" "}
                    {formatCurrency(
                      service.service_price || service.priceService
                    )}
                  </option>
                ))}
              {/* Hiển thị thông báo khi đã thêm hết dịch vụ */}
              {services.filter(
                (service) =>
                  !contractServices.some(
                    (cs) => String(cs.id_service) === String(service.id_service)
                  )
              ).length === 0 && (
                <option value="" disabled>
                  Đã thêm tất cả dịch vụ có sẵn
                </option>
              )}
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
