import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';

const GiaHanHopDong = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/contracts/${contractId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });

        const contractData = response.data;
        setContract(contractData);

        // Đặt giá trị mặc định cho form
        setFormData({
          start_date: contractData.end_date, // Ngày bắt đầu mới = ngày kết thúc cũ
          end_date: calculateDefaultEndDate(contractData.end_date),
          amount: contractData.amount,
          description: 'Gia hạn hợp đồng'
        });
      } catch (err) {
        console.error('Lỗi khi lấy thông tin hợp đồng:', err);
        setError('Không thể tải thông tin hợp đồng');
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [contractId]);

  // Tính ngày kết thúc mặc định (6 tháng từ ngày bắt đầu)
  const calculateDefaultEndDate = (startDate) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + 6);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API để cập nhật hợp đồng
      await axios.put(`${API_URL}/contracts/${contractId}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      alert('Gia hạn hợp đồng thành công!');
      navigate('/user/contracts');
    } catch (err) {
      console.error('Lỗi khi gia hạn hợp đồng:', err);
      setError('Có lỗi xảy ra khi gia hạn hợp đồng');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Gia Hạn Hợp Đồng
        </h2>

        {error && (
          <div className="mb-6">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          </div>
        )}

        {contract && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin hợp đồng hiện tại */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin hợp đồng hiện tại:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Mã hợp đồng:</p>
                  <p className="font-medium">{contract.id_contracts}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phòng:</p>
                  <p className="font-medium">{contract.number}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày bắt đầu cũ:</p>
                  <p className="font-medium">{new Date(contract.start_date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ngày kết thúc cũ:</p>
                  <p className="font-medium">{new Date(contract.end_date).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Giá hiện tại:</p>
                  <p className="font-medium">{formatCurrency(contract.amount)}</p>
                </div>
              </div>
            </div>

            {/* Form gia hạn */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Thông tin gia hạn:</h3>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ngày bắt đầu mới:
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ngày kết thúc mới:
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Giá thuê mới:
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Giá hiển thị: {formatCurrency(formData.amount)}
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Ghi chú:
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/user/contracts')}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Xác nhận gia hạn
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default GiaHanHopDong; 