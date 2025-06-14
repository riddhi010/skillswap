import React from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinSessionForm from "./JoinSessionForm";
const Dashboard = () => {
  return (
    <div>
      <h1>Welcome to SkillSwap Dashboard!</h1>
      {/* You can add user info here later */}
      <Link to="/explore" className="btn-explore">
        Explore Users
      </Link>
      <Link to="/profile">My Profile</Link>
      <Route path="/join-session" element={<JoinSessionForm />} />

    </div>
  );
};

export default Dashboard;
