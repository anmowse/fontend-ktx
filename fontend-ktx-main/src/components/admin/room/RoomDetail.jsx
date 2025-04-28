import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaBuilding,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaListAlt,
  FaWifi,
  FaPlug,
  FaEdit,
  FaTimes,
  FaArrowLeft,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import axios from "axios";
import API_URL from "../../../config/api";
import { toast } from "react-toastify";

const RoomDetail = ({ room, building, onClose, onEdit }) => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState({ users: true, services: true });
  const [error, setError] = useState({ users: null, services: null });
  const [activeTab, setActiveTab] = useState("occupants");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [addingService, setAddingService] = useState(false);
  const [deletingService, setDeletingService] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Fetch users in room
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading((prev) => ({ ...prev, users: true }));
        const response = await axios.get(
          `${API_URL}/room/${room.id_rooms}/users`
        );
        setUsers(response.data || []);
        setError((prev) => ({ ...prev, users: null }));
      } catch (err) {
        console.error("Error fetching room users:", err);
        setError((prev) => ({
          ...prev,
          users: "Không thể tải thông tin người dùng",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, users: false }));
      }
    };

    fetchUsers();
  }, [room.id_rooms]);

  // Fetch room services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading((prev) => ({ ...prev, services: true }));

        // Kiểm tra nếu id_rooms không hợp lệ
        if (!room.id_rooms) {
          console.error("ID phòng không hợp lệ:", room);
          setServices([]);
          setError((prev) => ({ ...prev, services: null }));
          setLoading((prev) => ({ ...prev, services: false }));
          return;
        }

        try {
          // Thử gọi API lấy dịch vụ
          const response = await axios.get(
            `${API_URL}/rooms/service/${room.id_rooms}`
          );

          // Kiểm tra nếu response chứa thông báo lỗi "Không có dịch vụ nào trong phòng này"
          if (
            response.data &&
            typeof response.data === "object" &&
            response.data.message === "Không có dịch vụ nào trong phòng này"
          ) {
            // Nếu không có dịch vụ, đặt services là mảng rỗng
            setServices([]);
            console.log("Phòng không có dịch vụ nào");
          }
          // Kiểm tra nếu response có cấu trúc { id_rooms: "1", services: [...] }
          else if (response.data && response.data.services) {
            setServices(response.data.services);
            console.log(
              "Lấy dịch vụ từ phòng thành công:",
              response.data.services
            );
          }
          // Trường hợp khác (định dạng dữ liệu khác)
          else {
            setServices(Array.isArray(response.data) ? response.data : []);
            console.log("Dữ liệu dịch vụ định dạng khác:", response.data);
          }

          setError((prev) => ({ ...prev, services: null }));
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.log("Phòng không tồn tại hoặc không có dịch vụ");
            setServices([]);
            setError((prev) => ({ ...prev, services: null }));
          } else {
            console.error("Error fetching room services:", err);
            setServices([]);
            setError((prev) => ({
              ...prev,
              services: "Không thể tải thông tin dịch vụ",
            }));
          }
        }
      } finally {
        setLoading((prev) => ({ ...prev, services: false }));
      }
    };

    fetchServices();
  }, [room.id_rooms]);

  // Lấy danh sách các dịch vụ có sẵn - Sửa lỗi trùng lặp
  useEffect(() => {
    if (activeTab === "services" && showServiceForm) {
      const fetchAvailableServices = async () => {
        try {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          // Lấy danh sách tất cả dịch vụ
          const allServicesResponse = await axios.get(`${API_URL}/services`, {
            headers,
          });

          console.log("Danh sách tất cả dịch vụ:", allServicesResponse.data);

          // Mặc định hiển thị tất cả dịch vụ nếu không thể lấy dịch vụ hiện tại của phòng
          setAvailableServices(allServicesResponse.data || []);

          // Nếu có services hiện có, lọc ra các dịch vụ chưa được thêm
          if (Array.isArray(services) && services.length > 0) {
            // Xử lý để lọc dịch vụ trùng lặp
            const existingServiceNames = new Set();

            // Thu thập tất cả tên dịch vụ đã có
            services.forEach((service) => {
              const serviceName = service.service_name || service.nameService;
              existingServiceNames.add(serviceName);
            });

            // Lọc danh sách dịch vụ có sẵn, loại bỏ những dịch vụ đã có trong phòng
            const filteredServices = allServicesResponse.data.filter(
              (service) => !existingServiceNames.has(service.nameService)
            );

            setAvailableServices(filteredServices);
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách dịch vụ:", error);
          toast.error("Không thể tải danh sách dịch vụ");
          setAvailableServices([]);
        }
      };

      fetchAvailableServices();
    }
  }, [activeTab, showServiceForm, services]);

  // Hàm thêm dịch vụ - Sửa lỗi hiển thị trùng lặp
  const addService = async () => {
    if (!selectedService) {
      toast.warning("Vui lòng chọn dịch vụ");
      return;
    }

    setAddingService(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Lấy danh sách hợp đồng của phòng
      const contractsResponse = await axios.get(`${API_URL}/contracts`, {
        headers,
      });

      const roomContracts = contractsResponse.data.filter(
        (contract) => String(contract.id_rooms) === String(room.id_rooms)
      );

      if (roomContracts.length === 0) {
        toast.error("Không tìm thấy hợp đồng cho phòng này");
        return;
      }

      // Thêm dịch vụ cho tất cả hợp đồng trong phòng
      const promises = roomContracts.map((contract) =>
        axios.post(
          `${API_URL}/contract-service`,
          {
            id_contracts: contract.id_contracts,
            id_service: selectedService,
          },
          { headers }
        )
      );

      await Promise.all(promises);

      // Tìm chi tiết của dịch vụ vừa thêm
      const selectedServiceDetails = availableServices.find(
        (service) => service.id_service === selectedService
      );

      // Đặt một flag để tránh thêm dịch vụ trùng lặp
      let serviceAlreadyExists = false;
      if (selectedServiceDetails) {
        serviceAlreadyExists = services.some(
          (existingService) =>
            existingService.service_name ===
              selectedServiceDetails.nameService ||
            existingService.nameService === selectedServiceDetails.nameService
        );
      }

      // Làm mới danh sách dịch vụ của phòng
      try {
        const updatedServicesResponse = await axios.get(
          `${API_URL}/rooms/service/${room.id_rooms}`,
          { headers }
        );

        // Xử lý các định dạng phản hồi API khác nhau
        if (
          updatedServicesResponse.data &&
          updatedServicesResponse.data.message ===
            "Không có dịch vụ nào trong phòng này"
        ) {
          // Nếu API báo không có dịch vụ nhưng chúng ta vừa thêm một dịch vụ
          if (selectedServiceDetails && !serviceAlreadyExists) {
            setServices([
              {
                service_name: selectedServiceDetails.nameService,
                service_price: selectedServiceDetails.priceService,
              },
            ]);
          } else {
            setServices([]);
          }
        } else if (
          updatedServicesResponse.data &&
          updatedServicesResponse.data.services
        ) {
          // Xử lý để loại bỏ các dịch vụ trùng lặp
          const uniqueServices = [];
          const serviceNameSet = new Set();

          updatedServicesResponse.data.services.forEach((service) => {
            const name = service.service_name || service.nameService;
            if (!serviceNameSet.has(name)) {
              serviceNameSet.add(name);
              uniqueServices.push(service);
            }
          });

          setServices(uniqueServices);
        } else {
          // Trường hợp dữ liệu là mảng
          if (Array.isArray(updatedServicesResponse.data)) {
            const uniqueServices = [];
            const serviceNameSet = new Set();

            updatedServicesResponse.data.forEach((service) => {
              const name = service.service_name || service.nameService;
              if (!serviceNameSet.has(name)) {
                serviceNameSet.add(name);
                uniqueServices.push(service);
              }
            });

            setServices(uniqueServices);
          } else {
            setServices([]);
          }
        }
      } catch (error) {
        // Nếu không thể tải dịch vụ mới, thêm dịch vụ vừa chọn vào danh sách hiện tại
        if (selectedServiceDetails && !serviceAlreadyExists) {
          setServices((prevServices) => [
            ...prevServices,
            {
              service_name: selectedServiceDetails.nameService,
              service_price: selectedServiceDetails.priceService,
            },
          ]);
        }
        console.error("Không thể làm mới danh sách dịch vụ:", error);
      }

      setSelectedService("");
      setShowServiceForm(false);
      toast.success("Thêm dịch vụ thành công");

      // Cập nhật danh sách dịch vụ có sẵn
      setAvailableServices((prev) =>
        prev.filter((service) => service.id_service !== selectedService)
      );
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      toast.error("Không thể thêm dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setAddingService(false);
    }
  };

  // Hàm xóa dịch vụ - cải tiến
  const removeService = async (service) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa dịch vụ "${
          service.service_name || service.nameService
        }" không?`
      )
    ) {
      return;
    }

    setDeletingService(true);
    setServiceToDelete(service);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Lấy danh sách hợp đồng của phòng
      const contractsResponse = await axios.get(`${API_URL}/contracts`, {
        headers,
      });

      const roomContracts = contractsResponse.data.filter(
        (contract) => String(contract.id_rooms) === String(room.id_rooms)
      );

      if (roomContracts.length === 0) {
        toast.error("Không tìm thấy hợp đồng cho phòng này");
        return;
      }

      // Tìm id_service dựa trên tên dịch vụ
      const allServicesResponse = await axios.get(`${API_URL}/services`, {
        headers,
      });

      const serviceObj = allServicesResponse.data.find(
        (s) => s.nameService === (service.service_name || service.nameService)
      );

      if (!serviceObj) {
        toast.error("Không tìm thấy thông tin dịch vụ");
        return;
      }

      // Lấy tất cả contract-service để tìm các liên kết cần xóa
      const contractServicesResponse = await axios.get(
        `${API_URL}/contract-service`,
        { headers }
      );

      // Tìm các contract-service cần xóa
      const toDelete = [];
      for (const contract of roomContracts) {
        const matches = contractServicesResponse.data.filter(
          (cs) =>
            String(cs.id_contracts) === String(contract.id_contracts) &&
            String(cs.id_service) === String(serviceObj.id_service)
        );
        toDelete.push(...matches);
      }

      if (toDelete.length === 0) {
        toast.error("Không tìm thấy liên kết dịch vụ để xóa");
        return;
      }

      // Xóa từng liên kết contract-service
      for (const cs of toDelete) {
        await axios.delete(`${API_URL}/contract-service/${cs.id_Cont_Ser}`, {
          headers,
        });
      }

      // Cập nhật lại danh sách dịch vụ
      try {
        const updatedServicesResponse = await axios.get(
          `${API_URL}/rooms/service/${room.id_rooms}`,
          { headers }
        );

        if (
          updatedServicesResponse.data &&
          updatedServicesResponse.data.message ===
            "Không có dịch vụ nào trong phòng này"
        ) {
          setServices([]);
        } else if (
          updatedServicesResponse.data &&
          updatedServicesResponse.data.services
        ) {
          setServices(updatedServicesResponse.data.services);
        } else {
          setServices(
            Array.isArray(updatedServicesResponse.data)
              ? updatedServicesResponse.data
              : []
          );
        }
      } catch (error) {
        // Trong trường hợp không lấy được dữ liệu mới, cập nhật UI bằng cách xóa dịch vụ từ mảng hiện tại
        setServices((currentServices) =>
          currentServices.filter(
            (s) =>
              (s.service_name || s.nameService) !==
              (service.service_name || service.nameService)
          )
        );
      }

      // Thêm dịch vụ vừa xóa vào danh sách dịch vụ có sẵn để có thể thêm lại
      if (
        !availableServices.some((s) => s.id_service === serviceObj.id_service)
      ) {
        setAvailableServices((prev) => [...prev, serviceObj]);
      }

      toast.success("Xóa dịch vụ thành công");
    } catch (error) {
      console.error("Lỗi khi xóa dịch vụ:", error);

      if (error.response && error.response.status === 404) {
        toast.error("Không tìm thấy dịch vụ hoặc liên kết dịch vụ để xóa");
      } else {
        toast.error("Không thể xóa dịch vụ. Vui lòng thử lại sau.");
      }
    } finally {
      setDeletingService(false);
      setServiceToDelete(null);
    }
  };

  const maxOccupants = (() => {
    // Kiểm tra nếu room.type có định dạng đúng
    if (room.type && typeof room.type === "string") {
      // Thử lấy số đầu tiên từ chuỗi
      const match = room.type.match(/\d+/);
      if (match) {
        return parseInt(match[0]);
      }
    }
    // Nếu không thành công, trả về một giá trị mặc định
    return room.max_occupants || 0; // Giả sử có trường max_occupants hoặc dùng 0
  })();

  // Tính toán số giường còn trống dựa trên users.length thay vì room.current_occupancy
  const availableBeds = maxOccupants - users.length;

  // Tính % lấp đầy, đảm bảo không âm và không vượt quá 100%
  const occupancyPercentage = Math.max(
    0,
    Math.min(100, (users.length / Math.max(1, maxOccupants)) * 100)
  );

  // Thêm log để debug
  useEffect(() => {
    console.log("Debug occupancy info:", {
      maxOccupants,
      usersLength: users.length,
      roomCurrentOccupancy: room.current_occupancy,
      availableBeds,
      occupancyPercentage,
    });
  }, [users, maxOccupants, room.current_occupancy]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-5xl w-full">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">Phòng {room.number}</h2>
          <p className="flex items-center text-blue-100 mb-2">
            <FaBuilding className="mr-2" />
            {building ? `${building.nameBuild} - ${building.location}` : "N/A"}
          </p>

          {/* Thêm nút chỉnh sửa và đóng vào header */}
          <div className="mt-4 flex gap-4 justify-center">
            <button
              onClick={() => {
                onEdit(room);
                onClose();
              }}
              className="bg-white text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors flex items-center font-medium"
            >
              <FaEdit className="mr-2" /> Chỉnh sửa phòng
            </button>

            <button
              onClick={onClose}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors flex items-center font-medium"
            >
              <FaTimes className="mr-2" /> Đóng
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab navigation */}
        <div className="border-b mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("occupants")}
              className={`pb-4 font-medium text-sm flex items-center ${
                activeTab === "occupants"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaUsers className="mr-2" /> Người ở ({users.length}/
              {maxOccupants})
            </button>

            <button
              onClick={() => setActiveTab("info")}
              className={`pb-4 font-medium text-sm flex items-center ${
                activeTab === "info"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaListAlt className="mr-2" /> Thông tin phòng
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`pb-4 font-medium text-sm flex items-center ${
                activeTab === "services"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaWifi className="mr-2" /> Dịch vụ
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {/* Occupants tab */}
          {activeTab === "occupants" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Danh sách người ở</h3>

              {loading.users ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-gray-600">
                    Đang tải danh sách người ở...
                  </p>
                </div>
              ) : error.users ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                  {error.users}
                </div>
              ) : users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Họ tên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điện thoại
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id_users} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.id_users}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.phone}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <FaUserCheck
                    size={32}
                    className="text-gray-400 mx-auto mb-3"
                  />
                  <p className="text-gray-600">
                    Chưa có người ở trong phòng này
                  </p>
                </div>
              )}

              {/* Occupancy visualization */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold">
                    Số người Trong Phòng
                  </h4>
                  <span className="text-sm font-medium">
                    {users.length}/{maxOccupants} (
                    {occupancyPercentage.toFixed(0)}% - Còn {availableBeds}{" "}
                    giường trống)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      occupancyPercentage < 50
                        ? "bg-green-500"
                        : occupancyPercentage < 90
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Room info tab */}
          {activeTab === "info" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin phòng</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-3">
                    <FaUsers className="text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Loại phòng</p>
                      <p className="font-medium">{room.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <FaMoneyBillWave className="text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Giá phòng</p>
                      <p className="font-medium">{formatPrice(room.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaBuilding className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Tòa nhà</p>
                      <p className="font-medium">
                        {building ? building.nameBuild : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-3">
                    <FaCalendarAlt className="text-orange-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Số hợp đồng hiện tại
                      </p>
                      <p className="font-medium">
                        {users.length}/{maxOccupants}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <FaPlug className="text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">
                        Số dịch vụ đăng ký
                      </p>
                      <p className="font-medium">{services.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services tab */}
          {activeTab === "services" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Dịch vụ đăng ký</h3>

                {!showServiceForm ? (
                  <button
                    onClick={() => setShowServiceForm(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700"
                  >
                    <FaPlus className="mr-1" />
                    Thêm dịch vụ
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={addingService}
                    >
                      <option value="">-- Chọn dịch vụ --</option>
                      {availableServices.length === 0 && (
                        <option value="" disabled>
                          Không có dịch vụ để thêm
                        </option>
                      )}
                      {availableServices.map((service) => (
                        <option
                          key={service.id_service}
                          value={service.id_service}
                        >
                          {service.nameService} -{" "}
                          {formatPrice(service.priceService)}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={addService}
                      disabled={
                        addingService ||
                        !selectedService ||
                        availableServices.length === 0
                      }
                      className={`px-3 py-2 rounded-md text-white ${
                        addingService ||
                        !selectedService ||
                        availableServices.length === 0
                          ? "bg-blue-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {addingService ? "Đang thêm..." : "Thêm"}
                    </button>

                    <button
                      onClick={() => setShowServiceForm(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              {loading.services ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-gray-600">
                    Đang tải thông tin dịch vụ...
                  </p>
                </div>
              ) : error.services ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                  {error.services}
                </div>
              ) : Array.isArray(services) && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sử dụng Set để lọc dịch vụ trùng lặp */}
                  {(() => {
                    // Tạo danh sách không trùng lặp
                    const uniqueServices = [];
                    const serviceNames = new Set();

                    services.forEach((service) => {
                      const name = service.service_name || service.nameService;
                      if (!serviceNames.has(name)) {
                        serviceNames.add(name);
                        uniqueServices.push(service);
                      }
                    });

                    return uniqueServices.map((service, index) => {
                      const uniqueKey = `service-${index}-${
                        service.service_name || service.nameService || "unknown"
                      }`;

                      const isDeleting =
                        deletingService &&
                        serviceToDelete &&
                        (serviceToDelete.service_name ===
                          service.service_name ||
                          serviceToDelete.nameService === service.nameService);

                      return (
                        <div
                          key={uniqueKey}
                          className="border rounded-lg p-4 hover:bg-gray-50"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {service.service_name || service.nameService}
                              </h4>
                              <span className="text-green-600 text-sm">
                                {formatPrice(
                                  service.service_price || service.priceService
                                )}
                              </span>
                            </div>
                            <button
                              onClick={() => removeService(service)}
                              disabled={deletingService}
                              className={`p-2 rounded text-red-500 hover:bg-red-50 ${
                                isDeleting
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="Xóa dịch vụ"
                            >
                              {isDeleting ? (
                                <div className="flex items-center">
                                  <div className="animate-spin h-4 w-4 border-t-2 border-red-500 border-r-2 rounded-full mr-1"></div>
                                  <span className="text-xs">Đang xóa</span>
                                </div>
                              ) : (
                                <FaTrash />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <FaListAlt size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Phòng này chưa đăng ký dịch vụ nào
                  </p>
                  {!showServiceForm && (
                    <button
                      onClick={() => setShowServiceForm(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 mx-auto"
                    >
                      <FaPlus className="mr-2" />
                      Thêm dịch vụ ngay
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
