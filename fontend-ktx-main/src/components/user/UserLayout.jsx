import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import Sidebar from './Sidebar';
import './UserLayout.css';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="user-layout">
      <Sidebar />
      <div className="main-content">
        <div className="header">
          <div className="header-content">
            <h1>Đại Học Công Nghệ Sài Gòn</h1>
            <div className="user-info">
              {user ? (
                <>
                  <span className="user-name">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="logout-button"
                  >
                    {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                  </button>
                </>
              ) : (
                <button onClick={handleLogin} className="login-button">
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="content">
          <Outlet />
          {!window.location.pathname.includes('/user/dang-ky-noi-tru') && (
            <>
              <p className="footer-text">Phát triển bởi Nhóm 9</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLayout; 