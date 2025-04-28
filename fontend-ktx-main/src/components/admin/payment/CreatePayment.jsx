import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { format, isAfter, parseISO, differenceInMonths } from "date-fns";
import {
  FaSave,
  FaSpinner,
  FaCalculator,
  FaExclamationTriangle,
} from "react-icons/fa";
import ContractDateCalculator from "../utils/ContractDateCalculator";

const CreatePayment = ({ onSuccess, contractId = null }) => {
  const [contracts, setContracts] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatingAmount, setCalculatingAmount] = useState(false);
  const [existingPayments, setExistingPayments] = useState([]);
  const [contractValidation, setContractValidation] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("tien mat");
  const [contractMonths, setContractMonths] = useState(1);

  const [formData, setFormData] = useState({
    id_contracts: contractId || "",
    amount: "",
    due_date: format(new Date(), "yyyy-MM-dd"),
    status: "chua thanh toan",
    payment_date: null,
    description: "",
  });

  const autoFillContractData = async (contract, allRooms) => {
    try {
      setCalculatingAmount(true);

      const startDate = contract.start_date
        ? new Date(contract.start_date)
        : new Date();
      const endDate = contract.end_date
        ? new Date(contract.end_date)
        : new Date();

      const monthDiff = differenceInMonths(endDate, startDate);
      const diffMonths = Math.max(1, monthDiff);

      console.log(
        "Từ:",
        format(startDate, "yyyy-MM-dd"),
        "đến:",
        format(endDate, "yyyy-MM-dd"),
        "=",
        diffMonths,
        "tháng"
      );

      setContractMonths(diffMonths);

      const room = allRooms.find((r) => r.id_rooms === contract.id_rooms);

      if (!room) {
        toast.error("Không tìm thấy thông tin phòng");
        return;
      }

      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const roomServicesRes = await axios.get(
        `http://127.0.0.1:8000/api/rooms/service/${room.id_rooms}`,
        { headers }
      );

      let roomServices = [];
      if (roomServicesRes.data && roomServicesRes.data.services) {
        roomServices = roomServicesRes.data.services;
      }

      let totalServiceCost = 0;
      const processedServices = new Set();

      if (Array.isArray(roomServices)) {
        roomServices.forEach((service) => {
          if (!processedServices.has(service.service_name)) {
            totalServiceCost += Number(service.service_price || 0);
            processedServices.add(service.service_name);
          }
        });
      }

      const roomPrice = Number(room.price || 0);
      const totalAmount = roomPrice * diffMonths + totalServiceCost;

      setFormData((prev) => ({
        ...prev,
        due_date: format(endDate, "yyyy-MM-dd"),
        amount: totalAmount.toString(),
        description: `Thanh toán tiền phòng (${diffMonths} tháng) và dịch vụ cho hợp đồng ${contract.id_contracts}`,
      }));

      const uniqueServices = Array.isArray(roomServices)
        ? roomServices.filter(
            (service, index, self) =>
              index ===
              self.findIndex((s) => s.service_name === service.service_name)
          )
        : [];

      setServices(uniqueServices);
      setContractMonths(diffMonths);
    } catch (error) {
      console.error("Error auto-filling contract data:", error);
      toast.error("Không thể tự động điền thông tin hợp đồng.");
    } finally {
      setCalculatingAmount(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [contractsRes, roomsRes, usersRes, paymentsRes] =
          await Promise.all([
            axios.get("http://127.0.0.1:8000/api/contracts", { headers }),
            axios.get("http://127.0.0.1:8000/api/rooms", { headers }),
            axios.get("http://127.0.0.1:8000/api/users", { headers }),
            axios.get("http://127.0.0.1:8000/api/payments", { headers }),
          ]);

        setContracts(contractsRes.data);
        setRooms(roomsRes.data);
        setUsers(usersRes.data);
        setExistingPayments(paymentsRes.data);

        validateContracts(contractsRes.data, paymentsRes.data);

        if (contractId) {
          setFormData((prev) => ({ ...prev, id_contracts: contractId }));

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

  const validateContracts = (contracts, payments) => {
    const validation = {};

    contracts.forEach((contract) => {
      const contractPayments = payments.filter(
        (p) => p.id_contracts == contract.id_contracts
      );

      let isExpired = false;
      if (contract.end_date) {
        const endDate = parseISO(contract.end_date);
        isExpired = isAfter(new Date(), endDate);
      }

      const hasPendingPayment = contractPayments.some(
        (p) => p.status === "chua thanh toan"
      );

      const canCreatePayment = !hasPendingPayment && !isExpired;

      validation[contract.id_contracts] = {
        isExpired,
        hasPendingPayment,
        canCreatePayment,
        message: isExpired
          ? "Hợp đồng đã hết hạn"
          : hasPendingPayment
          ? "Có khoản thanh toán chưa hoàn thành"
          : "",
      };
    });

    setContractValidation(validation);
  };

  const selectedContract = contracts.find(
    (c) => c.id_contracts == formData.id_contracts
  );
  const roomInfo = selectedContract
    ? rooms.find((r) => r.id_rooms === selectedContract.id_rooms)
    : null;
  const userInfo = selectedContract
    ? users.find((u) => u.id_users === selectedContract.id_users)
    : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "id_contracts" && value) {
      const newSelectedContract = contracts.find(
        (c) => c.id_contracts == value
      );
      if (newSelectedContract) {
        const validation = contractValidation[value];

        if (validation && !validation.canCreatePayment) {
          toast.warning(
            validation.message ||
              "Không thể tạo khoản thanh toán cho hợp đồng này"
          );
        }

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
      toast.warning("Vui lòng chọn ngày thanh toán");
      return;
    }

    const validation = contractValidation[formData.id_contracts];
    if (validation && !validation.canCreatePayment) {
      toast.error(
        validation.message || "Không thể tạo khoản thanh toán cho hợp đồng này"
      );
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
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/payments",
        paymentData,
        { headers }
      );

      if (
        formData.status === "da thanh toan" &&
        response.data &&
        response.data.id_payments
      ) {
        const paymentDetailData = {
          id_payments: response.data.id_payments,
          typePay: paymentMethod,
          amountPay: parseInt(formData.amount, 10),
        };

        try {
          const detailResponse = await axios.post(
            "http://127.0.0.1:8000/api/payment-details",
            paymentDetailData,
            { headers }
          );

          console.log("Đã tạo chi tiết thanh toán:", detailResponse.data);
        } catch (detailError) {
          console.error("Lỗi khi tạo chi tiết thanh toán:", detailError);
          toast.warning(
            "Tạo khoản thanh toán thành công nhưng không thể lưu chi tiết thanh toán."
          );
        }
      }

      toast.success(
        <div>
          <p>Tạo khoản thanh toán thành công!</p>
          <p className="text-xs mt-1">
            ID thanh toán: {response.data.id_payments} | Hợp đồng:{" "}
            {formData.id_contracts}
          </p>
        </div>,
        { autoClose: 5000 }
      );

      console.log("Thanh toán đã được tạo:", {
        paymentId: response.data.id_payments,
        contractId: formData.id_contracts,
        amount: formData.amount,
        status: formData.status,
      });

      window.dispatchEvent(new Event("payment-data-changed"));
      window.dispatchEvent(new Event("contract-data-changed"));

      setFormData({
        id_contracts: contractId || "",
        amount: "",
        due_date: format(new Date(), "yyyy-MM-dd"),
        status: "chua thanh toan",
        payment_date: null,
        description: "",
      });

      setPaymentMethod("tien mat");

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

  const renderPriceBreakdown = () => {
    if (!selectedContract || !roomInfo) return null;

    let totalServiceCost = 0;

    if (Array.isArray(services)) {
      const processedServices = new Set();
      services.forEach((service) => {
        const name = service.service_name || service.nameService;
        if (!processedServices.has(name)) {
          totalServiceCost += Number(service.service_price || 0);
          processedServices.add(name);
        }
      });
    }

    const roomPrice = Number(roomInfo.price || 0);
    const monthlyFee = roomPrice * contractMonths;
    const totalAmount = monthlyFee + totalServiceCost;

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
              }).format(roomPrice)}{" "}
              × {contractMonths} tháng
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tiền phòng:</span>
            <span>
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(monthlyFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tổng tiền dịch vụ:</span>
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

  const isContractValid = contractId
    ? contractValidation[contractId]?.canCreatePayment
    : formData.id_contracts
    ? contractValidation[formData.id_contracts]?.canCreatePayment
    : true;

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
              const validation = contractValidation[contract.id_contracts];
              return (
                <option
                  key={contract.id_contracts}
                  value={contract.id_contracts}
                  disabled={validation && !validation.canCreatePayment}
                >
                  {user ? user.name : "Unknown"} -{" "}
                  {room ? `Phòng ${room.number}` : "Unknown"}
                  {validation && !validation.canCreatePayment
                    ? " (Không khả dụng)"
                    : ""}
                </option>
              );
            })}
          </select>
        </div>

        {selectedContract && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2 text-gray-800 flex items-center justify-between">
              <span>Thông tin hợp đồng</span>
              {contractValidation[selectedContract.id_contracts] &&
                !contractValidation[selectedContract.id_contracts]
                  .canCreatePayment && (
                  <span className="text-sm text-orange-600 flex items-center">
                    <FaExclamationTriangle className="mr-1" />
                    {contractValidation[selectedContract.id_contracts].message}
                  </span>
                )}
            </h3>

            <div className="mb-3">
              <ContractDateCalculator
                startDate={selectedContract.start_date}
                endDate={selectedContract.end_date}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <p>
                    <span className="font-medium">Phòng:</span>{" "}
                    {roomInfo ? roomInfo.number : "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Sinh viên:</span>{" "}
                    {userInfo ? userInfo.name : "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1"></div>
                <p className="mt-1">
                  <span className="font-medium">Giá phòng:</span>{" "}
                  {roomInfo
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(roomInfo.price || 0)
                    : "N/A"}
                </p>
              </div>
              <div>
                {renderContractServices()}
                {renderPriceBreakdown()}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
              className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày thanh toán
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

          <div>
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
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày thanh toán
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={
                    formData.payment_date || format(new Date(), "yyyy-MM-dd")
                  }
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="tien mat">Tiền mặt</option>
                  <option value="momo">Ví MoMo</option>
                  <option value="tai khoan ngan hang">
                    Chuyển khoản ngân hàng
                  </option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Nhập mô tả khoản thanh toán (tùy chọn)"
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows="1"
          />
        </div>

        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={
              submitting ||
              calculatingAmount ||
              !formData.id_contracts ||
              !formData.amount ||
              !isContractValid
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
