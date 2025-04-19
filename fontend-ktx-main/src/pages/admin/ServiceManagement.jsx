import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id_service");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    nameService: "",
    priceService: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dịch vụ:", error);
      toast.error("Không thể tải dữ liệu dịch vụ. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://127.0.0.1:8000/api/services/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Xóa dịch vụ thành công!");
        fetchServices();
      } catch (error) {
        console.error("Lỗi khi xóa dịch vụ:", error);
        toast.error("Không thể xóa dịch vụ. Vui lòng thử lại sau.");
      }
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value,
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/api/services", newService, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Thêm dịch vụ thành công!");
      setNewService({
        nameService: "",
        priceService: "",
      });
      setIsAddModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Lỗi khi thêm dịch vụ:", error);
      toast.error("Không thể thêm dịch vụ. Vui lòng thử lại sau.");
    }
  };

  // Lọc và sắp xếp dịch vụ
  const filteredServices = services
    .filter((service) => {
      return (
        service.id_service.toString().includes(searchTerm) ||
        service.nameService.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "id_service") {
        comparison = a.id_service - b.id_service;
      } else if (sortBy === "nameService") {
        comparison = a.nameService.localeCompare(b.nameService);
      } else if (sortBy === "priceService") {
        comparison = a.priceService - b.priceService;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Quản lý dịch vụ</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between">
          <div className="mb-2 md:mb-0">
            <input
              type="text"
              placeholder="Tìm kiếm dịch vụ..."
              className="border rounded px-3 py-2 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Thêm dịch vụ mới
            </button>
            <button
              onClick={fetchServices}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Làm mới
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("id_service")}
                  >
                    Mã dịch vụ
                    {sortBy === "id_service" && (
                      <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("nameService")}
                  >
                    Tên dịch vụ
                    {sortBy === "nameService" && (
                      <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("priceService")}
                  >
                    Giá dịch vụ
                    {sortBy === "priceService" && (
                      <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                    )}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service.id_service} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.id_service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.nameService}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(service.priceService)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Link
                            to={`/services/${service.id_service}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Chi tiết
                          </Link>
                          <button
                            onClick={() => handleDelete(service.id_service)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Không tìm thấy dữ liệu dịch vụ nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal thêm dịch vụ */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Thêm dịch vụ mới
            </h2>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="nameService"
                >
                  Tên dịch vụ
                </label>
                <input
                  id="nameService"
                  name="nameService"
                  type="text"
                  value={newService.nameService}
                  onChange={handleAddChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="priceService"
                >
                  Giá dịch vụ
                </label>
                <input
                  id="priceService"
                  name="priceService"
                  type="number"
                  value={newService.priceService}
                  onChange={handleAddChange}
                  className="border rounded px-3 py-2 w-full"
                  required
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
