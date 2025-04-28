import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { FaSave, FaSpinner, FaCalculator } from "react-icons/fa";

const CreatePayment = ({ onSuccess, contractId = null }) => {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatingAmount, setCalculatingAmount] = useState(false);

  const [formData, setFormData] = useState({
    id_contracts: contractId || "",
    amount: "",
    due_date: format(new Date(), "yyyy-MM-dd"),
    status: "chua thanh toan",
    payment_date: null,
    description: "",
  });

  // Cập nhật hàm autoFillContractData để xử lý cấu trúc API trả về
  const autoFillContractData = async (contract, allRooms) => {
    try {
      setCalculatingAmount(true);

      // Đặt ngày đến hạn là ngày kết thúc hợp đồng
      const endDate = contract.end_date
        ? format(new Date(contract.end_date), "yyyy-MM-dd")
        : "";

      // Tìm phòng tương ứng với hợp đồng
      const room = allRooms.find((r) => r.id_rooms === contract.id_rooms);

      if (!room) {
        toast.error("Không tìm thấy thông tin phòng");
        return;
      }

      // Lấy danh sách dịch vụ của phòng từ API chuyên biệt
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const roomServicesRes = await axios.get(
        `http://127.0.0.1:8000/api/rooms/service/${room.id_rooms}`,
        { headers }
      );

      // Log response để debug
      console.log("Room services API response:", roomServicesRes);

      // Xử lý dữ liệu dịch vụ từ API
      let roomServices = [];
      if (roomServicesRes.data && roomServicesRes.data.services) {
        // Trích xuất mảng services từ dữ liệu API
        roomServices = roomServicesRes.data.services;
      }

      // Console.log để debug
      console.log("Processed room services:", roomServices);

      // Tính tổng tiền dịch vụ - sử dụng đúng cấu trúc dữ liệu từ API
      let totalServiceCost = 0;

      // Mảng để theo dõi các dịch vụ đã được tính tiền (tránh tính trùng)
      const processedServices = new Set();

      if (Array.isArray(roomServices)) {
        roomServices.forEach((service) => {
          // Tránh tính trùng dịch vụ có cùng tên
          if (!processedServices.has(service.service_name)) {
            totalServiceCost += Number(service.service_price || 0);
            processedServices.add(service.service_name);
          }
        });
      }

      // Tổng tiền = giá phòng + tổng tiền dịch vụ
      const roomPrice = Number(room.price || 0);
      const totalAmount = roomPrice + totalServiceCost;

      // Cập nhật form data
      setFormData((prev) => ({
        ...prev,
        due_date: endDate,
        amount: totalAmount.toString(),
        description: `Thanh toán tiền phòng và dịch vụ cho hợp đồng ${contract.id_contracts}`,
      }));

      // Lưu danh sách dịch vụ để hiển thị (sau khi đã loại bỏ trùng lặp)
      const uniqueServices = Array.isArray(roomServices)
        ? roomServices.filter(
            (service, index, self) =>
              index ===
              self.findIndex((s) => s.service_name === service.service_name)
          )
        : [];

      setServices(uniqueServices);
    } catch (error) {
      console.error("Error auto-filling contract data:", error);
      toast.error("Không thể tự động điền thông tin hợp đồng.");
    } finally {
      setCalculatingAmount(false);
    }
  };

  // Cập nhật useEffect khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [contractsRes, roomsRes, usersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/contracts", { headers }),
          axios.get("http://127.0.0.1:8000/api/rooms", { headers }),
          axios.get("http://127.0.0.1:8000/api/users", { headers }),
        ]);

        setContracts(contractsRes.data);
        setRooms(roomsRes.data);
        setUsers(usersRes.data);

        // Nếu contractId được truyền vào
        if (contractId) {
          setFormData((prev) => ({ ...prev, id_contracts: contractId }));

          // Tự động tính toán ngày đến hạn và số tiền
          const selectedContract = contractsRes.data.find(
            (c) => c.id_contracts == contractId
          );
          if (selectedContract) {
            await autoFillContractData(selectedContract, roomsRes.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contractId]);

  const selectedContract = contracts.find(
    (c) => c.id_contracts == formData.id_contracts
  );
  const roomInfo = selectedContract
    ? rooms.find((r) => r.id_rooms === selectedContract.id_rooms)
    : null;
  const userInfo = selectedContract
    ? users.find((u) => u.id_users === selectedContract.id_users)
    : null;

  // Cập nhật hàm handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "id_contracts" && value) {
      const newSelectedContract = contracts.find(
        (c) => c.id_contracts == value
      );
      if (newSelectedContract) {
        autoFillContractData(newSelectedContract, rooms);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_contracts) {
      toast.warning("Vui lòng chọn hợp đồng");
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.warning("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (!formData.due_date) {
      toast.warning("Vui lòng chọn ngày đến hạn");
      return;
    }

    const formatDateTimeForServer = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd HH:mm:ss");
    };

    const paymentData = {
      ...formData,
      amount: parseInt(formData.amount, 10),
      id_contracts: parseInt(formData.id_contracts, 10),
      due_date: formatDateTimeForServer(formData.due_date),
      payment_date:
        formData.status === "da thanh toan"
          ? formatDateTimeForServer(formData.payment_date || new Date())
          : null,
    };

    console.log("Sending payment data:", paymentData);

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://127.0.0.1:8000/api/payments",
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Tạo khoản thanh toán thành công!");

      window.dispatchEvent(new Event("contract-data-changed"));

      setFormData({
        id_contracts: contractId || "",
        amount: "",
        due_date: format(new Date(), "yyyy-MM-dd"),
        status: "chua thanh toan",
        payment_date: null,
        description: "",
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tạo khoản thanh toán:", error);

      if (error.response?.data?.errors) {
        const errorDetails = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        toast.error(`Lỗi validation: ${errorDetails}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể tạo khoản thanh toán. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm render dịch vụ của hợp đồng - Sử dụng trường đúng từ API
  const renderContractServices = () => {
    if (
      !selectedContract ||
      !roomInfo ||
      !Array.isArray(services) ||
      services.length === 0
    )
      return <p className="text-gray-500 italic">Không có dịch vụ</p>;

    return (
      <div className="mt-2">
        <h4 className="font-medium text-sm text-gray-700 mb-1">
          Dịch vụ đã đăng ký:
        </h4>
        <ul className="text-sm space-y-1">
          {services.map((service, index) => (
            <li key={index} className="flex justify-between">
              <span>{service.service_name || "Dịch vụ không xác định"}</span>
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(service.service_price || 0)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Cập nhật hàm renderPriceBreakdown để sử dụng trường đúng từ API
  const renderPriceBreakdown = () => {
    if (!selectedContract || !roomInfo) return null;

    // Tính tổng tiền dịch vụ từ danh sách services
    let totalServiceCost = 0;

    if (Array.isArray(services)) {
      // Tính tổng chi phí dịch vụ từ danh sách services đã lọc trùng lặp
      services.forEach((service) => {
        totalServiceCost += Number(service.service_price || 0);
      });
    }

    const roomPrice = Number(roomInfo.price || 0);
    const totalAmount = roomPrice + totalServiceCost;

    return (
      <div className="mt-3 border-t pt-2">
        <h4 className="font-medium text-sm text-gray-700">Tổng thanh toán:</h4>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Giá phòng:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(roomPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tổng dịch vụ ({services?.length || 0} dịch vụ):</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalServiceCost)}
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Tổng cộng:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalAmount)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, amount: totalAmount.toString() }))
          }
          className="mt-2 text-blue-600 text-sm flex items-center hover:text-blue-800"
        >
          <FaCalculator className="mr-1" /> Áp dụng số tiền này
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tạo khoản thanh toán</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hợp đồng
          </label>
          <select
            name="id_contracts"
            value={formData.id_contracts}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={contractId !== null || loading}
          >
            <option value="">-- Chọn hợp đồng --</option>
            {contracts.map((contract) => {
              const user = users.find((u) => u.id_users === contract.id_users);
              const room = rooms.find((r) => r.id_rooms === contract.id_rooms);
              return (
                <option
                  key={contract.id_contracts}
                  value={contract.id_contracts}
                >
                  {user ? user.name : "Unknown"} -{" "}
                  {room ? `Phòng ${room.number}` : "Unknown"}
                </option>
              );
            })}
          </select>
        </div>

        {selectedContract && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2 text-gray-800">
              Thông tin hợp đồng
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>
                <span className="font-medium">Phòng:</span>{" "}
                {roomInfo ? roomInfo.number : "N/A"}
              </p>
              <p>
                <span className="font-medium">Sinh viên:</span>{" "}
                {userInfo ? userInfo.name : "N/A"}
              </p>
              <p>
                <span className="font-medium">Ngày bắt đầu:</span>{" "}
                {selectedContract.start_date}
              </p>
              <p>
                <span className="font-medium">Ngày kết thúc:</span>{" "}
                {selectedContract.end_date}
              </p>
              <p>
                <span className="font-medium">Giá phòng:</span>{" "}
                {roomInfo
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(roomInfo.price || 0)
                  : "N/A"}
              </p>
            </div>

            {renderContractServices()}

            {renderPriceBreakdown()}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số tiền
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Nhập số tiền"
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày đến hạn
          </label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trạng thái
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="chua thanh toan">Chưa thanh toán</option>
            <option value="da thanh toan">Đã thanh toán</option>
          </select>
        </div>

        {formData.status === "da thanh toan" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày thanh toán
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date || format(new Date(), "yyyy-MM-dd")}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Nhập mô tả khoản thanh toán (tùy chọn)"
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={
              submitting ||
              calculatingAmount ||
              !formData.id_contracts ||
              !formData.amount
            }
          >
            {submitting || calculatingAmount ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSave className="mr-2" />
            )}
            {submitting
              ? "Đang lưu..."
              : calculatingAmount
              ? "Đang tính..."
              : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePayment;
