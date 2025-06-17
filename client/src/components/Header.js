import React from "react";
import { Link } from "react-router-dom";

const Header = () => (
  <header className="h-20 px-10 flex items-center justify-between sticky top-0 z-20 bg-white/10 backdrop-blur-md shadow-md">
    <div className="flex items-center space-x-0.5">
      <img src="/logo.png" alt="SkillSwap Logo" className="w-16 h-17 object-contain" />
      <a href="#home">
  <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide text-black leading-none cursor-pointer">
    Skill<span className="text-coral-400">Swap</span>
  </h1>
</a>
    </div>
    <nav className="space-x-8 text-lg font-medium">
      {["About", "Features"].map((link) => (
        <a
          key={link}
          href={`#${link.toLowerCase()}`}
          className="relative px-2 py-1 hover:text-coral-400 transition"
        >
          {link}
        </a>
      ))}
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
    </nav>
  </header>
);

export default Header;
