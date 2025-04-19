import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AuthProvider,
  LoginPage,
  ProtectedRoute,
  Header,
} from "./contexts/admin/AuthContext";
import Dashboard from "./components/admin/Dashboard";
import UsersPage from "./components/admin/users/UsersPage";
import Sidebar from "./components/admin/Sidebar";
import RoomManagement from "./pages/admin/RoomManagement";
import ContractManagement from "./pages/admin/ContractManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import ServiceManagement from "./pages/admin/ServiceManagement";
import PaymentDetail from "./components/admin/payment/PaymentDetail";
import ServiceDetail from "./components/admin/service/ServiceDetail";
import UserLayout from "./components/user/UserLayout";
import DangKyNoiTru from "./pages/user/DangKyNoiTru";
import ThanhToanTienPhong from "./pages/user/ThanhToanTienPhong";
import XemHopDong from "./pages/user/XemHopDong";
import GiaHanHopDong from "./pages/user/GiaHanHopDong";
import ContractDetail from "./components/admin/contract/ContractDetail";
import Welcome from "./pages/user/Welcome";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Route công khai - Trang đăng nhập */}
          <Route path="/login" element={<LoginPage />} />

          {/* Route bảo vệ dành cho Admin */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                      <Dashboard />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route cho quản lý sinh viên */}
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                      <UsersPage />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route cho quản lý phòng */}
          <Route
            path="/rooms"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                      <RoomManagement />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route cho quản lý hợp đồng */}
          <Route
            path="/contracts"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                      <ContractManagement />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route cho quản lý thanh toán */}
          <Route
            path="/payments"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                      <PaymentManagement />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route chi tiết thanh toán */}
          <Route
            path="/payments/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                      <PaymentDetail />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route cho quản lý dịch vụ */}
          <Route
            path="/services"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                      <ServiceManagement />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route chi tiết dịch vụ */}
          <Route
            path="/services/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
                      <ServiceDetail />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route bảo vệ dành cho tất cả người dùng */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-100">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                      <Dashboard />
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Route dành cho User */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Welcome />} />
            <Route path="dang-ky-noi-tru" element={<DangKyNoiTru />} />
            <Route path="contracts" element={<XemHopDong />} />
            <Route path="contracts/:id" element={<ContractDetail />} />
            <Route
              path="thanh-toan-tien-phong"
              element={<ThanhToanTienPhong />}
            />
            <Route
              path="extend-contract/:contractId"
              element={<GiaHanHopDong />}
            />
          </Route>

          {/* Route bắt tất cả các đường dẫn khác */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
