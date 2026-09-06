import {
  createContext,
  useState,
  useEffect,
} from "react";

export const AuthContext = createContext();

// ==========================================
// BACKEND API URL
// ==========================================
// Vercel:
// VITE_API_URL = https://devlens-backend-lyum.onrender.com
//
// Local:
// http://localhost:5000
// ==========================================

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
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      } else {
        // Token is invalid or expired
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
    const storedToken =
      localStorage.getItem("devlens_token");

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
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }

      setUser(data.user);
      setToken(data.token);

      localStorage.setItem(
        "devlens_token",
        data.token
      );

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: "Could not connect to server",
      };
    }
  };

  // ==========================================
  // REGISTER
  // ==========================================

  const register = async (
    name,
    email,
    password
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message:
            data.message || "Registration failed",
        };
      }

      setUser(data.user);
      setToken(data.token);

      localStorage.setItem(
        "devlens_token",
        data.token
      );

      return {
        success: true,
        user: data.user,
      };
    } catch (error) {
      console.error("Registration error:", error);

      return {
        success: false,
        message: "Could not connect to server",
      };
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = async () => {
    try {
      const storedToken =
        localStorage.getItem("devlens_token");

      if (storedToken) {
        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      setUser(null);
      setToken("");

      localStorage.removeItem("devlens_token");
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (
  currentPassword,
  newPassword
) => {
  try {
    const storedToken =
      localStorage.getItem(
        "devlens_token"
      );

    const response = await fetch(
      `${API_URL}/api/auth/change-password`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${storedToken}`,
        },

        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    );

    const data =
      await response.json();

    return {
      success:
        response.ok &&
        data.success,

      message:
        data.message ||
        "Could not change password",
    };
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return {
      success: false,
      message:
        "Could not connect to server",
    };
  }
};
// ==========================================
// DELETE ACCOUNT
// ==========================================

const deleteAccount = async (
  password
) => {
  try {
    const storedToken =
      localStorage.getItem(
        "devlens_token"
      );

    const response = await fetch(
      `${API_URL}/api/auth/delete-account`,
      {
        method: "DELETE",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${storedToken}`,
        },

        body: JSON.stringify({
          password,
        }),
      }
    );

    const data =
      await response.json();

    if (
      response.ok &&
      data.success
    ) {
      // Remove login information
      setUser(null);
      setToken("");

      localStorage.removeItem(
        "devlens_token"
      );
    }

    return {
      success:
        response.ok &&
        data.success,

      message:
        data.message ||
        "Could not delete account",
    };
  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    return {
      success: false,
      message:
        "Could not connect to server",
    };
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

exports.changePassword = async (req, res) => {
  const {
    currentPassword,
    newPassword,
  } = req.body;

  try {
    // Validate fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    // Find current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Prevent same password
    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password cannot be the same as your current password",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(
      newPassword,
      salt
    );

    await user.save();

    res.json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not change password",
    });
  }
};

// ==========================================
// DELETE ACCOUNT
// ==========================================

exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  try {
    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete your account",
      });
    }

    // Find current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // ==========================================
    // DELETE ALL USER SCAN REPORTS
    // ==========================================

    await ScanReport.deleteMany({
      user: req.user.id,
    });

    // ==========================================
    // DELETE USER ACCOUNT
    // ==========================================

    await User.findByIdAndDelete(
      req.user.id
    );

    res.json({
      success: true,
      message:
        "Account and all associated reports deleted successfully",
    });

  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not delete account",
    });
  }
};