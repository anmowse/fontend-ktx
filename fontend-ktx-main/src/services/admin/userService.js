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
            // Sửa endpoint từ room/${userId}/users thành users/${userId}
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
            // Sửa endpoint từ room/${userId}/users thành users/${userId}/rooms
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
    },

    // Kiểm tra trạng thái hợp đồng và thanh toán của user
    checkUserContractStatus: async (userId) => {
        try {
            // Lấy danh sách hợp đồng của user
            const contractsResponse = await axios.get(`/users/${userId}/contracts`);
            const contracts = contractsResponse.data || [];

            // Kiểm tra hợp đồng đang hoạt động
            const today = new Date();
            const hasActiveContracts = contracts.some(contract => {
                const endDate = new Date(contract.end_date);
                return endDate > today;
            });

            // Lấy thông tin thanh toán của user
            const paymentsResponse = await axios.get(`/users/${userId}/payments`);
            const payments = paymentsResponse.data || [];

            // Kiểm tra khoản thanh toán chưa hoàn thành
            const hasUnpaidPayments = payments.some(payment =>
                payment.status === 'unpaid' || payment.status === 'chua thanh toan'
            );

            return {
                hasActiveContracts,
                hasUnpaidPayments
            };
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái hợp đồng của user:', error);
            throw error;
        }
    },

    // Lấy thông tin phòng hiện tại của user
    getUserWithRoomInfo: async (userId) => {
        try {
            // Chỉ sử dụng API hợp đồng vì API phòng đang bị lỗi trên backend
            const contractsResponse = await axios.get(`/users/${userId}/contracts`);
            const contracts = contractsResponse.data || [];

            if (contracts.length === 0) {
                return null;
            }

            // Tìm hợp đồng đang hoạt động
            const today = new Date();
            const activeContract = contracts.find(contract => {
                const startDate = new Date(contract.start_date);
                const endDate = new Date(contract.end_date);
                return startDate <= today && endDate >= today;
            });

            // Nếu có hợp đồng đang hoạt động, trả về ID phòng
            if (activeContract && activeContract.id_rooms) {
                return { roomId: activeContract.id_rooms };
            }

            // Nếu không có hợp đồng đang hoạt động, sử dụng hợp đồng mới nhất
            // Sắp xếp theo thời gian kết thúc giảm dần
            contracts.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
            return { roomId: contracts[0].id_rooms };
        } catch (error) {
            console.error('Lỗi khi lấy thông tin phòng của user:', error);
            // Trả về null thay vì throw error để không làm gián đoạn luồng xóa user
            return null;
        }
    },

    // Cập nhật số người trong phòng
    updateRoomOccupancy: async (roomId, change) => {
        try {
            // Vì không có API trực tiếp để cập nhật occupancy, 
            // chúng ta sẽ lấy thông tin phòng hiện tại và cập nhật
            const roomResponse = await axios.get(`/rooms/${roomId}`);
            const room = roomResponse.data;

            if (!room) {
                throw new Error('Không tìm thấy thông tin phòng');
            }

            // Tính toán số lượng người mới
            let current_occupancy = room.current_occupancy || 0;
            current_occupancy += change;

            if (current_occupancy < 0) current_occupancy = 0;

            // Cập nhật thông tin phòng
            return await axios.put(`/rooms/${roomId}`, {
                ...room,
                current_occupancy: current_occupancy
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật số người trong phòng:', error);
            throw error;
        }
    }
};

export default userService;