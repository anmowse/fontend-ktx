import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';
import './XemHopDong.css';

const ThanhToanTienPhong = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState({});

  // Tự động lấy dữ liệu khi component được mount và user đã đăng nhập
  useEffect(() => {
    if (user?.id_users) {
      fetchPayments(user.id_users);
    }
  }, [user]);

  // Hàm xử lý tìm kiếm
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setError('Vui lòng nhập mã sinh viên');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users/${searchId}/payments`);
      if (response.data) {
        setPayments(response.data);
        await fetchPaymentDetails(response.data);
      } else {
        setPayments([]);
        setError('Không tìm thấy thông tin thanh toán cho mã sinh viên này');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Không thể tải thông tin thanh toán. Vui lòng thử lại sau.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy danh sách thanh toán
  const fetchPayments = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/payments`);
      if (response.data) {
        setPayments(response.data);
        // Lấy chi tiết cho mỗi khoản thanh toán
        await fetchPaymentDetails(response.data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Không thể tải thông tin thanh toán. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy chi tiết thanh toán
  const fetchPaymentDetails = async (payments) => {
    try {
      const details = {};
      await Promise.all(
        payments.map(async (payment) => {
          const response = await axios.get(`${API_URL}/payment-details/${payment.id_payments}`);
          details[payment.id_payments] = response.data;
        })
      );
      setPaymentDetails(details);
    } catch (err) {
      console.error('Error fetching payment details:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'da thanh toan':
        return 'text-green-600 bg-green-100';
      case 'unpaid':
      case 'chua thanh toan':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'da thanh toan':
        return 'Đã thanh toán';
      case 'unpaid':
      case 'chua thanh toan':
        return 'Chưa thanh toán';
      default:
        return status || 'Không xác định';
    }
  };

  return (
    <div className="payment-container">
      <h2>THANH TOÁN TIỀN PHÒNG</h2>

      {/* Form tìm kiếm */}
      <div className="search-form">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Nhập mã sinh viên"
            className="w-full p-3 border rounded-md"
          />
            <div className="ml-4">
            <button type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 min-w-[140px]">
            Tìm kiếm
          </button>

            </div>
          
        </form>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : payments.length === 0 ? (
        <div className="message">
          {searchId ? 'Không tìm thấy hóa đơn thanh toán cho mã sinh viên này' : 'Vui lòng nhập mã sinh viên để tìm kiếm'}
        </div>
      ) : (
        <div className="payment-list">
          {payments.map((payment) => (
            <div key={payment.id_payments} className="payment-item">
              <div className="payment-header">
                <h3>Hóa đơn #{payment.id_payments}</h3>
                <span className={`payment-status ${payment.status?.toLowerCase() === 'da thanh toan' ? 'paid' : 'unpaid'}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Kỳ thanh toán:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(payment.payment_date)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Hạn thanh toán:</span>
                  <span className="ml-2 font-medium">
                    {formatDate(payment.due_date)}
                  </span>
                </div>
              </div>

              {paymentDetails[payment.id_payments] && (
                <div className="payment-details">
                  <h4 className="font-semibold mb-2">Chi tiết thanh toán:</h4>
                  <div className="space-y-2">
                    {paymentDetails[payment.id_payments].map((detail, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span>{detail.description}</span>
                        <span className="font-medium">{formatCurrency(detail.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="payment-total">
                    <span>Tổng cộng:</span>
                    <span className="text-lg">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
              )}

              {payment.status?.toLowerCase() === 'chua thanh toan' && (
                <div className="mt-4">
                  <button className="payment-button w-full">
                    Thanh toán ngay
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThanhToanTienPhong; 