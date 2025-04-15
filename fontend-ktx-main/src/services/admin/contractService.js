// Cập nhật hợp đồng
updateContract: async (contractId, contractData) => {
    try {
        // Loại bỏ bất kỳ trường nào không thuộc về bảng Contracts
        const cleanData = {
            id_users: contractData.id_users,
            id_rooms: contractData.id_rooms,
            start_date: contractData.start_date,
            end_date: contractData.end_date,
        };

        const response = await axios.put(`/contracts/${contractId}`, cleanData);
        return response.data;
    } catch (error) {
        console.error('Error updating contract:', error);
        throw error;
    }
}
