Tải link git:
 https://github.com/delht/KTX-Management-API.git(hoặc download file zip gòi giải nén ra)
(lấy nhánh Luongtrieuvy)
Mở terminal chạy lệnh: git clone
 
Mở file
 
Trong thư mục database copy nội dung file: ktx_m.sql
Mở mysql(hoặc WampSever) :dán các câu lệnh trong đó vào và thực thi
 

Tiếp theo cấu hình để kết nối với database
 
Nếu không tìm  thấy  file .env  thì tạo file và copy nội dung trong file .env.example vào file .env
 

Mở terminal trong VS code chạy lệnh  này
 
Đợi sau khi hoàn thành  thì chạy lệnh 
 
Để khỏi động API
 
Test API có hoặc động không
http://127.0.0.1:8000/api/test
Lấy API
GET ALL
http://127.0.0.1:8000/api/users 
http://127.0.0.1:8000/api/contracts
http://127.0.0.1:8000/api/contract-service
http://127.0.0.1:8000/api/payment-details
http://127.0.0.1:8000/api/payments
http://127.0.0.1:8000/api/rooms
http://127.0.0.1:8000/api/services
 

Lấy Thông Tin
Tìm kiếm số lượng người trong 1 phòng theo ID phòng: 
http://127.0.0.1:8000/api/room/{id}/sl-users
 
Tìm kiếm thông tin người dùng theo ID phòng
http://127.0.0.1:8000/api/room/{id}/users
 
Tìm Kiếm
  http://127.0.0.1:8000/api/user/search?gt=C (tìm kiếm dựa vào ký tự hoặc id )
http://127.0.0.1:8000/api/room/search?gt=1 (tìm kiếm dựa vào ký tự hoặc id)
 


Lấy thông tin tòa nhà và thông tin các phòng có trong đó 
http://127.0.0.1:8000/api/rooms/summary/{id_building}
 
Lấy thông tin tất cả dịch vụ có trong 1 phòng
http://127.0.0.1:8000/api/rooms/service/{id_rooms}
 

Lấy thông tin người dùng đã thuê phòng nào và có nhu cầu đổi phòng vì lí do gì đó
http://127.0.0.1:8000/api/users/{id_users}/rooms
 
Lấy thông tin hợp đồng theo người dung
http://127.0.0.1:8000/api/users/{id_users}/contracts
 

Lấy thông tin hợp đồng theo người dùng
http://127.0.0.1:8000/api/users/{id_users}/payments
 













POST (Thêm Data)
http://127.0.0.1:8000/api/users 
http://127.0.0.1:8000/api/contracts
http://127.0.0.1:8000/api/contract-service
http://127.0.0.1:8000/api/payment-details
http://127.0.0.1:8000/api/payments
http://127.0.0.1:8000/api/rooms
http://127.0.0.1:8000/api/services
 
http://127.0.0.1:8000/api/contracts/{id_contracts}/{new_date}

 
LOGIN POST htp://127.0.0.1:8000/api/login (đăng nhập)
 
LOGOUT
http://127.0.0.1:8000/api/logout
  

Delete
http://127.0.0.1:8000/api/users/{truyền ID vô đây}
http://127.0.0.1:8000/api/contracts/{truyền ID vô đây}
http://127.0.0.1:8000/api/contract-service/{truyền ID vô đây}
http://127.0.0.1:8000/api/payment-details/{truyền ID vô đây}
http://127.0.0.1:8000/api/payments/{truyền ID vô đây}
http://127.0.0.1:8000/api/rooms/{truyền ID vô đây}
http://127.0.0.1:8000/api/services/{truyền ID vô đây}
 
 




PUT (update)
http://127.0.0.1:8000/api/users/{truyền ID vô đây}
http://127.0.0.1:8000/api/contracts/{truyền ID vô đây}
http://127.0.0.1:8000/api/contract-service/{truyền ID vô đây}
http://127.0.0.1:8000/api/payment-details/{truyền ID vô đây}
http://127.0.0.1:8000/api/payments/{truyền ID vô đây}
http://127.0.0.1:8000/api/rooms/{truyền ID vô đây}
http://127.0.0.1:8000/api/services/{truyền ID vô đây}
 
 
