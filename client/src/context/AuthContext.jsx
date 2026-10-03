import {
  createContext,
  useState,
  useEffect,
} from "react";

export const AuthContext = createContext();

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("devlens_token") || ""
  );
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET CURRENT USER
  // ==========================================

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        setUser(null);
        setToken("");
        localStorage.removeItem("devlens_token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHECK LOGIN ON APP START
  // ==========================================

  useEffect(() => {
    const storedToken = localStorage.getItem("devlens_token");

    if (storedToken) {
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("devlens_token", data.token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Could not connect to server" };
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("devlens_token", data.token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Could not connect to server" };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    try {
      const storedToken = localStorage.getItem("devlens_token");

      if (storedToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      setToken("");
      localStorage.removeItem("devlens_token");
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const storedToken = localStorage.getItem("devlens_token");

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      return {
        success: response.ok && data.success,
        message: data.message || "Could not change password",
      };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "Could not connect to server" };
    }
  };

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: response.ok && data.success,
        message: data.message || "Could not process request",
        resetToken: data.resetToken || null,
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, message: "Could not connect to server" };
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();

      return {
        success: response.ok && data.success,
        message: data.message || "Could not reset password",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, message: "Could not connect to server" };
    }
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const deleteAccount = async (password) => {
    try {
      const storedToken = localStorage.getItem("devlens_token");

      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(null);
        setToken("");
        localStorage.removeItem("devlens_token");
      }

      return {
        success: response.ok && data.success,
        message: data.message || "Could not delete account",
      };
    } catch (error) {
      console.error("Delete account error:", error);
      return { success: false, message: "Could not connect to server" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        changePassword,
        deleteAccount,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
