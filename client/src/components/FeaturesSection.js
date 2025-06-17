import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "🎥 Live Sessions",
    desc: "Experience real-time learning in interactive rooms. Ask, collaborate, and grow together — live and unfiltered.",
    color: "bg-gradient-to-r from-pink-500 to-rose-400",
  },
  {
    title: "📚 Resource Sharing",
    desc: "Upload and exchange PDFs, notes, and helpful materials. Keep your learning organized and accessible.",
    color: "bg-gradient-to-r from-blue-500 to-cyan-400",
  },
  {
    title: "⚡ Instant Micro Sessions",
    desc: "Hop into bite-sized 10–15 minute sessions — perfect for quick concept clarity or spontaneous teaching moments.",
    color: "bg-gradient-to-r from-teal-500 to-emerald-400",
  },
  {
    title: "🧱 Public Wall",
    desc: "Post updates, learning requests, or thoughts on our live public wall — like social media, but for knowledge exchange.",
    color: "bg-gradient-to-r from-yellow-400 to-orange-500",
  },
  {
    title: "🤖 AI Mentor Match",
    desc: "Let AI pair you with mentors or study buddies based on your interests, skills, and goals — it’s like matchmaking for knowledge.",
    color: "bg-gradient-to-r from-indigo-500 to-purple-500",
  },
  {
    title: "👥 AI Project Partner Match",
    desc: "Working on a project? Find your ideal coding partner or teammate based on experience, learning style, and tech stack.",
    color: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="p-12 max-w-6xl mx-auto my-20">
      <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-900 drop-shadow-lg">
        Platform Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {features.map(({ title, desc, color }, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`rounded-3xl p-6 md:p-8 text-white shadow-xl cursor-pointer ${color} bg-opacity-90 backdrop-blur-md border border-white/30 flex flex-col justify-center`}
          >
            <h3 className="text-xl font-bold mb-3 drop-shadow-md">{title}</h3>
            <p className="text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
