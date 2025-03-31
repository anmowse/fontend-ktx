import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const UserTable = ({ users, onEdit, onDelete, onViewDetails }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Header của bảng */}
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SĐT
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vai trò
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tác vụ
            </th>
          </tr>
        </thead>
        
        {/* Body của bảng */}
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            // Hiển thị khi không có dữ liệu
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                Không có dữ liệu sinh viên
              </td>
            </tr>
          ) : (
            // Map qua danh sách users để hiển thị
            users.map((user) => (
              <tr key={user.id_users}>
                {/* Cột ID */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.id_users}
                </td>
                
                {/* Cột Tên - có thể click để xem chi tiết */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => onViewDetails(user)}
                  >
                    {user.name}
                  </div>
                </td>
                
                {/* Cột Email */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                
                {/* Cột Số điện thoại */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phone}
                </td>
                
                {/* Cột Vai trò - hiển thị với màu khác nhau */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'Admin' 
                      ? 'bg-purple-100 text-purple-800' // Màu cho Admin
                      : 'bg-green-100 text-green-800'   // Màu cho User
                  }`}>
                    {user.role}
                  </span>
                </td>
                
                {/* Cột Tác vụ - chứa các nút chức năng */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Nút xem chi tiết */}
                  <button
                    onClick={() => onViewDetails(user)}
                    className="text-blue-600 hover:text-blue-900 mx-1"
                    title="Xem chi tiết"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Nút chỉnh sửa */}
                  <button 
                    onClick={() => onEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mx-1"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  
                  {/* Nút xóa */}
                  <button 
                    onClick={() => onDelete(user.id_users)}
                    className="text-red-600 hover:text-red-900 mx-1"
                    title="Xóa"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;