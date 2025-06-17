import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-20 bg-white/10 backdrop-blur-md shadow-md">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="SkillSwap Logo" className="w-12 h-12 object-contain" />
        <a href="#home">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-wide text-black leading-none cursor-pointer">
            Skill<span className="text-coral-400">Swap</span>
          </h1>
        </a>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center space-x-6 text-base md:text-lg font-medium">
  {["About", "Features"].map((link) => (
    <a
      key={link}
      href={`#${link.toLowerCase()}`}
      className="hover:text-coral-400 transition px-2 py-1"
    >
      {link}
    </a>
  ))}
  <Link to="/register" className="hover:text-coral-400 transition px-2 py-1">
    Register
  </Link>
  <Link to="/login" className="hover:text-coral-400 transition px-2 py-1">
    Login
  </Link>
</nav>


      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="text-black focus:outline-none">
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="absolute top-20 right-6 bg-white text-black shadow-xl rounded-lg px-6 py-4 space-y-3 w-56 md:hidden">
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
          <Link to="/register" onClick={() => setIsOpen(false)}>Register</Link>
          <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
