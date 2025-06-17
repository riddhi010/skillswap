import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef();

  // Detect outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-20 bg-white/10 backdrop-blur-md shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-1">
        <img src="/logo.png" alt="SkillSwap Logo" className="w-12 h-12 object-contain" />
        <a href="#home">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-black leading-none cursor-pointer">
            Skill<span className="text-coral-400">Swap</span>
          </h1>
        </a>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-8 text-base md:text-lg font-medium">
        {["About", "Features"].map((link) => (
          <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-coral-400 transition">
            {link}
          </a>
        ))}
        <Link to="/register" className="hover:text-coral-400">Register</Link>
        <Link to="/login" className="hover:text-coral-400">Login</Link>
      </nav>

      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
        <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-20 right-6 bg-white text-black shadow-xl rounded-lg px-6 py-4 space-y-3 w-56 md:hidden"
          >
            {["About", "Features"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="block hover:text-coral-400"
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
            <Link to="/register" className="block hover:text-coral-400" onClick={() => setIsOpen(false)}>
              Register
            </Link>
            <Link to="/login" className="block hover:text-coral-400" onClick={() => setIsOpen(false)}>
              Login
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
