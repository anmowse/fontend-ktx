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
    phong: '',
    dichVu: []
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [errorServices, setErrorServices] = useState('');
  const [currentContract, setCurrentContract] = useState(null);
  const [checkingContract, setCheckingContract] = useState(true);

  // Kiểm tra hợp đồng hiện tại của sinh viên
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
        if (!Array.isArray(contracts)) contracts = [contracts];
        const today = new Date();
        let validContract = contracts.find(c => new Date(c.end_date) > today);
        if (!validContract && contracts.length > 0) validContract = contracts[0];
        setCurrentContract(validContract && new Date(validContract.end_date) > today ? validContract : null);
      } catch (err) {
        setCurrentContract(null);
      } finally {
        setCheckingContract(false);
      }
    };
    fetchCurrentContract();
  }, [user]);

  useEffect(() => {
    if (currentContract) return;
    const fetchRooms = async () => {
      setLoadingRooms(true);
      setError('');
      try {
        const response = await axios.get(`${API_URL}/rooms`);
        const roomsData = response.data;
        const roomsWithCount = await Promise.all(
          roomsData.map(async (room) => {
            try {
              const slRes = await axios.get(`${API_URL}/room/${room.id_rooms}/sl-users`);
              let max = room.max_occupants;
              if (!max && room.type) {
                const match = room.type.match(/\d+/);
                max = match ? parseInt(match[0]) : 0;
              }
              return {
                ...room,
                current: slRes.data || 0,
                max: max || 0,
                empty: (max || 0) - (slRes.data || 0)
              };
            } catch (e) {
              return { ...room, current: 0, max: 0, empty: 0 };
            }
          })
        );
        setRooms(roomsWithCount);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [currentContract]);

  useEffect(() => {
    if (currentContract) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      setErrorServices('');
      try {
        const res = await axios.get(`${API_URL}/services`);
        setServices(res.data);
      } catch (err) {
        setErrorServices('Không thể tải danh sách dịch vụ.');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [currentContract]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'dichVu') {
      setFormData((prev) => {
        if (checked) {
          return { ...prev, dichVu: [...prev.dichVu, value] };
        } else {
          return { ...prev, dichVu: prev.dichVu.filter((v) => v !== value) };
        }
      });
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post(`${API_URL}/users`, {
        name: formData.tenSinhVien,
        email: formData.email,
        phone: formData.soDienThoai,
        id_rooms: formData.phong,
        services: formData.dichVu,
        role: 'student'
      });
      
      setMessage('Đăng ký nội trú thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      
      setFormData({
        tenSinhVien: '',
        email: '',
        soDienThoai: '',
        phong: '',
        dichVu: []
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
      {checkingContract ? (
        <div className="loading-room-types">Đang kiểm tra hợp đồng hiện tại...</div>
      ) : currentContract ? (
        <div className="message success" style={{background:'#e0f2fe', color:'#0369a1'}}>
          Bạn đã có hợp đồng hiện tại có hiệu lực đến ngày <b>{new Date(currentContract.end_date).toLocaleDateString('vi-VN')}</b>.
        </div>
      ) : (
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
          <label htmlFor="phong">Chọn phòng:</label>
          {loadingRooms ? (
            <div className="loading-room-types">Đang tải danh sách phòng...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <select
              id="phong"
              name="phong"
              value={formData.phong}
              onChange={handleChange}
              required
            >
              <option value="">Chọn phòng</option>
              {rooms.map(room => (
                <option key={room.id_rooms} value={room.id_rooms} disabled={room.empty <= 0}>
                  {room.number} - {room.type} - {room.price?.toLocaleString('vi-VN')} VNĐ/tháng (Còn {room.empty} chỗ)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-group">
          <label>Dịch vụ đăng ký:</label>
          {loadingServices ? (
            <div className="loading-room-types">Đang tải dịch vụ...</div>
          ) : errorServices ? (
            <div className="error-message">{errorServices}</div>
          ) : (
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem'}}>
              {services.map(service => (
                <label key={service.id_service} style={{minWidth: '200px'}}>
                  <input
                    type="checkbox"
                    name="dichVu"
                    value={service.id_service}
                    checked={formData.dichVu.includes(String(service.id_service))}
                    onChange={handleChange}
                  />
                  {service.nameService} - {service.priceService?.toLocaleString('vi-VN')} VNĐ
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
        {message && <div className="message">{message}</div>}
      </form>
      )}
    </div>
  );
};

export default DangKyNoiTru; 