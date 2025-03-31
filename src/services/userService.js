import axios from 'axios';

// Service xử lý các request API liên quan đến user
const userService = {
    // Lấy danh sách tất cả users
    getAllUsers: async () => {
        try {
            const response = await axios.get('/users');
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Tìm kiếm users theo term
    searchUsers: async (searchTerm) => {
        try {
            const response = await axios.get(`/user/search?gt=${searchTerm}`);
            return response.data;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    },

    // Lấy thông tin chi tiết một user
    getUserDetails: async (userId) => {
        try {
            const response = await axios.get(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            throw error;
        }
    },

    // Lấy thông tin phòng của user
    getUserRooms: async (userId) => {
        try {
            const response = await axios.get(`/users/${userId}/rooms`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user rooms:', error);
            throw error;
        }
    },

    // Lấy thông tin hợp đồng của user
    getUserContracts: async (userId) => {
        try {

            const response = await axios.get(`/users/${userId}/contracts`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user contracts:', error);
            throw error;
        }
    },

    // Lấy thông tin thanh toán của user
    getUserPayments: async (userId) => {
        try {
            const response = await axios.get(`/users/${userId}/payments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user payments:', error);
            throw error;
        }
    },

    // Thêm user mới
    createUser: async (userData) => {
        try {
            const response = await axios.post('/users', userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Cập nhật thông tin user
    updateUser: async (userId, userData) => {
        try {
            const response = await axios.put(`/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Xóa user
    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(`/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
};

export default userService;