import React, { useRef, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const ContractPrint = ({
  contract,
  room,
  user,
  onClose,
  autoprint = false,
}) => {
  const printRef = useRef(null);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Tự động in khi component được tải
  useEffect(() => {
    if (autoprint && printRef.current) {
      // Đợi một chút để đảm bảo DOM đã render hoàn tất
      const timeoutId = setTimeout(() => {
        window.print();
        // Nếu không có onClose, thì đóng tab sau khi in
        if (!onClose) {
          window.close();
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [autoprint, onClose]);

  // Xử lý nút in
  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={printRef} className="max-w-4xl mx-auto bg-white p-8 print:p-6">
      {/* Nút đóng và in (chỉ hiển thị trên màn hình, không in) */}
      <div className="flex justify-end mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-blue-700"
        >
          In hợp đồng
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Đóng
          </button>
        )}
      </div>

      {/* Tiêu đề hợp đồng */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold uppercase">
          HỢP ĐỒNG THUÊ PHÒNG KÝ TÚC XÁ
        </h2>
        <p className="text-sm text-gray-600 mt-1">Năm học 2025 - 2026</p>
      </div>

      {/* Thông tin các bên */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">
          THÔNG TIN CÁC BÊN
        </h3>

        <div className="mb-6">
          <h4 className="font-bold mb-2">BÊN A (BÊN CHO THUÊ):</h4>
          <p>
            <span className="font-semibold">Đơn vị:</span> Ký túc xá Trường Đại
            học
          </p>
          <p>
            <span className="font-semibold">Đại diện:</span> Nguyễn Văn A
          </p>
          <p>
            <span className="font-semibold">Chức vụ:</span> Trưởng ban quản lý
            Ký túc xá
          </p>
          <p>
            <span className="font-semibold">Địa chỉ:</span> 123 Đường ABC,
            Phường XYZ, TP. Cần Thơ
          </p>
          <p>
            <span className="font-semibold">Điện thoại:</span> 0292 123 4567
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2">BÊN B (BÊN THUÊ):</h4>
          <p>
            <span className="font-semibold">Họ và tên:</span>{" "}
            {user?.fullname || "___________________"}
          </p>
          <p>
            <span className="font-semibold">MSSV:</span>{" "}
            {user?.student_id || "___________________"}
          </p>
          <p>
            <span className="font-semibold">Ngày sinh:</span>{" "}
            {user?.date_of_birth
              ? formatDate(user.date_of_birth)
              : "___________________"}
          </p>
          <p>
            <span className="font-semibold">CMND/CCCD:</span>{" "}
            {user?.id_card || "___________________"}
          </p>
          <p>
            <span className="font-semibold">Địa chỉ thường trú:</span>{" "}
            {user?.address || "___________________"}
          </p>
          <p>
            <span className="font-semibold">Điện thoại:</span>{" "}
            {user?.phone || "___________________"}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {user?.email || "___________________"}
          </p>
        </div>
      </div>

      {/* Nội dung hợp đồng */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">
          NỘI DUNG HỢP ĐỒNG
        </h3>

        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">
              Điều 1: Bên A đồng ý cho Bên B thuê:
            </span>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Phòng số:{" "}
              <span className="font-semibold">{room?.number || "_____"}</span>
            </li>
            <li>
              Tòa nhà:{" "}
              <span className="font-semibold">
                {room?.building_name || "_____"}
              </span>
            </li>
            <li>
              Loại phòng:{" "}
              <span className="font-semibold">{room?.type || "_____"}</span>
            </li>
            <li>
              Giá thuê:{" "}
              <span className="font-semibold">
                {formatCurrency(contract.price)}/tháng
              </span>
            </li>
            <li>
              Tiền đặt cọc:{" "}
              <span className="font-semibold">
                {formatCurrency(contract.deposit_amount)}
              </span>
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">Điều 2: Thời hạn thuê phòng:</span>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Thời gian bắt đầu:{" "}
              <span className="font-semibold">
                {formatDate(contract.start_date)}
              </span>
            </li>
            <li>
              Thời gian kết thúc:{" "}
              <span className="font-semibold">
                {formatDate(contract.end_date)}
              </span>
            </li>
            <li>
              Tổng thời gian:{" "}
              <span className="font-semibold">{contract.duration} tháng</span>
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">
              Điều 3: Phương thức thanh toán:
            </span>
          </p>
          <p>
            Bên B thanh toán tiền thuê phòng theo định kỳ: mỗi{" "}
            <span className="font-semibold">học kỳ</span> một lần.
          </p>
          <p>
            Hạn thanh toán:{" "}
            <span className="font-semibold">
              trong vòng 10 ngày đầu tiên của mỗi học kỳ
            </span>
            .
          </p>
          <p>
            Hình thức thanh toán:{" "}
            <span className="font-semibold">chuyển khoản hoặc tiền mặt</span>{" "}
            tại văn phòng Ban quản lý Ký túc xá.
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">
              Điều 4: Quyền và nghĩa vụ của Bên B:
            </span>
          </p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>
              Chấp hành nội quy, quy chế của Ký túc xá và các quy định khác của
              Nhà trường.
            </li>
            <li>
              Thanh toán đầy đủ và đúng hạn tiền thuê phòng và các khoản phí
              khác theo quy định.
            </li>
            <li>
              Bảo quản tài sản trong phòng và khu vực công cộng của Ký túc xá.
            </li>
            <li>
              Không được chuyển nhượng hợp đồng hoặc cho người khác ở cùng khi
              chưa được sự đồng ý của Ban quản lý.
            </li>
            <li>
              Tự bảo quản tài sản cá nhân, Ban quản lý không chịu trách nhiệm về
              mất mát tài sản cá nhân.
            </li>
          </ol>
        </div>

        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">
              Điều 5: Điều khoản chấm dứt hợp đồng:
            </span>
          </p>
          <p>Hợp đồng này sẽ chấm dứt trong các trường hợp sau:</p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Hết thời hạn ghi trong hợp đồng.</li>
            <li>
              Theo yêu cầu của Bên B trước thời hạn (phải báo trước ít nhất 30
              ngày).
            </li>
            <li>Bên B vi phạm nội quy Ký túc xá ở mức độ nghiêm trọng.</li>
            <li>
              Bên B không thanh toán tiền phòng đúng hạn sau 02 lần nhắc nhở.
            </li>
          </ol>
        </div>

        {/* Điều khoản đặc biệt nếu có */}
        {contract.notes && (
          <div className="mb-4">
            <p className="mb-2">
              <span className="font-semibold">
                Điều 6: Điều khoản đặc biệt:
              </span>
            </p>
            <p className="whitespace-pre-line">{contract.notes}</p>
          </div>
        )}
      </div>

      {/* Chữ ký */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="text-center">
          <p className="font-bold mb-12">ĐẠI DIỆN BÊN A</p>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
        <div className="text-center">
          <p className="font-bold mb-12">BÊN B</p>
          <p>(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      {/* Footer - chỉ hiển thị khi in */}
      <div className="mt-16 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
        <p>
          Hợp đồng này được lập thành 02 bản có giá trị như nhau, mỗi bên giữ 01
          bản.
        </p>
        <p className="mt-1">
          Mọi thắc mắc xin liên hệ: Văn phòng Ban quản lý Ký túc xá - SĐT: 0292
          123 4567
        </p>
      </div>

      {/* CSS dành riêng cho in ấn */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 1cm;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #000;
            }
            
            h1, h2, h3, h4 {
              color: #000;
            }
            
            .print\\:hidden {
              display: none !important;
            }
            
            .print\\:p-6 {
              padding: 1.5rem !important;
            }
            
            /* Đảm bảo các phần không bị tách ra các trang khác nhau */
            .mb-8 {
              page-break-inside: avoid;
            }
            
            /* Đảm bảo phần chữ ký không bị chia trang */
            .mt-12 {
              page-break-inside: avoid;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ContractPrint;
