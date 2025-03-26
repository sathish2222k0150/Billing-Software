import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      axios.get("http://localhost:5000/user", { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => {
          setToken(""); // If token is invalid, remove it
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:5000/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  const register = async (email, password) => {
    try {
      await axios.post("http://localhost:5000/register", { email, password });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
