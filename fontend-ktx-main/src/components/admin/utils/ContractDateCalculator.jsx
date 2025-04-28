import React from "react";
import { differenceInMonths, format } from "date-fns";

const ContractDateCalculator = ({ startDate, endDate }) => {
  if (!startDate || !endDate) {
    return null;
  }

  // Chuyển đổi string sang date object nếu cần
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  // Tính số tháng chính xác
  const monthDiff = differenceInMonths(end, start);

  // Đảm bảo số tháng tối thiểu là 1
  const months = Math.max(1, monthDiff);

  return (
    <div className="p-3 border border-blue-100 rounded-md bg-blue-50 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Thời gian hợp đồng:</p>
          <p className="font-medium">{months} tháng</p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">Thời hạn:</p>
          <p className="font-medium">
            {format(start, "dd/MM/yyyy")} - {format(end, "dd/MM/yyyy")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractDateCalculator;
