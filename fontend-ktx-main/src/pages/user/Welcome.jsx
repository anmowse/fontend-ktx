import React from 'react';
import './DangKyNoiTru.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <h1 className="welcome-title">KÝ TÚC XÁ STU</h1>
      
      <div className="welcome-content">
        <p className="welcome-text">
          Chào mừng bạn đến với Ký túc xá Trường Đại học Công nghệ Sài Gòn (STU)! 
          Chúng tôi tự hào là ngôi nhà chung của hàng nghìn sinh viên, nơi không chỉ 
          cung cấp chỗ ở an toàn, tiện nghi mà còn là môi trường lý tưởng để học tập, 
          rèn luyện và phát triển bản thân.
        </p>

        <div className="features">
          <h2>Tiện ích nổi bật</h2>
          <ul>
            <li>Phòng ở tiện nghi, hiện đại</li>
            <li>An ninh 24/7</li>
            <li>WiFi tốc độ cao</li>
            <li>Khu vực tự học</li>
            <li>Căng tin</li>
            <li>Sân thể thao</li>
          </ul>
        </div>

        <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          <p>Địa chỉ: 180 Cao Lỗ, Phường 4, Quận 8, TP.HCM</p>
          <p>Điện thoại: (028) 3850 5520</p>
          <p>Email: ktx@stu.edu.vn</p>
          <p>Website: www.stu.edu.vn</p>
        </div>
      </div>

      <div className="footer-text">
        Phát triển bởi Nhóm 9
      </div>
    </div>
  );
};

export default Welcome; 