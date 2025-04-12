import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
        <Routes>
          {/* Public route - Login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes for Admin */}
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

          {/* Thêm route cho Quản lý phòng */}
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

          {/* Thêm route cho Quản lý hợp đồng */}
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

          {/* Protected routes for all users */}
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
          {/* Routes của User */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Welcome />} />
            <Route path="dang-ky-noi-tru" element={<DangKyNoiTru />} />
            <Route path="contracts" element={<XemHopDong />} />
            <Route path="contracts/:id" element={<ContractDetail />} />
            <Route path="thanh-toan-tien-phong" element={<ThanhToanTienPhong />} />
            <Route path="extend-contract/:contractId" element={<GiaHanHopDong />} />
          </Route>

          {/* Catch all other routes */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
