import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import Sidebar from '../../components/user/Sidebar';
import axios from 'axios';
import API_URL from '../../config/api';
import './DangKyNoiTru.css';

const DangKyNoiTru = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    tenSinhVien: '',
    email: '',
    soDienThoai: '',
    loaiPhong: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');

  // Fetch rooms when component mounts
  useEffect(() => {
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/rooms`);
        // Lọc và nhóm các phòng theo loại
        const roomTypes = response.data.reduce((acc, room) => {
          if (!acc[room.type]) {
            acc[room.type] = {
              type: room.type,
              price: room.price,
              count: 1
            };
          } else {
            acc[room.type].count++;
          }
          return acc;
        }, {});
        
        setRooms(Object.values(roomTypes));
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Không thể tải danh sách loại phòng. Vui lòng thử lại sau.');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Gửi dữ liệu đăng ký lên server
      const response = await axios.post(`${API_URL}/users`, {
        name: formData.tenSinhVien,
        email: formData.email,
        phone: formData.soDienThoai,
        room_type: formData.loaiPhong,
        role: 'student' // Mặc định là sinh viên
      });
      
      // Hiển thị thông báo thành công
      setMessage('Đăng ký nội trú thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      
      // Reset form
      setFormData({
        tenSinhVien: '',
        email: '',
        soDienThoai: '',
        loaiPhong: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="dang-ky-form">
      <h2>ĐĂNG KÝ NỘI TRÚ KTX</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tenSinhVien">Tên sinh viên:</label>
          <input
            type="text"
            id="tenSinhVien"
            name="tenSinhVien"
            value={formData.tenSinhVien}
            onChange={handleChange}
            required
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Nhập email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="soDienThoai">Số điện thoại:</label>
          <input
            type="tel"
            id="soDienThoai"
            name="soDienThoai"
            value={formData.soDienThoai}
            onChange={handleChange}
            required
            placeholder="Nhập số điện thoại"
          />
        </div>

              <div className="form-group">
                <label htmlFor="loaiPhong">Loại phòng:</label>
                {loadingRooms ? (
                  <div className="loading-room-types">Đang tải danh sách loại phòng...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <select
                    id="loaiPhong"
                    name="loaiPhong"
                    value={formData.loaiPhong}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Chọn loại phòng</option>
                    {rooms.map(room => (
                      <option key={room.type} value={room.type}>
                        {room.type} - {room.price.toLocaleString('vi-VN')} VNĐ/tháng (Còn {room.count} phòng)
                      </option>
                    ))}
                  </select>
                )}
              </div>

        <button type="submit" className="submit-button">
          Đăng ký
        </button>
      </form>
    </div>
  );
};

export default DangKyNoiTru; 