import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("https://skillswap-backend-jxyu.onrender.com/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      alert("Login successful!");
      setFormData({ email: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white font-sans">
      
      {/* Left: Illustration / Info */}
      <div className="hidden md:flex flex-col justify-center items-start h-full w-1/2 p-10 space-y-6 animate-fade-in">
        <h1 className="text-5xl font-extrabold leading-tight tracking-wide">
          Welcome Back to <span className="text-pink-400">SkillSwap</span>
        </h1>
        <p className="text-lg text-gray-300">
          Log in and continue your journey of learning, mentoring, and growing with a vibrant community.
        </p>
        <img
          src="https://cdn.dribbble.com/userupload/14940716/file/original-1c0bcc60a84660d9794fe0f182b21574.png"
          alt="learning"
          className="w-3/4 drop-shadow-lg"
        />
      </div>

      {/* Right: Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-5 border border-white border-opacity-20 animate-slide-in"
        >
          <h2 className="text-3xl font-bold text-center text-white">Let's Start!</h2>
          {error && <p className="text-red-300 text-center">{error}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold tracking-wide shadow-xl transition-transform transform hover:scale-105"
          >
            Login
          </button>

          <p className="text-sm text-gray-300 text-center mt-4">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")} className="text-pink-400 hover:underline cursor-pointer">
              Register here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
