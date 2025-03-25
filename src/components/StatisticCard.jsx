import React from "react";
import { Link } from "react-router-dom";

const StatisticCard = ({ title, value, icon, color, bgColor, link }) => {
  return (
    <Link to={link} className="text-decoration-none">
      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${bgColor}`}>{value}</p>
          </div>
          <div className={`${bgColor} opacity-75`}>{icon}</div>
        </div>
      </div>
    </Link>
  );
};

export default StatisticCard;
