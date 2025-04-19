import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/api";

// Tạo context với giá trị mặc định để tránh lỗi khi chưa có Provider
export const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  clearError: () => {},
});

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);

        // Set axios default Authorization header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      }

      setLoading(false);
    };

    initializeAuth();
    setupAxiosInterceptors();
  }, []);

  // Setup axios interceptors for handling token expiration
  const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Auto logout if 401 response returned from api
          logout();
        }
        return Promise.reject(error);
      }
    );
  };

  // Login function with better error handling
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Đang gửi request đăng nhập với email:", email);
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;

      // Debug thông tin
      console.log("=== DEBUG THÔNG TIN ĐĂNG NHẬP ===");
      console.log("Response data:", response.data);
      console.log("User data:", userData);
      console.log("Role:", userData.role);
      console.log("=== KẾT THÚC DEBUG ===");

      // Save to state
      setToken(newToken);
      setUser(userData);

      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Set axios default Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setLoading(false);

      // Điều hướng dựa trên vai trò
      if (userData.role === "Admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/user";
      }

      return response.data;
    } catch (err) {
      setLoading(false);

      // Format the error message
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại sau.";
      if (err.response) {
        switch (err.response.status) {
          case 401:
            errorMessage = "Email hoặc mật khẩu không đúng";
            break;
          case 422:
            if (err.response.data && err.response.data.errors) {
              // Handle validation errors
              const validationErrors = err.response.data.errors;
              if (validationErrors.email) {
                errorMessage = validationErrors.email[0];
              } else if (validationErrors.password) {
                errorMessage = validationErrors.password[0];
              } else {
                errorMessage = "Dữ liệu đăng nhập không hợp lệ";
              }
            } else {
              errorMessage =
                err.response.data.message || "Dữ liệu không hợp lệ";
            }
            break;
          case 429:
            errorMessage =
              "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.";
            break;
          default:
            errorMessage = `Lỗi máy chủ (${err.response.status}): ${
              err.response.statusText || "Vui lòng thử lại sau"
            }`;
        }
      } else if (err.request) {
        errorMessage =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.";
      } else {
        errorMessage = "Lỗi: " + err.message;
      }

      setError(errorMessage);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      if (token) {
        // Call the logout API endpoint with token
        await axios.post(
          `${API_URL}/logout`,
          {},
          {
            headers: {
              Accept: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear auth state regardless of API success/failure
      setToken(null);
      setUser(null);

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Remove Authorization header
      delete axios.defaults.headers.common["Authorization"];

      setLoading(false);
    }
  };

  // Check if current user is admin
  const isAdmin = () => {
    return user && user.role === "Admin";
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  // Provide the auth context value
  const contextValue = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    isAdmin: isAdmin(),
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Login Page Component with better error handling
export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  // Khai báo các giá trị từ auth để tránh lỗi null/undefined
  const { login, isAuthenticated, loading, error, user } = auth || {};
  // Tạo một phiên bản clearError an toàn
  const clearError = auth?.clearError || (() => {});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Admin") {
        navigate("/dashboard");
      } else {
        navigate("/user");
      }
    }
    // Gọi clearError một cách an toàn
    clearError();
  }, [isAuthenticated, user, navigate, clearError]);

  // Update local error when context error changes
  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Basic validation
    if (!email) {
      setLocalError("Vui lòng nhập email");
      return;
    }

    if (!password) {
      setLocalError("Vui lòng nhập mật khẩu");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Email không đúng định dạng");
      return;
    }

    try {
      await login(email, password);
      // Navigation happens in the effect based on user role
    } catch (err) {
      // Error is handled in the login function and stored in context

      // Show more detailed error message
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setLocalError("Email hoặc mật khẩu không đúng");
            break;
          case 422:
            setLocalError(err.response.data.message || "Dữ liệu không hợp lệ");
            break;
          case 429:
            setLocalError(
              "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau."
            );
            break;
          default:
            setLocalError(
              `Lỗi máy chủ: ${err.response.status} - ${err.response.statusText}`
            );
        }
      } else if (err.request) {
        setLocalError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
        );
      } else {
        setLocalError("Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào Hệ thống Quản lý KTX
          </h2>
        </div>

        {/* Alert box for errors - improved styling */}
        {localError && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md relative"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                className="h-6 w-6 text-red-500 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium">{localError}</span>
            </div>
            <button
              className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
              onClick={() => setLocalError("")}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  localError && !email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  localError && !password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Protected Route component
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const auth = useAuth();
  const { isAuthenticated, user, loading } = auth || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (adminOnly && user?.role !== "Admin") {
        navigate("/user");
      }
    }
  }, [isAuthenticated, user, loading, adminOnly, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (adminOnly && user?.role !== "Admin") {
    return null;
  }

  return children;
};

// Header with Logout Button
export const Header = () => {
  const auth = useAuth();
  const { user, logout, loading } = auth || {};
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || !user) return null;

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Quản lý KTX</h1>
        <div className="flex items-center">
          <span className="px-4 text-gray-700">
            {user.name} ({user.role})
          </span>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`${
              loggingOut ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
            } text-white px-3 py-1 rounded-md text-sm font-medium transition-colors`}
          >
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuthContext;
