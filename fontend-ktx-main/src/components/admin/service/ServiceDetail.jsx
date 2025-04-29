import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedService, setEditedService] = useState({
    nameService: "",
    priceService: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServiceData();
    // eslint-disable-next-line
  }, [id]);

  const fetchServiceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Lấy thông tin dịch vụ
      const serviceResponse = await axios.get(`${API_URL}/services/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (serviceResponse.data) {
        setService(serviceResponse.data);
        setEditedService({
          nameService: serviceResponse.data.nameService,
          priceService: serviceResponse.data.priceService,
        });

        // Lấy thông tin các hợp đồng sử dụng dịch vụ này
        const contractServiceResponse = await axios.get(
          `${API_URL}/contract-service?service_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let filteredContracts = [];
        let filteredRooms = [];
        if (
          contractServiceResponse.data &&
          contractServiceResponse.data.length > 0
        ) {
          const contractIds = contractServiceResponse.data.map(
            (item) => item.id_contracts
          );

          // Lấy thông tin hợp đồng
          const contractsResponse = await axios.get(`${API_URL}/contracts`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          filteredContracts = contractsResponse.data.filter((contract) =>
            contractIds.includes(contract.id_contracts)
          );
          setContracts(filteredContracts);

          // Lấy ID phòng từ các hợp đồng
          const roomIds = [
            ...new Set(filteredContracts.map((contract) => contract.id_rooms)),
          ];

          // Lấy thông tin phòng
          const roomsResponse = await axios.get(`${API_URL}/rooms`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          filteredRooms = roomsResponse.data.filter((room) =>
            roomIds.includes(room.id_rooms)
          );
          setRooms(filteredRooms);
        } else {
          setContracts([]);
          setRooms([]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
      toast.error("Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedService({
      ...editedService,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/services/${id}`, editedService, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Cập nhật dịch vụ thành công!");
      setIsEditing(false);
      fetchServiceData();
    } catch (error) {
      console.error("Lỗi khi cập nhật dịch vụ:", error);
      toast.error("Không thể cập nhật dịch vụ. Vui lòng thử lại sau.");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa dịch vụ này? Dịch vụ sẽ bị xóa khỏi hệ thống!"
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Kiểm tra nếu còn hợp đồng/phòng sử dụng thì không cho xóa
      if (contracts.length > 0) {
        toast.error(
          "Không thể xóa dịch vụ khi vẫn còn hợp đồng/phòng sử dụng."
        );
        setDeleting(false);
        return;
      }

      await axios.delete(`${API_URL}/services/${id}`, {
        headers,
      });

      toast.success("Đã xóa dịch vụ thành công!");
      navigate("/services");
    } catch (error) {
      toast.error("Không thể xóa dịch vụ. Vui lòng thử lại sau.");
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">
            Không tìm thấy thông tin dịch vụ
          </h2>
          <p className="mb-4">
            Không thể tìm thấy thông tin dịch vụ với ID: {id}
          </p>
          <Link
            to="/services"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Quay lại danh sách dịch vụ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Chi tiết dịch vụ: {service.nameService}
        </h1>
        <div className="flex gap-2">
          <Link
            to="/services"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Quay lại danh sách
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            disabled={deleting}
          >
            {deleting ? "Đang xóa..." : "Xóa dịch vụ"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin dịch vụ */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-xl font-bold">Thông tin dịch vụ</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-500 hover:text-blue-700"
            >
              {isEditing ? "Hủy" : "Chỉnh sửa"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Tên dịch vụ</label>
                <input
                  type="text"
                  name="nameService"
                  value={editedService.nameService}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Giá dịch vụ</label>
                <input
                  type="number"
                  name="priceService"
                  value={editedService.priceService}
                  onChange={handleChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                  min="0"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-gray-600">Mã dịch vụ:</p>
                <p className="font-medium">{service.id_service}</p>
              </div>
              <div>
                <p className="text-gray-600">Tên dịch vụ:</p>
                <p className="font-medium">{service.nameService}</p>
              </div>
              <div>
                <p className="text-gray-600">Giá dịch vụ:</p>
                <p className="font-medium">
                  {formatCurrency(service.priceService)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Thống kê sử dụng */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Thống kê sử dụng
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600">Số lượng hợp đồng sử dụng:</p>
              <p className="font-medium">{contracts.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Số phòng đang sử dụng:</p>
              <p className="font-medium">{rooms.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Tổng doanh thu từ dịch vụ:</p>
              <p className="font-medium">
                {formatCurrency(service.priceService * contracts.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách phòng đang sử dụng dịch vụ */}
      {rooms.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Danh sách phòng đang sử dụng dịch vụ
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số người hiện tại
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id_rooms} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.id_rooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.current_occupancy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Danh sách hợp đồng đang sử dụng dịch vụ */}
      {contracts.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">
            Danh sách hợp đồng đang sử dụng dịch vụ
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã hợp đồng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày bắt đầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày kết thúc
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contracts.map((contract) => (
                  <tr key={contract.id_contracts} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.id_contracts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.id_users}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contract.id_rooms}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.start_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contract.end_date).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
