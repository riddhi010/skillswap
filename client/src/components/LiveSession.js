
// 📁 client/src/LiveSession.jsx

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  VideoIcon,
  Plus,
  LogIn,
} from "lucide-react";

const socket = io("https://skillswap-backend-jxyu.onrender.com");

const LiveSession = () => {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [inCall, setInCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const localStream = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    socket.on("user-joined", () => {
      if (!peerRef.current) {
        callUser();
      }
    });

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleCandidate);

    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [roomId]);

  const handleCreateRoom = async () => {
    const id = Math.random().toString(36).substring(2, 10);
    await joinRoom(id);
  };

  const joinRoom = async (id) => {
    setRoomId(id);
    setInCall(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localRef.current.srcObject = stream;
      localStream.current = stream;
      socket.emit("join-room", id);
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  const callUser = async () => {
    peerRef.current = createPeer();

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, localStream.current);
      });
    }

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("offer", { offer, roomId });
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { candidate: e.candidate, roomId });
      }
    };

    peer.ontrack = (e) => {
      if (remoteRef.current && !remoteRef.current.srcObject) {
        remoteRef.current.srcObject = new MediaStream();
        e.streams[0].getTracks().forEach((track) => {
          remoteRef.current.srcObject.addTrack(track);
        });
      }
    };

    return peer;
  };

  const handleOffer = async ({ offer }) => {
    if (!peerRef.current) {
      peerRef.current = createPeer();
    }
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        const alreadyAdded = peerRef.current
          .getSenders()
          .find((s) => s.track?.kind === track.kind);
        if (!alreadyAdded) {
          peerRef.current.addTrack(track, localStream.current);
        }
      });
    }

    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    socket.emit("answer", { answer, roomId });
  };

  const handleAnswer = async ({ answer }) => {
    await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = async ({ candidate }) => {
    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  };

  const leaveCall = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;
    socket.emit("leave-room", roomId);
    setRoomId("");
    setInputRoomId("");
    setInCall(false);
  };

  const toggleMic = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMicOn((prev) => !prev);
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCamOn((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 text-white px-4 pt-24 pb-10">
  {/* Navbar */}
  <nav className="bg-white shadow-md px-4 sm:px-10 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
    <h2 className="text-lg sm:text-xl font-bold text-indigo-600">SkillSwap</h2>
    <div className="flex items-center space-x-4 sm:space-x-6">
      <Link to="/explore" className="text-gray-700 hover:text-indigo-600 text-sm sm:text-base font-medium">Explore Users</Link>
      <Link to="/live" className="text-gray-700 hover:text-indigo-600 text-sm sm:text-base font-medium">Live Session</Link>
      <Link to="/profile" className="text-gray-700 hover:text-indigo-600 text-2xl">
        <FaUserCircle />
      </Link>
    </div>
  </nav>

  {!inCall ? (
    <div className="flex flex-col items-center space-y-6 max-w-md mx-auto mt-12 sm:mt-20 bg-white/10 p-6 rounded-xl shadow-xl backdrop-blur">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">Join or Create a Session</h2>

      <button
        onClick={handleCreateRoom}
        className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-full font-semibold text-sm sm:text-base"
      >
        <Plus size={20} /> Create Meeting
      </button>

      <input
        type="text"
        placeholder="Enter Meeting ID"
        value={inputRoomId}
        onChange={(e) => setInputRoomId(e.target.value)}
        className="w-full px-4 py-2 rounded-lg text-black focus:outline-none text-sm sm:text-base"
      />

      <button
        onClick={() => joinRoom(inputRoomId)}
        className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full font-semibold text-sm sm:text-base"
      >
        <LogIn size={20} /> Join Meeting
      </button>
    </div>
  ) : (
    <div className="flex flex-col items-center space-y-6 mt-8 sm:mt-12 px-2">
      <h3 className="text-lg sm:text-xl">Meeting ID: <span className="font-mono break-all">{roomId}</span></h3>

      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <video ref={localRef} autoPlay muted playsInline className="rounded-xl shadow-lg w-full sm:w-80 border border-white" />
        <video ref={remoteRef} autoPlay playsInline className="rounded-xl shadow-lg w-full sm:w-80 border border-white" />
      </div>

      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        <button onClick={toggleMic} className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button onClick={toggleCamera} className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition">
          {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
        <button onClick={leaveCall} className="bg-red-500 hover:bg-red-600 p-3 rounded-full text-white">
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default LiveSession;
