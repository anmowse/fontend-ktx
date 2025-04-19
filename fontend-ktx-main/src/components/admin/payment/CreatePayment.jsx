import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreatePayment = ({ onSuccess, contractId = null }) => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_contracts: contractId || "",
    amount: "",
    due_date: "",
    status: "chua thanh toan",
  });

  useEffect(() => {
    // Nếu không có contractId, lấy danh sách hợp đồng
    if (!contractId) {
      fetchContracts();
    }
  }, [contractId]);

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

      // Reset form sau khi gửi thành công
      setFormData({
        id_contracts: contractId || "",
        amount: "",
        due_date: "",
        status: "chua thanh toan",
      });

      // Thông báo cho component cha
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Tạo khoản thanh toán mới</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {!contractId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hợp đồng
              </label>
              <select
                name="id_contracts"
                value={formData.id_contracts}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">-- Chọn hợp đồng --</option>
                {contracts.map((contract) => (
                  <option
                    key={contract.id_contracts}
                    value={contract.id_contracts}
                  >
                    Hợp đồng #{contract.id_contracts} - {contract.id_users}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Nhập số tiền"
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hạn thanh toán
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="chua thanh toan">Chưa thanh toán</option>
              <option value="da thanh toan">Đã thanh toán</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Đang xử lý..." : "Tạo khoản thanh toán"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePayment;
