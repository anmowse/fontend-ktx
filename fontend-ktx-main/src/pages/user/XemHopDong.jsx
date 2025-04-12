import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/admin/AuthContext';
import axios from 'axios';
import API_URL from '../../config/api';
import './XemHopDong.css';

const XemHopDong = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserContracts = async () => {
      if (!user?.id_users) {
        setError('Vui lòng đăng nhập để xem hợp đồng');
        setLoading(false);
        return;
      }

      try {
        console.log("Đang gọi API với user_id:", user.id_users);
        
        // Lấy thông tin hợp đồng của user
        const response = await axios.get(`${API_URL}/users/${user.id_users}/contracts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log("API Response:", {
          status: response.status,
          headers: response.headers,
          data: response.data
        });

        if (!response.data) {
          console.log("Không có dữ liệu trả về từ API");
          setContracts([]);
          setError('Không thể tải thông tin hợp đồng');
          setLoading(false);
          return;
        }

        // Đảm bảo dữ liệu là một mảng
        const contractsData = Array.isArray(response.data) ? response.data : [response.data];
        
        console.log("Dữ liệu hợp đồng chi tiết:", contractsData);
        console.log("Kiểm tra mã hợp đồng:", contractsData.map(c => c.code));
        
        if (contractsData.length === 0) {
          console.log("Không có hợp đồng nào");
          setContracts([]);
          setError('Bạn chưa có hợp đồng nào');
          setLoading(false);
          return;
        }

        // Lấy thông tin chi tiết cho mỗi hợp đồng
        const contractsWithDetails = [];

        for (const contract of contractsData) {
          console.log("Đang xử lý hợp đồng:", contract);
          
          try {
            let roomData = null;
            let servicesData = [];

            // Kiểm tra và lấy thông tin phòng nếu có id_rooms
            if (contract.id_rooms) {
              console.log("Đang lấy thông tin phòng với id:", contract.id_rooms);
              
              try {
                const roomResponse = await axios.get(`${API_URL}/rooms/${contract.id_rooms}`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                  }
                });
                
                console.log("Room API Response:", roomResponse.data);
                
                if (roomResponse.data) {
                  roomData = roomResponse.data;

                  // Chỉ lấy thông tin dịch vụ nếu lấy được thông tin phòng
                  console.log("Đang lấy thông tin dịch vụ cho phòng:", contract.id_rooms);
                  
                  try {
                    const servicesResponse = await axios.get(`${API_URL}/rooms/service/${contract.id_rooms}`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                      }
                    });
                    
                    console.log("Services API Response:", servicesResponse.data);
                    
                    if (servicesResponse.data) {
                      servicesData = Array.isArray(servicesResponse.data) 
                        ? servicesResponse.data 
                        : [servicesResponse.data];
                    }
                  } catch (serviceErr) {
                    console.error("Lỗi khi lấy thông tin dịch vụ:", serviceErr.response || serviceErr);
                  }
                }
              } catch (roomErr) {
                console.error("Lỗi khi lấy thông tin phòng:", roomErr.response || roomErr);
              }
            }

            contractsWithDetails.push({
              ...contract,
              room: roomData,
              services: servicesData
            });
          } catch (err) {
            console.error(`Lỗi khi xử lý hợp đồng ${contract.id_contracts}:`, err.response || err);
            contractsWithDetails.push({
              ...contract,
              room: null,
              services: []
            });
          }
        }

        console.log("Kết quả cuối cùng:", contractsWithDetails);
        setContracts(contractsWithDetails);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin hợp đồng:', err.response || err);
        if (err.response) {
          setError(`Lỗi ${err.response.status}: ${err.response.data?.message || 'Không thể tải thông tin hợp đồng'}`);
        } else {
          setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserContracts();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleExtendContract = async (contractId) => {
    try {
      // Điều hướng đến trang gia hạn hợp đồng
      navigate(`/user/extend-contract/${contractId}`);
    } catch (error) {
      console.error('Lỗi khi gia hạn hợp đồng:', error);
      alert('Có lỗi xảy ra khi gia hạn hợp đồng. Vui lòng thử lại sau.');
    }
  };

  const handleCheckout = async (contractId) => {
    if (window.confirm('Bạn có chắc chắn muốn trả phòng không?')) {
      try {
        await axios.put(`${API_URL}/contracts/${contractId}`, {
          status: 'inactive'
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Cập nhật lại danh sách hợp đồng
        setContracts(contracts.map(contract => 
          contract.id_contracts === contractId 
            ? { ...contract, status: 'inactive' } 
            : contract
        ));
        
        alert('Trả phòng thành công!');
      } catch (error) {
        console.error('Lỗi khi trả phòng:', error);
        alert('Có lỗi xảy ra khi trả phòng. Vui lòng thử lại sau.');
      }
    }
  };

  const calculateContractStatus = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const contractEndDate = new Date(endDate);
    return today <= contractEndDate;
  };

  const getStatusText = (endDate) => {
    const isActive = calculateContractStatus(endDate);
    return isActive ? 'Còn hiệu lực' : 'Hết hiệu lực';
  };

  const getStatusColor = (endDate) => {
    const isActive = calculateContractStatus(endDate);
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Đang tải thông tin hợp đồng...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Thông Tin Hợp Đồng
      </h2>

      {error && (
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded max-w-2xl w-full">
            <p>{error}</p>
          </div>
        </div>
      )}

      {!error && contracts.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>Bạn chưa có hợp đồng nào.</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
              {contracts.map((contract, index) => (
                <div key={contract.id_contracts || index} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-600">Ngày bắt đầu:</p>
                      <p className="font-medium">{formatDate(contract.start_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Ngày kết thúc:</p>
                      <p className="font-medium">{formatDate(contract.end_date)}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Thông tin phòng:</h4>
                    {contract.number ? (
                      <>
                        <p>Phòng: {contract.number}</p>
                        <p>Giá phòng: {formatCurrency(contract.amount)}</p>
                      </>
                    ) : (
                      <p className="text-gray-500">Không thể tải thông tin phòng</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Dịch vụ đi kèm:</h4>
                    {contract.services && contract.services.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {contract.services.map((service, serviceIndex) => (
                          <li key={service.id_services || `service-${serviceIndex}`}>
                            {service.service_name} - {formatCurrency(service.price)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">Không có dịch vụ đi kèm</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-gray-600">Trạng thái:</p>
                    <p className={`font-medium ${getStatusColor(contract.end_date)}`}>
                      {getStatusText(contract.end_date)}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <button
                      onClick={() => handleExtendContract(contract.id_contracts)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Gia hạn hợp đồng
                    </button>
                    <button
                      onClick={() => handleCheckout(contract.id_contracts)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Trả phòng
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    <p>Debug: end_date = {contract.end_date}</p>
                    <p>Debug: status = {calculateContractStatus(contract.end_date) ? 'active' : 'inactive'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XemHopDong; 