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
} from "react-icons/fa";
import axios from "axios";
import API_URL from "../../../config/api";
const RoomDetail = ({ room, building, onClose, onEdit }) => {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState({ users: true, services: true });
  const [error, setError] = useState({ users: null, services: null });
  const [activeTab, setActiveTab] = useState("occupants");

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
        const response = await axios.get(
          `${API_URL}/rooms/service/${room.id_rooms}`
        );
        setServices(response.data || []);
        setError((prev) => ({ ...prev, services: null }));
      } catch (err) {
        console.error("Error fetching room services:", err);
        setError((prev) => ({
          ...prev,
          services: "Không thể tải thông tin dịch vụ",
        }));
      } finally {
        setLoading((prev) => ({ ...prev, services: false }));
      }
    };

    fetchServices();
  }, [room.id_rooms]);

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
              onClick={() => onEdit(room)}
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
              <FaWifi className="mr-2" /> Dịch vụ ({services.length})
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
              <h3 className="text-lg font-semibold mb-4">Dịch vụ đăng ký</h3>

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
              ) : services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.id_service}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">{service.nameService}</h4>
                        <span className="text-green-600 font-medium">
                          {formatPrice(service.priceService)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <FaListAlt size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Phòng này chưa đăng ký dịch vụ nào
                  </p>
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
