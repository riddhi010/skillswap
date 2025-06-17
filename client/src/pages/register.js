import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "learner",
    skills: "",
  });

  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map((skill) => skill.trim()),
      };

      await axios.post("https://skillswap-backend-jxyu.onrender.com/api/auth/register", payload);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white font-sans">

      {/* Left: Hero / Visual */}
      <div className="hidden md:flex flex-col justify-center items-start h-full w-1/2 p-10 space-y-6 animate-fade-in">
        <h1 className="text-5xl font-extrabold leading-tight tracking-wide">
          Unlock <span className="text-pink-400">Skills</span>, Share <span className="text-purple-400">Wisdom</span>
        </h1>
        <p className="text-lg text-gray-300">
          SkillSwap is where mentors and learners connect, grow, and build together.
          Whether you're a code wizard or a curious learner — this is your launchpad.
        </p>
        <img src="https://cdn.dribbble.com/userupload/14940716/file/original-1c0bcc60a84660d9794fe0f182b21574.png" alt="learning" className="w-3/4 drop-shadow-lg" />
      </div>

      {/* Right: Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-5 border border-white border-opacity-20 animate-slide-in"
        >
          <h2 className="text-3xl font-bold text-center text-white">Create Your SkillSwap Account</h2>
          {error && <p className="text-red-300 text-center">{error}</p>}

          {step === 1 && (
            <>
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />

              <select
                name="role"
                onChange={handleChange}
                value={formData.role}
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="learner">👩‍🎓 Learner</option>
                <option value="mentor">🧑‍🏫 Mentor</option>
                <option value="both">🌐 Both</option>
              </select>

              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-400 hover:text-white"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
              >
                Next
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <input
                name="skills"
                placeholder="e.g. React, UI/UX, Python"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-20 border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />

              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-400 hover:text-white"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold tracking-wide shadow-xl transition-transform transform hover:scale-105"
              >
                Register
              </button>
            </>
          )}

          <p className="text-sm text-gray-300 text-center mt-4">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-pink-400 hover:underline cursor-pointer">
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
