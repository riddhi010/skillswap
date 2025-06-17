import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LearnSection = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="flex flex-col justify-center items-start text-left p-10 bg-white/60 rounded-3xl backdrop-blur-md shadow-2xl border border-white/30"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Learn</h2>
      <p className="text-lg md:text-xl text-gray-800 mb-6">
        Discover skills from passionate people around the world and grow at your own pace.
      </p>
      <ul className="space-y-3 text-base md:text-lg text-gray-700 font-light mb-8">
        <li>🎯 Learn from peers, not just pros — passionate people like you.</li>
        <li>🌐 Connect with a mentor across ages and cultures.</li>
        <li>🤝 Swap skills — teach what you know, learn what you don't.</li>
        <li>⚡ Grow through real-time sessions with collaboration and feedback.</li>
      </ul>
      <button
        onClick={() => navigate("/register")}
        className="px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 to-coral-400 hover:from-pink-600 hover:to-coral-500 transition shadow-lg text-white font-semibold text-lg"
      >
        Start Learning
      </button>
    </motion.div>
  );
};

export default LearnSection;
