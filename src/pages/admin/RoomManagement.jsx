import React, { useState, useEffect } from "react";
import { FaPlus, FaTable, FaTh, FaTrash } from "react-icons/fa";
import axios from "axios";

// Import các components
import RoomList from "../../components/admin/room/RoomList";
import RoomCard from "../../components/admin/room/RoomCard";
import RoomForm from "../../components/admin/room/RoomForm";
import RoomFilter from "../../components/admin/room/RoomFilter";
import RoomDetail from "../../components/admin/room/RoomDetail";
import API_URL from "../../config/api"; 
// Định nghĩa API URL

const RoomManagement = () => {
  // States
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    buildingId: "all",
    roomType: "all",
    priceMin: "",
    priceMax: "",
    occupancyStatus: "all",
    searchTerm: "",
  });

  // Xóa nếu không sử dụng
  // Hoặc thêm các state này nếu muốn sử dụng
  const [deletingRoom, setDeletingRoom] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch rooms and buildings data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch rooms
        const roomsResponse = await axios.get(`${API_URL}/rooms`);
        setRooms(roomsResponse.data);

        // Fetch buildings
        const buildingsResponse = await axios.get(`${API_URL}/buildings`);
        setBuildings(buildingsResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          "Không thể tải dữ liệu phòng và tòa nhà. Vui lòng thử lại sau."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter rooms based on current filters
  const filteredRooms = rooms.filter((room) => {
    // Filter by building
    if (
      filters.buildingId !== "all" &&
      room.id_buildings !== parseInt(filters.buildingId)
    ) {
      return false;
    }

    // Filter by room type
    if (filters.roomType !== "all" && room.type !== filters.roomType) {
      return false;
    }

    // Filter by occupancy status
    if (filters.occupancyStatus !== "all") {
      const maxOccupants = parseInt(room.type.split(" ")[0]);
      const isFull = room.current_occupancy >= maxOccupants;

      if (filters.occupancyStatus === "available" && isFull) return false;
      if (filters.occupancyStatus === "full" && !isFull) return false;
    }

    // Filter by price range
    if (filters.priceMin && room.price < parseFloat(filters.priceMin))
      return false;
    if (filters.priceMax && room.price > parseFloat(filters.priceMax))
      return false;

    // Filter by search term
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      return room.number.toString().toLowerCase().includes(searchTermLower);
    }

    return true;
  });

  // Find building by ID
  const findBuilding = (buildingId) => {
    return (
      buildings.find((building) => building.id_buildings === buildingId) || null
    );
  };

  // Handle view room details
  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setIsDetailOpen(true);
  };

  // Handle edit room
  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setIsFormOpen(true);
  };

  // Handle add new room
  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsFormOpen(true);
  };

  // Thay thế hàm handleDeleteRoom hiện tại bằng phiên bản đơn giản này
  const handleDeleteRoom = async (room) => {
    // Lấy thông tin phòng để hiển thị thông báo xác nhận
    let roomId, roomNumber;

    if (typeof room === "object" && room !== null) {
      roomId = room.id_rooms;
      roomNumber = room.number;
    } else {
      roomId = room;
      const roomObj = rooms.find((r) => r.id_rooms === roomId);
      roomNumber = roomObj ? roomObj.number : "này";
    }

    // Hiển thị hộp thoại xác nhận
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ${roomNumber}?`)) {
      return; // Người dùng hủy thao tác
    }

    try {
      // Gọi API xóa phòng
      await axios.delete(`${API_URL}/rooms/${roomId}`);

      // Cập nhật UI nếu xóa thành công
      setRooms(rooms.filter((r) => r.id_rooms !== roomId));
      alert("Xóa phòng thành công!");
    } catch (error) {
      console.error("Error deleting room:", error);

      // Xử lý các lỗi thường gặp
      if (error.response) {
        switch (error.response.status) {
          case 500:
            alert(
              "Không thể xóa phòng vì có sinh viên đang ở hoặc có dữ liệu liên quan đến phòng này!"
            );
            break;
          case 409:
          case 422:
            alert("Không thể xóa phòng vì đang có ràng buộc với dữ liệu khác!");
            break;
          case 404:
            alert("Phòng không tồn tại hoặc đã bị xóa trước đó!");
            break;
          case 403:
            alert("Bạn không có quyền xóa phòng này!");
            break;
          default:
            // Sử dụng thông báo từ API nếu có
            if (error.response.data && error.response.data.message) {
              alert(error.response.data.message);
            } else {
              alert(`Lỗi khi xóa phòng. Vui lòng thử lại sau.`);
            }
        }
      } else {
        // Lỗi mạng hoặc lỗi không xác định
        alert("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
      }
    }
  };

  const confirmDeleteRoom = async () => {
    if (!deletingRoom) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      // Gọi API xóa phòng trực tiếp
      await axios.delete(`${API_URL}/rooms/${deletingRoom.id_rooms}`);

      // Nếu không có lỗi, cập nhật UI
      setRooms(rooms.filter((r) => r.id_rooms !== deletingRoom.id_rooms));
      setShowDeleteDialog(false);
      setDeletingRoom(null);

      // Thông báo thành công
      setNotification({
        type: "success",
        message: `Phòng ${deletingRoom.number} đã được xóa thành công.`,
      });
    } catch (error) {
      console.error("Lỗi khi xóa phòng:", error);

      // Xử lý phản hồi lỗi từ backend
      let errorMessage = "Không thể xóa phòng. Vui lòng thử lại sau.";

      if (error.response) {
        // Nếu backend trả về thông báo lỗi, sử dụng nó
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // Hoặc dựa vào status code để đưa ra thông báo phù hợp
        else if (
          error.response.status === 422 ||
          error.response.status === 409
        ) {
          errorMessage =
            "Không thể xóa phòng vì đang được sử dụng hoặc có dữ liệu liên quan.";
        } else if (error.response.status === 403) {
          errorMessage = "Bạn không có quyền xóa phòng này.";
        } else if (error.response.status === 404) {
          errorMessage = "Không tìm thấy phòng để xóa.";
        }
      }

      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle form submission (add/edit room)
  const handleSubmitRoom = async (formData) => {
    try {
      if (selectedRoom) {
        // Update room
        await axios.put(`${API_URL}/rooms/${selectedRoom.id_rooms}`, formData);

        // Update local state
        setRooms(
          rooms.map((room) =>
            room.id_rooms === selectedRoom.id_rooms
              ? { ...room, ...formData }
              : room
          )
        );

        alert("Cập nhật phòng thành công!");
      } else {
        // Add new room
        const response = await axios.post(`${API_URL}/rooms`, formData);

        // Add to local state
        setRooms([...rooms, response.data]);

        alert("Thêm phòng mới thành công!");
      }

      // Close form
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving room:", error);
      alert(
        `Lỗi khi ${
          selectedRoom ? "cập nhật" : "thêm"
        } phòng. Vui lòng thử lại sau.`
      );
    }
  };

  // Close modals
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  // Apply filters
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Quản Lý Phòng
        </h1>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded ${
              viewMode === "table"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
            title="Chế độ xem bảng"
          >
            <FaTable />
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
            title="Chế độ xem lưới"
          >
            <FaTh />
          </button>

          <button
            onClick={handleAddRoom}
            className="ml-2 flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <FaPlus className="mr-2" /> Thêm phòng mới
          </button>
        </div>
      </div>

      {/* Filter component */}
      <RoomFilter
        buildings={buildings}
        onFilter={handleFilter}
        initialFilters={filters}
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Empty state */}
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không tìm thấy phòng
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {rooms.length === 0
                  ? "Chưa có phòng nào trong hệ thống."
                  : "Không tìm thấy phòng phù hợp với bộ lọc."}
              </p>
              {rooms.length === 0 && (
                <div className="mt-6">
                  <button
                    onClick={handleAddRoom}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                    Thêm phòng đầu tiên
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Table/Grid view */}
              {viewMode === "table" ? (
                <RoomList
                  rooms={filteredRooms}
                  buildings={buildings}
                  onView={handleViewRoom}
                  onEdit={handleEditRoom}
                  onDelete={handleDeleteRoom}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.id_rooms}
                      room={room}
                      building={findBuilding(room.id_buildings)}
                      onView={handleViewRoom}
                      onEdit={handleEditRoom}
                      onDelete={handleDeleteRoom}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Room Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full">
            <RoomForm
              room={selectedRoom}
              buildings={buildings}
              onSubmit={handleSubmitRoom}
              onCancel={handleCloseForm}
            />
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {isDetailOpen && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <RoomDetail
            room={selectedRoom}
            building={findBuilding(selectedRoom.id_buildings)}
            onClose={handleCloseDetail}
            onEdit={handleEditRoom}
          />
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
