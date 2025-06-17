import React from "react";
import { motion } from "framer-motion";

const cards = [
  {
    title: "🌍 A Global Learning Village",
    text: "Connect with passionate people across the globe — from teenagers learning graphic design to professionals teaching business skills. Our community thrives on diversity, empathy, and shared purpose.",
  },
  {
    title: "🚀 Learn Live, Grow Fast",
    text: "Dive into real-time sessions, join rooms on the fly, and ask questions as they come. No boring lectures — just pure interaction, learning, and collaboration.",
  },
  {
    title: "💡 Everyone Has Something to Teach",
    text: "Whether you’re a guitar lover, Excel wizard, or chess champ — your knowledge matters. Share what you know and inspire others. SkillSwap gives your skills the stage they deserve.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative px-6 md:px-12 py-20 max-w-6xl mx-auto space-y-16 z-10">
      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 z-0 opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle at 20% 30%, #5eead4, transparent 40%), radial-gradient(circle at 80% 70%, #818cf8, transparent 40%)",
        }}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <h2 className="relative z-10 text-4xl md:text-5xl font-extrabold text-center mb-10 text-gray-900">
        Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-indigo-600">SkillSwap</span>
      </h2>

      {cards.map(({ title, text }, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0px 8px 20px rgba(0,0,0,0.15)" }}
            className={`${idx % 2 === 1 ? "md:order-2" : ""} bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-300 text-gray-800 transition-all`}
          >
            <h3 className="text-2xl font-bold mb-4">{title}</h3>
            <p className="text-lg leading-relaxed">{text}</p>
          </motion.div>
          <div></div>
        </div>
      ))}
    </section>
  );
};

export default AboutSection;
