import React from "react";
import { Link } from "react-router-dom";
const Dashboard = () => {
  return (
    <div>
      <h1>Welcome to SkillSwap Dashboard!</h1>
      {/* You can add user info here later */}
      <Link to="/explore" className="btn-explore">
        Explore Users
      </Link>
      <Link to="/profile">My Profile</Link>
      <Link to="/live">Live Session</Link>

    </div>
  );
};

export default Dashboard;
