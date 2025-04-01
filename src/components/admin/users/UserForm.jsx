import React, { useState, useEffect } from 'react';
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';

const UserForm = ({ user, onSubmit, onCancel }) => {
  // Kiểm tra xem là chế độ thêm mới hay chỉnh sửa
  const isEditMode = !!user;
  
  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'User'
  });
  
  // State quản lý lỗi validation
  const [errors, setErrors] = useState({});
  
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(false);

  // Cập nhật dữ liệu form khi user prop thay đổi (chế độ edit)
  useEffect(() => {
    if (user) {
      setFormData({
        id_users: user.id_users,
        name: user.name || '',
        email: user.email || '',
        password: '',             // Không hiển thị mật khẩu khi edit
        confirmPassword: '',
        phone: user.phone || '',
        role: user.role || 'User'
      });
    }
  }, [user]);

  // Hàm kiểm tra tính hợp lệ của form
  const validateForm = () => {
    const newErrors = {};
    
    // Kiểm tra tên
    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được để trống';
    }
    
    // Kiểm tra email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Kiểm tra mật khẩu - chỉ bắt buộc khi thêm mới
    if (!isEditMode && !formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    // Kiểm tra số điện thoại
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Trả về true nếu không có lỗi
  };

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi user nhập lại
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra tính hợp lệ của form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Xóa confirmPassword trước khi gửi lên API
      const dataToSubmit = { ...formData };
      delete dataToSubmit.confirmPassword;
      
      // Nếu là edit mode và không nhập mật khẩu, xóa trường password
      if (isEditMode && !dataToSubmit.password) {
        delete dataToSubmit.password;
      }
      
      // Gọi hàm onSubmit từ props
      await onSubmit(dataToSubmit, isEditMode);
    } catch (error) {
      // Hiển thị lỗi từ API
      setErrors(prev => ({
        ...prev,
        form: error
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Tiêu đề form */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {isEditMode ? 'Chỉnh sửa thông tin sinh viên' : 'Thêm sinh viên mới'}
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>
      
      {/* Hiển thị lỗi chung */}
      {errors.form && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}
      
      {/* Form nhập liệu */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Trường tên */}
          <div className="sm:col-span-3">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Tên sinh viên
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.name ? 'border-red-300' : ''
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Trường email */}
          <div className="sm:col-span-3">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.email ? 'border-red-300' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Trường mật khẩu */}
          <div className="sm:col-span-3">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {isEditMode ? 'Mật khẩu mới (không điền nếu không đổi)' : 'Mật khẩu'}
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.password ? 'border-red-300' : ''
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Trường xác nhận mật khẩu */}
          <div className="sm:col-span-3">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu
            </label>
            <div className="mt-1">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.confirmPassword ? 'border-red-300' : ''
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Trường số điện thoại */}
          <div className="sm:col-span-3">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                  errors.phone ? 'border-red-300' : ''
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Trường vai trò */}
          <div className="sm:col-span-3">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Vai trò
            </label>
            <div className="mt-1">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Các nút action */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;