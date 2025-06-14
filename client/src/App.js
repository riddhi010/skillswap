import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./components/Dashboard";
import ExploreUsers from "./components/ExploreUsers"
import Profile from "./components/Profile";

import Home from "./pages/home";

import LiveSession from "./components/LiveSession";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreUsers />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/live" element={<LiveSession />} />
        <Route path="/" element={<Home />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
