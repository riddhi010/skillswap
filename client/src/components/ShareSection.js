import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ShareSection = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="flex flex-col justify-center items-start text-left p-10 bg-white/60 rounded-3xl backdrop-blur-md shadow-2xl border border-white/30"
    >
      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Share</h2>
      <p className="text-lg md:text-xl text-gray-800 mb-6">
        Empower others by sharing what you know — every skill has value here.
      </p>
      <ul className="space-y-3 text-base md:text-lg text-gray-700 font-light mb-8">
        <li>🧠 Share anything — coding, baking, gaming, even juggling!</li>
        <li>👥 Be a mentor, no matter your age — all you need is the desire to help.</li>
        <li>🎤 Host interactive live sessions — teach, connect, answer in real time.</li>
        <li>🌟 Grow your confidence and inspire others while building a reputation.</li>
      </ul>
      <button
        onClick={() => navigate("/register")}
        className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-500 hover:to-teal-500 transition shadow-lg text-white font-semibold text-lg"
      >
        Become a Mentor
      </button>
    </motion.div>
  );
};

export default ShareSection;
