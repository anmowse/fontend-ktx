import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import './DangKyNoiTru.css';

const Setting = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [message, setMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageColor, setPasswordMessageColor] = useState('red');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDataLocal = JSON.parse(localStorage.getItem('user'));
        if (!userDataLocal?.id_users) {
          setMessage('Không tìm thấy id_users trong localStorage');
          return;
        }
        const url = `${API_URL}/users/${userDataLocal.id_users}`;
        const res = await axios.get(url);
        setUserData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          role: res.data.role || ''
        });
      } catch (error) {
        setMessage('Không thể tải thông tin sinh viên');
      }
    };
    fetchUser();
  }, []);

  const handleChangePassword = () => setShowPasswordModal(true);
  const handleClosePasswordModal = () => setShowPasswordModal(false);

  const handleSubmitChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/change-password`,
        {
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setPasswordMessage('Đổi mật khẩu thành công!');
      setPasswordMessageColor('green');
      setPasswordForm({ old_password: '', new_password: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage('');
      }, 1500);
    } catch (error) {
      setPasswordMessage(
        error.response?.data?.message || 'Đổi mật khẩu thất bại!'
      );
      setPasswordMessageColor('red');
    }
  };

  return (
    <div style={{
      maxWidth: 420,
      margin: '40px auto',
      background: '#fff',
      padding: 32,
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)'
    }}>
      <h2 style={{
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 28,
        textAlign: 'center',
        color: '#1d3557'
      }}>Thông tin tài khoản</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Họ và tên:</span>
          <span>{userData.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Email:</span>
          <span>{userData.email}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Số điện thoại:</span>
          <span>{userData.phone}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Vai trò:</span>
          <span>{userData.role}</span>
        </div>
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            className="submit-button"
            style={{
              background: '#f59e0b',
              color: '#fff',
              fontWeight: 600,
              padding: '10px 28px',
              borderRadius: 6,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={handleChangePassword}
          >
            Đổi mật khẩu
          </button>
        </div>
        {message && <div className="message" style={{ marginTop: 10, color: 'red', textAlign: 'center' }}>{message}</div>}
      </div>

      {/* Modal đổi mật khẩu đơn giản */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, position: 'relative' }}>
            <button onClick={handleClosePasswordModal} style={{ position: 'absolute', top: 8, right: 12, fontSize: 20, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ marginBottom: 16 }}>Đổi mật khẩu</h3>
            <form onSubmit={handleSubmitChangePassword}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 500 }}>Mật khẩu cũ:</label>
                <input
                  type="password"
                  name="old_password"
                  value={passwordForm.old_password}
                  onChange={e => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: 500 }}>Mật khẩu mới:</label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordForm.new_password}
                  onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: '#1d3557', color: '#fff', fontWeight: 600, padding: '8px 24px',
                  borderRadius: 6, fontSize: 15, border: 'none', cursor: 'pointer', width: '100%'
                }}
              >
                Xác nhận đổi mật khẩu
              </button>
              {passwordMessage && <div style={{ color: passwordMessageColor, marginTop: 10, textAlign: 'center' }}>{passwordMessage}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Setting;
  