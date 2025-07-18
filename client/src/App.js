import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./components/Dashboard";
import ExploreUsers from "./components/ExploreUsers"
import Profile from "./components/Profile";
import LiveSession from "./components/LiveSession";
import Home from "./pages/home";
import Loader from './components/Loader';
import PublicWall from './components/PublicWall.js';


function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3600); 

    return () => clearTimeout(timer);
  }, []);


  return (
  <>
    {loading ? (
        <Loader />
      ) : (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreUsers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/live" element={<LiveSession />} />
        <Route path="/wall" element={<PublicWall />} />
        <Route path="/" element={<Home />} />
       
      </Routes>
    </Router>
     )}
    </>
  );
}

export default App;
