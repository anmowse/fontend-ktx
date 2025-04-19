import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import axios from "axios";

// Cấu hình Axios mặc định
// axios.defaults.baseURL = "https://nhom9webt4.up.railway.app/api";
axios.defaults.baseURL = "http://127.0.0.1:8000/api";

axios.defaults.headers.common["Accept"] = "application/json";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
//b@gmail.com
//123456
