import React from "react";
import { useParams } from "react-router-dom";
import LiveSession from "./components/LiveSession.js";

const LivePage = () => {
  const { username, roomId } = useParams();

  return <LiveSession username={username} roomId={roomId} />;
};

export default LivePage;
