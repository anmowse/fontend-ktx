import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';

const GiaHanHopDong = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [canRenew, setCanRenew] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const fetchUserContract = async () => {
      setLoading(true);
      setError('');
      try {
        if (!user?.id_users) {
          setError('Vui lòng đăng nhập để gia hạn hợp đồng.');
          setLoading(false);
          return;
        }
        const res = await axios.get(`${API_URL}/users/${user.id_users}/contracts`);
        let contracts = res.data;
        if (!Array.isArray(contracts)) contracts = [contracts];
        // Lấy hợp đồng còn hiệu lực gần nhất (end_date > hôm nay)
        const today = new Date();
        let validContract = contracts.find(c => new Date(c.end_date) > today);
        if (!validContract && contracts.length > 0) validContract = contracts[0];
        if (!validContract) {
          setError('Bạn chưa có hợp đồng nào còn hiệu lực.');
          setLoading(false);
          return;
        }
        setContract(validContract);
        // Tính số ngày còn lại
        const endDate = new Date(validContract.end_date);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays);
        setCanRenew(diffDays <= 31);
      } catch (err) {
        setError('Không thể tải thông tin hợp đồng.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserContract();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(`${API_URL}/contracts/${contract.id_contracts}`, {
        appointment_date: appointmentDate,
        status: 'pending_renewal'
      });
      setSuccess('Đặt lịch hẹn ký hợp đồng thành công! Vui lòng đến đúng giờ đã chọn.');
      setTimeout(() => navigate('/user/contracts'), 2000);
    } catch (err) {
      setError('Không thể đặt lịch hẹn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtendContract = async (contractId) => {
    try {
      // Điều hướng đến trang gia hạn hợp đồng
      navigate(`/user/extend-contract/${contractId}`);
    } catch (error) {
      console.error('Lỗi khi gia hạn hợp đồng:', error);
      alert('Có lỗi xảy ra khi gia hạn hợp đồng. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-800">Đặt lịch hẹn ký hợp đồng gia hạn</h2>
      {loading ? (
        <div className="text-center text-gray-500">Đang tải thông tin hợp đồng...</div>
      ) : error ? (
        <div className="text-center text-red-600 mb-4">{error}</div>
      ) : contract ? (
        <>
          <div className="mb-6 bg-gray-50 p-4 rounded">
            <div className="mb-2"><span className="font-semibold">Phòng:</span> {contract.number}</div>
            <div className="mb-2"><span className="font-semibold">Ngày bắt đầu:</span> {new Date(contract.start_date).toLocaleDateString('vi-VN')}</div>
            <div className="mb-2"><span className="font-semibold text-red-700">Ngày kết thúc hiện tại:</span> <span className="text-red-600 font-bold">{new Date(contract.end_date).toLocaleDateString('vi-VN')}</span></div>
            <div className="mb-2"><span className="font-semibold">Còn lại:</span> <span className="text-blue-700 font-bold">{daysLeft} ngày</span></div>
          </div>
          {!canRenew ? (
            <div className="text-center text-yellow-600 font-semibold text-lg py-8">
              Chưa đến kỳ gia hạn hợp đồng. Bạn chỉ có thể đặt lịch khi còn dưới 1 tháng (31 ngày) trước ngày kết thúc hợp đồng.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-blue-700 font-semibold mb-2">Chọn ngày đến ký hợp đồng gia hạn tại Văn phòng KTX:</label>
                <input
                  type="datetime-local"
                  className="border rounded px-3 py-2 w-full"
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0,16)}
                />
                <p className="text-xs text-gray-500 mt-1">Vui lòng chọn ngày và giờ bạn sẽ đến ký hợp đồng tại văn phòng KTX.</p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                disabled={submitting}
              >
                {submitting ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
              </button>
              {success && <div className="text-green-600 text-center mt-2">{success}</div>}
              {error && <div className="text-red-600 text-center mt-2">{error}</div>}
            </form>
          )}
        </>
      ) : null}
    </div>
  );
};

export default GiaHanHopDong; 