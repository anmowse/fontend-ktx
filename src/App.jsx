import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";

// Tạm thời import các trang chưa tồn tại (bạn sẽ tạo sau)
// import UsersPage from './pages/UsersPage';
// import RoomsPage from './pages/RoomsPage';
// import ContractsPage from './pages/ContractsPage';
// import PaymentsPage from './pages/PaymentsPage';

function App() {
  // Kiểm tra xem người dùng đã đăng nhập chưa (đây là ví dụ đơn giản)
  // Trong thực tế, bạn sẽ sử dụng state management (như Redux) hoặc context API
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole");

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {isLoggedIn && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoggedIn && <Header />}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <Routes>
              {/* Điều hướng đến trang login nếu chưa đăng nhập */}
              <Route path="/login" element={<LoginPage />} />

              {/* Bảo vệ các route yêu cầu đăng nhập */}
              <Route
                path="/dashboard"
                element={
                  isLoggedIn && userRole === "Admin" ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Các route khác sẽ được thêm sau */}
              {/* <Route path="/users" element={<UsersPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/contracts" element={<ContractsPage />} />
              <Route path="/payments" element={<PaymentsPage />} /> */}

              {/* Chuyển đến dashboard nếu là admin, hoặc login nếu chưa đăng nhập */}
              <Route
                path="/"
                element={
                  isLoggedIn ? (
                    userRole === "Admin" ? (
                      <Navigate to="/dashboard" />
                    ) : (
                      <div>User Home</div>
                    )
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
