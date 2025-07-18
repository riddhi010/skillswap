// 📁 client/src/LiveSession.jsx

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { candidate: e.candidate, roomId });
      }
    };

    peer.ontrack = (e) => {
  if (remoteRef.current) {
    if (!remoteRef.current.srcObject) {
      remoteRef.current.srcObject = new MediaStream();
    }
    e.streams[0].getTracks().forEach(track => {
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
    // Prevent "sender already exists" error
    localStream.current.getTracks().forEach((track) => {
      const senders = peerRef.current.getSenders();
      const alreadyAdded = senders.find((s) => s.track?.kind === track.kind);
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
  // Stop local media tracks
  if (localStream.current) {
    localStream.current.getTracks().forEach(track => track.stop());
  }

  // Close peer connection
  if (peerRef.current) {
    peerRef.current.close();
    peerRef.current = null;
  }

  // Reset video elements
  if (localRef.current) localRef.current.srcObject = null;
  if (remoteRef.current) remoteRef.current.srcObject = null;

  // Leave socket room and disconnect
  socket.emit("leave-room", roomId);
  

  // Reset UI state
  setRoomId("");
  setInputRoomId("");
  setInCall(false);
};
const toggleMic = () => {
  if (localStream.current) {
    localStream.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMicOn(prev => !prev);
  }
};

const toggleCamera = () => {
  if (localStream.current) {
    localStream.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsCamOn(prev => !prev);
  }
};



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
  {!inCall ? (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-full max-w-md text-center">
      <h1 className="text-2xl font-bold text-indigo-600">Welcome to Live Session</h1>
      <button
        onClick={handleCreateRoom}
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
      >
        Create New Meeting
      </button>
      <input
        type="text"
        placeholder="Enter Meeting ID"
        value={inputRoomId}
        onChange={(e) => setInputRoomId(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <button
        onClick={() => joinRoom(inputRoomId)}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Join Meeting
      </button>
    </div>
  ) : (
    <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-lg space-y-6">
      <p className="text-lg text-center text-gray-700 font-semibold">
        Meeting ID: <span className="text-indigo-500">{roomId}</span>
      </p>

      <div className="flex flex-col md:flex-row justify-center gap-4 items-center">
        <video
          ref={localRef}
          autoPlay
          muted
          playsInline
          className="rounded-lg border border-gray-300 w-full md:w-[45%]"
        />
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="rounded-lg border border-gray-300 w-full md:w-[45%]"
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={leaveCall}
          className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
        >
          Leave Meeting
        </button>
        <button
          onClick={toggleMic}
          className="bg-gray-700 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
        >
          {isMicOn ? "Mute Mic 🎙️" : "Unmute Mic 🔇"}
        </button>
        <button
          onClick={toggleCamera}
          className="bg-gray-700 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
        >
          {isCamOn ? "Turn Off Camera 🎥" : "Turn On Camera 🚫"}
        </button>
      </div>
    </div>
  )}
</div>

  );
};

export default LiveSession;
