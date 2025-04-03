import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../Context/AuthContext';
import logoImage from "../assets/Images/sds logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Redirect to Dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/Dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);
    
    if (result.success) {
      console.log("Login successful, navigating to Dashboard...");
      navigate("/Dashboard");
    } else {
      console.log("Login failed:", result.message);
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-50 p-4 rounded-2xl shadow-lg">
            <img src={logoImage} alt="SDS All Car Service" className="h-16 w-auto" />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Please enter your details to sign in.</p>
        </div>

        {/* Display Error Message */}
        {error && <p className="text-red-600 text-center">{error}</p>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account yet?{" "}
            <Link to="/Register" className="text-blue-600 font-medium hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
