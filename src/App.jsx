import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";

function App() {
  // Bỏ qua kiểm tra đăng nhập, luôn coi như đã đăng nhập và là Admin
  // (Code này sẽ được thay thế khi chức năng đăng nhập được sửa)
  const isLoggedIn = true;
  const userRole = "Admin";

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Luôn hiển thị Sidebar */}
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Luôn hiển thị Header */}
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <Routes>
              {/* Route trang Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Route trang quản lý sinh viên */}
              <Route path="/users" element={<UsersPage />} />

              {/* Trang mặc định dẫn đến Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Các route khác sẽ được thêm sau */}
              {/* <Route path="/rooms" element={<div>Rooms Page</div>} />
              <Route path="/contracts" element={<div>Contracts Page</div>} />
              <Route path="/payments" element={<div>Payments Page</div>} /> */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
