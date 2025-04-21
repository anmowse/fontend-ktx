import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon as SearchIcon,
  FunnelIcon as FilterIcon,
  ArrowsUpDownIcon as SortAscendingIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import UserTable from "./UserTable";
import UserForm from "./UserForm";
import UserDetails from "./UserDetails";
import userService from "../../../services/admin/userService";

const UsersPage = () => {
  // State quản lý danh sách users
  const [users, setUsers] = useState([]);

  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  // State quản lý lỗi
  const [error, setError] = useState(null);

  // State quản lý từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State quản lý hiển thị form
  const [showForm, setShowForm] = useState(false);

  // State quản lý user đang được thao tác
  const [currentUser, setCurrentUser] = useState(null);

  // State quản lý hiển thị chi tiết user
  const [showDetails, setShowDetails] = useState(false);

  // State quản lý lọc theo vai trò
  const [filterRole, setFilterRole] = useState("all");

  // State quản lý sắp xếp
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm fetch danh sách users từ API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách sinh viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm tìm kiếm users
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Nếu không có từ khóa, lấy tất cả users
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      const data = await userService.searchUsers(searchTerm);
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Không thể tìm kiếm sinh viên. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Hàm mở form thêm mới user
  const handleAddUser = () => {
    setCurrentUser(null);
    setShowForm(true);
    setShowDetails(false);
  };

  // Hàm mở form chỉnh sửa user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowForm(true);
    setShowDetails(false);
  };

  // Hàm mở chi tiết user
  const handleViewDetails = async (user) => {
    setCurrentUser(user);
    setShowDetails(true);
    setShowForm(false);
  };

  // Hàm xóa user
  const handleDeleteUser = async (userId) => {
    try {
      // Kiểm tra trạng thái hợp đồng và thanh toán của user
      let userStatus;
      try {
        userStatus = await userService.checkUserContractStatus(userId);
      } catch (statusError) {
        console.error("Lỗi khi kiểm tra trạng thái:", statusError);
        // Nếu không kiểm tra được, giả định không có hợp đồng hoặc thanh toán
        userStatus = { hasActiveContracts: false, hasUnpaidPayments: false };
      }

      if (userStatus.hasActiveContracts) {
        setError("Không thể xóa sinh viên vì còn hợp đồng đang có hiệu lực.");
        return;
      }

      if (userStatus.hasUnpaidPayments) {
        setError(
          "Không thể xóa sinh viên vì còn khoản thanh toán chưa hoàn thành."
        );
        return;
      }

      // Lấy thông tin phòng nếu có thể
      let userWithRoomInfo = null;
      try {
        userWithRoomInfo = await userService.getUserWithRoomInfo(userId);
      } catch (roomError) {
        console.error("Lỗi khi lấy thông tin phòng:", roomError);
        // Tiếp tục xóa user ngay cả khi không lấy được thông tin phòng
      }

      // Xóa user
      await userService.deleteUser(userId);

      // Nếu user có liên kết với phòng, cập nhật current_occupancy của phòng đó
      if (userWithRoomInfo && userWithRoomInfo.roomId) {
        try {
          await userService.updateRoomOccupancy(userWithRoomInfo.roomId, -1);
        } catch (roomUpdateError) {
          console.error(
            "Lỗi khi cập nhật số người trong phòng:",
            roomUpdateError
          );
        }
      }

      fetchUsers(); // Refresh danh sách
      setError(null);
      alert("Xóa sinh viên thành công!");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        "Không thể xóa sinh viên. Sinh viên có thể đang có hợp đồng hoặc dữ liệu liên quan."
      );
    }
  };

  // Hàm xử lý submit form
  const handleFormSubmit = async (userData, isEdit) => {
    try {
      if (isEdit) {
        // Cập nhật user
        await userService.updateUser(userData.id_users, userData);
        alert("Cập nhật sinh viên thành công!");
      } else {
        // Thêm user mới
        await userService.createUser(userData);
        alert("Thêm sinh viên thành công!");
      }
      fetchUsers(); // Refresh danh sách
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting user form:", err);
      return Promise.reject(
        err?.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu."
      );
    }
  };

  // Hàm đóng form
  const handleFormCancel = () => {
    setShowForm(false);
  };

  // Hàm đóng chi tiết user
  const handleDetailsClose = () => {
    setShowDetails(false);
  };

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Hàm thay đổi bộ lọc vai trò
  const handleFilterChange = (e) => {
    setFilterRole(e.target.value);
    setCurrentPage(1); // Reset về trang 1
  };

  // Hàm thay đổi trường sắp xếp
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset về trang 1
  };

  // Hàm đảo chiều sắp xếp
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Lọc và sắp xếp danh sách users
  let filteredUsers = [...users];

  // Áp dụng bộ lọc vai trò
  if (filterRole !== "all") {
    filteredUsers = filteredUsers.filter((user) => user.role === filterRole);
  }

  // Áp dụng sắp xếp
  filteredUsers.sort((a, b) => {
    if (sortBy === "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "email") {
      return sortDirection === "asc"
        ? a.email.localeCompare(b.email)
        : b.email.localeCompare(a.email);
    }
    return 0;
  });

  // Tính toán phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Quản lý Sinh viên
      </h1>

      {/* Hiển thị thông báo lỗi */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Phần tìm kiếm và lọc */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex space-x-2">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          {/* Dropdown lọc theo vai trò */}
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={handleFilterChange}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
            <FilterIcon className="h-5 w-5 absolute right-2 top-2 text-gray-400 pointer-events-none" />
          </div>

          {/* Dropdown sắp xếp */}
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="name">Sắp xếp theo tên</option>
              <option value="email">Sắp xếp theo email</option>
            </select>
            <button
              onClick={toggleSortDirection}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
            >
              <SortAscendingIcon
                className={`h-5 w-5 ${
                  sortDirection === "desc" ? "transform rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Nút thêm mới */}
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          // Hiển thị loading spinner
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : showForm ? (
          // Hiển thị form thêm/sửa
          <UserForm
            user={currentUser}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        ) : showDetails ? (
          // Hiển thị chi tiết user
          <UserDetails
            userId={currentUser.id_users}
            onClose={handleDetailsClose}
          />
        ) : (
          // Hiển thị bảng danh sách
          <>
            <UserTable
              users={currentItems}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onViewDetails={handleViewDetails}
            />

            {/* Phân trang */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center">
              <div className="flex space-x-1 mt-2 sm:mt-0">
                {/* Nút Previous */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  &laquo;
                </button>

                {/* Các nút số trang */}
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => handlePageChange(number + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}

                {/* Nút Next */}
                <button
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  &raquo;
                </button>
              </div>

              {/* Thông tin phân trang */}
              <div className="text-sm text-gray-700 mt-2 sm:mt-0">
                Hiển thị {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredUsers.length)} của{" "}
                {filteredUsers.length} sinh viên
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
