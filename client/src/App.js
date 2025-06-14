import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./components/Dashboard";
import ExploreUsers from "./components/ExploreUsers"
import Profile from "./components/Profile";

import Home from "./pages/home";

import LivePage from "./pages/LivePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreUsers />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/live/:username/:roomId" element={<LivePage />} />
        <Route path="/" element={<Home />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
