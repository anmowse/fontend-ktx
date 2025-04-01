import axios from "axios";
import API_URL from "../../config/api";


const roomService = {
    // Lấy tất cả phòng
    getAllRooms: async () => {
        try {
            const response = await axios.get(`${API_URL}/rooms`);
            return response.data;
        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw error;
        }
    },

    // Lấy chi tiết phòng theo ID
    getRoomById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/rooms/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching room with id ${id}:`, error);
            throw error;
        }
    },

    // Lấy danh sách người dùng trong phòng
    getUsersInRoom: async (roomId) => {
        try {
            const response = await axios.get(`${API_URL}/room/${roomId}/users`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching users in room ${roomId}:`, error);
            throw error;
        }
    },

    // Lấy số lượng người trong phòng
    getUserCountInRoom: async (roomId) => {
        try {
            const response = await axios.get(`${API_URL}/room/${roomId}/sl-users`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching user count for room ${roomId}:`, error);
            throw error;
        }
    },

    // Lấy danh sách dịch vụ trong phòng
    getRoomServices: async (roomId) => {
        try {
            const response = await axios.get(`${API_URL}/rooms/service/${roomId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching services for room ${roomId}:`, error);
            throw error;
        }
    },

    // Tìm kiếm phòng
    searchRooms: async (query) => {
        try {
            const response = await axios.get(`${API_URL}/room/search?gt=${query}`);
            return response.data;
        } catch (error) {
            console.error(`Error searching for rooms with query ${query}:`, error);
            throw error;
        }
    },

    // Thêm phòng mới
    addRoom: async (roomData) => {
        try {
            const response = await axios.post(`${API_URL}/rooms`, roomData);
            return response.data;
        } catch (error) {
            console.error("Error adding new room:", error);
            throw error;
        }
    },

    // Cập nhật thông tin phòng
    updateRoom: async (id, roomData) => {
        try {
            const response = await axios.put(`${API_URL}/rooms/${id}`, roomData);
            return response.data;
        } catch (error) {
            console.error(`Error updating room ${id}:`, error);
            throw error;
        }
    },

    // Xóa phòng
    deleteRoom: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/rooms/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting room ${id}:`, error);
            throw error;
        }
    },
};

export default roomService;