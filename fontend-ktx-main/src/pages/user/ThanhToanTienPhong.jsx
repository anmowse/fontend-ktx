import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';
import './XemHopDong.css';

const ThanhToanTienPhong = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [success, setSuccess] = useState('');
  const [currentContract, setCurrentContract] = useState(null);
  const [checkingContract, setCheckingContract] = useState(true);

  // Lấy hợp đồng hiện tại của user
  useEffect(() => {
    const fetchCurrentContract = async () => {
      setCheckingContract(true);
      try {
        if (!user?.id_users) {
          setCurrentContract(null);
          setCheckingContract(false);
          return;
        }
        const res = await axios.get(`${API_URL}/users/${user.id_users}/contracts`);
        let contracts = res.data;
        console.log('Danh sách hợp đồng:', contracts);
        if (!Array.isArray(contracts)) contracts = [contracts];
        const today = new Date();
        let validContract = contracts.find(c => new Date(c.end_date) > today);
        if (!validContract && contracts.length > 0) validContract = contracts[0];
        const finalContract = validContract && new Date(validContract.end_date) > today ? validContract : null;
        console.log('Hợp đồng hiện tại:', finalContract);
        setCurrentContract(finalContract);
      } catch (err) {
        console.error('Lỗi khi lấy hợp đồng:', err);
        setCurrentContract(null);
      } finally {
        setCheckingContract(false);
      }
    };
    fetchCurrentContract();
  }, [user]);

  // Lấy danh sách hóa đơn của hợp đồng hiện tại
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.id_users) {
        console.log('Không có user:', user);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log('Đang lấy hóa đơn cho user:', user.id_users);
        const response = await axios.get(`${API_URL}/users/${user.id_users}/payments`);
        console.log('Kết quả hóa đơn thô:', response.data);
        if (response.data) {
          setPayments(response.data);
        } else {
          setPayments([]);
          setError('Không tìm thấy thông tin thanh toán.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy hóa đơn:', err);
        setError('Không thể tải thông tin thanh toán. Vui lòng thử lại sau.');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [user]);

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

  // Xử lý thanh toán hóa đơn
  const handlePay = async (id) => {
    setPayingId(id);
    setSuccess('');
    try {
      await axios.put(`${API_URL}/payments/${id}`, { status: 'da thanh toan' });
      setSuccess('Thanh toán thành công!');
      // Reload lại danh sách hóa đơn
      const response = await axios.get(`${API_URL}/users/${user.id_users}/payments`);
      if (response.data) {
        // Lọc hóa đơn theo hợp đồng hiện tại
        const contractPayments = response.data.filter(payment => 
          payment.number === currentContract.number
        );
        setPayments(contractPayments);
      }
    } catch (err) {
      setError('Không thể thanh toán hóa đơn. Vui lòng thử lại.');
    } finally {
      setPayingId(null);
    }
  };

  // Map tên trường sang tiếng Việt có dấu
  const fieldMap = {
    id_payments: 'Mã thanh toán',
    name: 'Tên sinh viên',
    number: 'Số phòng',
    amount: 'Tổng số tiền',
    due_date: 'Hạn thanh toán',
  };

  // Lấy danh sách các trường cần hiển thị (không bao gồm status và amountPay)
  const displayFields = Object.keys(payments[0] || {}).filter(key => key !== 'status' && key !== 'amountPay');

  return (
    <div className="payment-container">
      <h2>THANH TOÁN TIỀN PHÒNG</h2>
      {success && <div className="message success">{success}</div>}
      {loading ? (
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : payments.length === 0 ? (
        <div className="message">Bạn chưa có hóa đơn thanh toán nào.</div>
      ) : (
        <div className="payment-list">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                {displayFields.map((key) => (
                  <th key={key} className="py-2 px-4 border-b">{fieldMap[key] || key}</th>
                ))}
                <th className="py-2 px-4 border-b">Trạng thái</th>
                <th className="py-2 px-4 border-b"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, idx) => (
                <tr key={idx}>
                  {displayFields.map((key) => (
                    <td key={key} className="py-2 px-4 border-b text-center">
                      {key === 'amount' ? formatCurrency(payment[key]) : key === 'due_date' ? formatDate(payment[key]) : payment[key]}
                    </td>
                  ))}
                  <td className="py-2 px-4 border-b text-center">{getStatusText(payment.status)}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {payment.status?.toLowerCase() === 'chua thanh toan' ? (
                      <button
                        className="payment-button bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
                        onClick={() => handlePay(payment.id_payments)}
                        disabled={payingId === payment.id_payments}
                      >
                        {payingId === payment.id_payments ? 'Đang xử lý...' : 'Thanh toán'}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ThanhToanTienPhong; 